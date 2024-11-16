import { User, UserRole } from '@prisma/client';

export enum RegisterError {
  UserAlreadyExists = 'RegisterError.UserAlreadyExists',
  InternalError = 'RegisterError.InternalError',
}

export type RegisterArgs = {
  username: string;
  password: string;
  role?: UserRole;
  startingCredits?: number;
};

export enum VerifyPasswordError {
  UserNotFound = 'VerifyPasswordError.UserNotFound',
  CredentialsNotFound = 'VerifyPasswordError.CredentialsNotFound',
  InternalError = 'VerifyPasswordError.InternalError',
  WrongPassword = 'VerifyPasswordError.WrongPassword',
}

export type VerifyPasswordArgs = {
  username: string;
  password: string;
};

export type VerifyPasswordResult = {
  user: User;
};

export enum GenerateTokenError {
  SignFailed = 'GenerateTokenError.SignFailed',
}
