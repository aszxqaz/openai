import { Injectable } from '@nestjs/common';
import { AccountRepository, AccountRepositoryError } from 'src/modules/domain';
import {
  CreditAccountArgs,
  CreditAccountError,
  QueryAccountArgs,
  QueryAccountError,
} from './account.service.types';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  queryOne({ userId }: QueryAccountArgs) {
    return this.accountRepository
      .find(userId)
      .map(account => ({ account }))
      .mapErr(e => {
        switch (e) {
          case AccountRepositoryError.AccountNotFound:
            return QueryAccountError.AccountNotFound as const;

          case AccountRepositoryError.InternalError:
            return QueryAccountError.InternalError as const;
        }
      });
  }

  credit({ userId, amount }: CreditAccountArgs) {
    return this.accountRepository
      .credit(userId, amount)
      .map(account => ({ account }))
      .mapErr(e => {
        switch (e) {
          case AccountRepositoryError.AccountNotFound:
            return CreditAccountError.AccountNotFound as const;

          case AccountRepositoryError.InternalError:
            return CreditAccountError.InternalError as const;
        }
      });
  }
}
