import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Requestor } from 'src/common/auth';
import { RequestorParam } from 'src/common/decorators';

import {
  LoginRequestBody,
  LoginResponse,
  MeResponse,
  RegisterRequestBody,
  RegisterResponse,
} from './auth.controller.types';
import { Public } from './auth.guard';
import { AuthService } from './auth.service';
import {
  GenerateTokenError,
  RegisterError,
  VerifyPasswordError,
} from './auth.service.types';

@ApiTags('Authentication')
@ApiInternalServerErrorResponse({ description: 'Server error' })
//
@Controller('auth')
export class AuthController {
  private logger = new Logger();

  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a user' })
  @ApiNoContentResponse({ description: 'User registered successfully' })
  @ApiConflictResponse({
    description: 'User with this username already registered',
  })
  @ApiBadRequestResponse({ description: 'Invalid request body parameters' })
  //
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('register')
  register(@Body() data: RegisterRequestBody): Promise<RegisterResponse> {
    return this.authService
      .register({
        startingCredits: 1000,
        ...data,
      })
      .match(
        user => {},
        e => {
          switch (e) {
            case RegisterError.UserAlreadyExists:
              throw new ConflictException(
                'Username with this username already exists',
              );
            case RegisterError.InternalError:
              throw new InternalServerErrorException('Something went wrong');
          }
        },
      );
  }

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: LoginResponse,
  })
  @ApiBadRequestResponse({ description: 'Invalid request body parameters' })
  @ApiUnauthorizedResponse({ description: 'Invalid username or password' })
  //
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() data: LoginRequestBody): Promise<LoginResponse> {
    const { password, username } = data;
    return this.authService
      .verifyPassword({
        username,
        password,
      })
      .andThen(user =>
        this.authService
          .generateToken({ userId: user.id })
          .map(token => [user, token] as const),
      )
      .match(
        ([user, token]) => ({ user, token }),
        e => {
          switch (e) {
            case VerifyPasswordError.UserNotFound:
            case VerifyPasswordError.CredentialsNotFound:
            case VerifyPasswordError.WrongPassword:
              throw new UnauthorizedException('Invalid username or password');

            case VerifyPasswordError.InternalError:
              throw new InternalServerErrorException('Something went wrong');

            case GenerateTokenError.SignFailed:
              throw new InternalServerErrorException('Failed to get token');
          }
        },
      );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently logged in user' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: MeResponse,
  })
  @ApiUnauthorizedResponse({ description: 'User not logged in' })
  //
  @Get('me')
  me(@RequestorParam() requestor: Requestor): Promise<MeResponse> {
    return Promise.resolve(requestor.toUser());
  }
}
