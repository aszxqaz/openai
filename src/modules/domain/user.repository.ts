import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ResultAsync, err, ok } from 'neverthrow';
import { OmitPartial } from 'src/common/types';
import { PrismaErrorCode, PrismaService } from 'src/modules/prisma';

export enum UserRepositoryError {
  UserAlreadyExists = 'UserRepositoryError.UserAlreadyExists',
  InternalError = 'UserRepositoryError.InternalError',
  UserNotFound = 'UserRepositoryError.UserNotFound',
}

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: OmitPartial<User, 'id'> & Pick<User, 'username'>) {
    const query = this.prisma.user.create({
      data,
    });

    return this.prisma.exec(query).mapErr(e => {
      switch (e.code) {
        case PrismaErrorCode.UniqueConstraintViolation:
          return UserRepositoryError.UserAlreadyExists;
        default:
          return UserRepositoryError.InternalError;
      }
    });
  }

  findAll() {
    return ResultAsync.fromPromise(
      this.prisma.user.findMany(),
      e => UserRepositoryError.InternalError as const,
    );
  }

  find(id: User['id']) {
    return ResultAsync.fromPromise(
      this.prisma.user.findUnique({
        where: { id },
      }),
      e => UserRepositoryError.InternalError,
    ).andThen(user => {
      if (!user) {
        return err(UserRepositoryError.UserNotFound);
      }
      return ok(user);
    });
  }

  findByUsername(username: User['username']) {
    return ResultAsync.fromPromise(
      this.prisma.user.findUnique({
        where: { username },
      }),
      e => {
        console.log(e);
        return UserRepositoryError.InternalError as const;
      },
    ).andThen(user => {
      if (!user) {
        return err(UserRepositoryError.UserNotFound as const);
      }
      return ok(user);
    });
  }

  update(id: User['id'], data: OmitPartial<User, 'id'>) {
    const query = this.prisma.user.update({
      where: { id },
      data,
    });

    return this.prisma
      .exec(query)
      .mapErr(e => {
        switch (e.code) {
          case PrismaErrorCode.UpdateRecordNotFound:
            return UserRepositoryError.UserNotFound as const;
          default:
            return UserRepositoryError.InternalError as const;
        }
      })
      .andThen(user =>
        !user ? err(UserRepositoryError.UserNotFound as const) : ok(user),
      );
  }
}
