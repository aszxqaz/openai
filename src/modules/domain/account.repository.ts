import { Injectable, Logger } from '@nestjs/common';
import { Account, User } from '@prisma/client';
import { err, ok, ResultAsync } from 'neverthrow';
import { OmitPartial } from 'src/common/types';
import {
  PrismaError,
  PrismaErrorCode,
  PrismaService,
} from 'src/modules/prisma';

export enum AccountRepositoryError {
  AccountNotFound = 'AccountRepositoryError.AccountNotFound',
  AccountAlreadyExists = 'AccountRepositoryError.AccountAlreadyExists',
  InternalError = 'AccountRepositoryError.InternalError',
}

@Injectable()
export class AccountRepository {
  private logger = new Logger();

  constructor(private readonly prisma: PrismaService) {}

  create(userId: User['id'], data: OmitPartial<Account, 'userId'>) {
    const query = this.prisma.account.create({
      data: {
        userId,
        ...data,
      },
    });

    return this.prisma.exec(query).mapErr(this.mapCreateError);
  }

  find(userId: User['id']) {
    return ResultAsync.fromPromise(
      this.prisma.account.findUnique({ where: { userId } }),
      e => AccountRepositoryError.InternalError as const,
    ).andThen(this.checkFound(AccountRepositoryError.AccountNotFound as const));
  }

  update(userId: User['id'], data: OmitPartial<Account, 'userId'>) {
    const query = this.prisma.account.update({
      where: { userId },
      data,
    });

    return this.prisma
      .exec(query)
      .mapErr(this.mapUpdateError)
      .andThen(this.checkFound(AccountRepositoryError.AccountNotFound));
  }

  credit(userId: User['id'], amount: number) {
    const query = this.prisma.account.update({
      where: { userId },
      data: {
        availableCredits: {
          increment: amount,
        },
      },
    });

    return this.prisma
      .exec(query)
      .mapErr(this.mapUpdateError)
      .andThen(this.checkFound(AccountRepositoryError.AccountNotFound));
  }

  private mapCreateError(e: PrismaError) {
    switch (e.code) {
      case PrismaErrorCode.UniqueConstraintViolation:
        return AccountRepositoryError.AccountAlreadyExists as const;
      default:
        return AccountRepositoryError.InternalError as const;
    }
  }

  private mapUpdateError(e: PrismaError) {
    switch (e.code) {
      case PrismaErrorCode.UpdateRecordNotFound:
        return AccountRepositoryError.AccountNotFound as const;
      default:
        return AccountRepositoryError.InternalError as const;
    }
  }

  private checkFound<T>(e: AccountRepositoryError) {
    return (entity: T) => (entity == null ? err(e) : ok(entity));
  }
}
