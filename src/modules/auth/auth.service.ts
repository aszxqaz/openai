import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { err, ok, ResultAsync } from 'neverthrow';
import { AuthTokenPayload } from 'src/common/auth';
import {
  AccountRepository,
  AccountRepositoryError,
  CredentialsRepository,
  CredentialsRepositoryError,
  UserRepository,
  UserRepositoryError,
} from 'src/modules/domain';
import {
  GenerateTokenError,
  RegisterArgs,
  RegisterError,
  VerifyPasswordArgs,
  VerifyPasswordError,
} from './auth.service.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly accounts: AccountRepository,
    private readonly credentials: CredentialsRepository,
    private readonly jwtService: JwtService,
  ) {}

  register(args: RegisterArgs): ResultAsync<User, RegisterError> {
    const { username, password, startingCredits, role } = args;

    return this.users
      .create({ username, role })
      .andThen(user =>
        this.accounts
          .create(user.id, {
            availableCredits: startingCredits,
          })
          .map(() => user),
      )
      .andThrough(user => {
        return ResultAsync.fromSafePromise(
          hash(password).then(hash =>
            this.credentials.create(user.id, { hash }),
          ),
        );
      })
      .mapErr(e => {
        switch (e) {
          case UserRepositoryError.UserAlreadyExists:
            return RegisterError.UserAlreadyExists;

          case UserRepositoryError.InternalError:
          case AccountRepositoryError.InternalError:
            return RegisterError.InternalError;
        }
      });
  }

  verifyPassword(
    req: VerifyPasswordArgs,
  ): ResultAsync<User, VerifyPasswordError> {
    return this.users
      .findByUsername(req.username)
      .mapErr(e => {
        switch (e) {
          case UserRepositoryError.InternalError:
            return VerifyPasswordError.InternalError;
          case UserRepositoryError.UserNotFound:
            return VerifyPasswordError.UserNotFound;
        }
      })
      .andThen(user =>
        this.credentials
          .find(user.id)
          .map(credentials => [user, credentials] as const)
          .mapErr(e => {
            switch (e) {
              case CredentialsRepositoryError.InternalError:
                return VerifyPasswordError.InternalError;
              case CredentialsRepositoryError.CredentialsNotFound:
                return VerifyPasswordError.CredentialsNotFound;
            }
          }),
      )
      .andThen(([user, credentials]) => {
        return ResultAsync.fromSafePromise(
          verify(credentials.hash, req.password),
        ).andThen(isValid =>
          isValid ? ok(user) : err(VerifyPasswordError.WrongPassword),
        );
      });
  }

  generateToken(
    payload: AuthTokenPayload,
  ): ResultAsync<string, GenerateTokenError> {
    return ResultAsync.fromPromise(
      this.jwtService.signAsync(payload),
      _ => GenerateTokenError.SignFailed,
    );
  }
}
