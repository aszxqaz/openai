import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Account } from '@prisma/client';
import { RequestorParam } from 'src/common/decorators';
import { AdminOnly } from 'src/common/guards';
import { UserIdParam } from 'src/common/params';
import { Account as AccountSchema } from 'src/common/swagger';
import { Requestor } from 'src/common/types';
import {
  AccountService,
  AmountQuery,
  CreditAccountError,
  CreditQuery,
  CreditResponse,
  DebitQuery,
  DebitResponse,
  QueryAccountError,
} from '.';

@ApiTags('Accounts')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'User not logged in' })
@ApiInternalServerErrorResponse({ description: 'Server error' })
//
@Controller()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: 'Get current user account' })
  @ApiResponse({
    description: 'Success',
    type: AccountSchema,
    status: HttpStatus.OK,
  })
  @Get('account')
  current(@RequestorParam() { id }: Requestor): Promise<Account> {
    return this.accountService.queryOne({ userId: id }).match(
      ({ account }) => account,
      e => {
        switch (e) {
          case QueryAccountError.AccountNotFound:
            throw new InternalServerErrorException('Account not found');
          case QueryAccountError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }

  @ApiOperation({ summary: 'Get account info (admin only)' })
  @ApiForbiddenResponse({ description: 'You are not an admin' })
  // @ApiParam(UserIdParam.asApiParamOptions)
  @ApiResponse({
    type: AccountSchema,
    status: HttpStatus.OK,
    description: 'Success',
  })
  //
  @AdminOnly()
  @Get('users/:userId/account')
  findOne(@Param() { userId }: UserIdParam): Promise<Account> {
    return this.accountService.queryOne({ userId }).match(
      ({ account }) => account,
      e => {
        switch (e) {
          case QueryAccountError.AccountNotFound:
            throw new InternalServerErrorException('Account not found');
          case QueryAccountError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }

  @ApiOperation({ summary: 'Credit an account (admin only)' })
  @ApiForbiddenResponse({ description: 'You are not an admin' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountSchema,
    description: 'Success',
  })
  //
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @Post('users/:userId/account/credit')
  credit(
    @Param() { userId }: UserIdParam,
    @Query() { amount }: CreditQuery,
  ): Promise<CreditResponse> {
    return this._credit(userId, amount);
  }

  @ApiOperation({ summary: 'Debit an account (admin only)' })
  @ApiForbiddenResponse({
    description: 'You are not an admin',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: AccountSchema,
    description: 'Success',
  })
  //
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @Post('users/:userId/account/debit')
  debit(
    @Param() { userId }: UserIdParam,
    @Query() { amount }: DebitQuery,
  ): Promise<DebitResponse> {
    return this._credit(userId, -amount);
  }

  private _credit(
    userId: UserIdParam['userId'],
    amount: AmountQuery['amount'],
  ) {
    return this.accountService.credit({ userId, amount }).match(
      ({ account }) => account,
      e => {
        switch (e) {
          case CreditAccountError.AccountNotFound:
            throw new NotFoundException('Account not found');
          case CreditAccountError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }
}
