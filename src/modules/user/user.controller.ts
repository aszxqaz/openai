import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { AdminOnly } from 'src/common/guards';
import { UserIdParam } from 'src/common/params';
import { User as UserSchema } from 'src/common/swagger';
import { UserRepository, UserRepositoryError } from 'src/modules/domain';
import { UpdateSecureUserQuery } from '.';

@ApiTags('Users')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'User not logged in' })
@ApiInternalServerErrorResponse({ description: 'Server error' })
//
@Controller('users')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  @ApiOperation({ summary: 'Get list of users' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: [UserSchema],
  })
  //
  @Get('')
  findAll(): Promise<User[]> {
    return this.userRepository.findAll().match(
      users => users,
      e => {
        switch (e) {
          case UserRepositoryError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiForbiddenResponse({ description: 'You are not an admin' })
  @ApiBadRequestResponse({
    description: 'Invalid request query or path params',
  })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: UserSchema,
  })
  //
  @AdminOnly()
  @Patch(':userId')
  updateSecure(
    @Param() { userId }: UserIdParam,
    @Query() { role }: UpdateSecureUserQuery,
  ): Promise<User> {
    return this.userRepository.update(userId, { role }).match(
      user => user,
      e => {
        switch (e) {
          case UserRepositoryError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
          case UserRepositoryError.UserNotFound:
            throw new NotFoundException('User not found');
        }
      },
    );
  }
}
