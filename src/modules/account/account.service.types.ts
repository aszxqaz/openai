import { Account } from '@prisma/client';

export type QueryAccountArgs = {
  userId: Account['userId'];
};

export type QueryAccountResult = {
  account: Account;
};

export enum QueryAccountError {
  AccountNotFound = 'QueryAccountError.AccountNotFound',
  InternalError = 'QueryAccountError.InternalError',
}

export type CreditAccountArgs = {
  userId: Account['userId'];
  amount: number;
};

export type CreditAccountResult = {
  account: Account;
};

export enum CreditAccountError {
  AccountNotFound = 'CreditAccountError.AccountNotFound',
  InternalError = 'CreditAccountError.InternalError',
}
