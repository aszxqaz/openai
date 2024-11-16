import { Injectable } from '@nestjs/common';
import { Credentials, User } from '@prisma/client';
import { err, ok, ResultAsync } from 'neverthrow';
import { OmitPartial } from 'src/common/types';
import { PrismaErrorCode, PrismaService } from 'src/modules/prisma';

export enum CredentialsRepositoryError {
  CredentialsNotFound = 'CredentialsRepositoryError.CredentialsNotFound',
  CredentialsAlreadyExist = 'CredentialsRepositoryError.CredentialsAlreadyExist',
  InternalError = 'CredentialsRepositoryError.InternalError',
}

@Injectable()
export class CredentialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: User['id'], data: Omit<Credentials, 'userId'>) {
    const query = this.prisma.credentials.create({
      data: {
        userId,
        ...data,
      },
    });

    return this.prisma.exec(query).mapErr(e => {
      switch (e.code) {
        case PrismaErrorCode.UniqueConstraintViolation:
          return CredentialsRepositoryError.CredentialsAlreadyExist;
        default:
          return CredentialsRepositoryError.InternalError;
      }
    });
  }

  find(userId: User['id']) {
    return ResultAsync.fromPromise(
      this.prisma.credentials.findUnique({
        where: { userId },
      }),
      e => CredentialsRepositoryError.InternalError as const,
    ).andThen(creds => {
      if (!creds) {
        return err(CredentialsRepositoryError.CredentialsNotFound as const);
      }
      return ok(creds);
    });
  }

  update(userId: User['id'], data: OmitPartial<Credentials, 'userId'>) {
    const query = this.prisma.credentials.update({
      where: { userId },
      data,
    });

    return this.prisma
      .exec(query)
      .mapErr(e => {
        switch (e.code) {
          case PrismaErrorCode.UpdateRecordNotFound:
            return CredentialsRepositoryError.CredentialsNotFound;
          default:
            return CredentialsRepositoryError.InternalError;
        }
      })
      .andThen(creds =>
        !creds
          ? err(CredentialsRepositoryError.CredentialsNotFound)
          : ok(creds),
      );
  }
}
