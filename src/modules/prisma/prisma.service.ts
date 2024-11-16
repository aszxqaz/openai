import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ResultAsync } from 'neverthrow';
import {
  ForeignKeyConstraintViolation,
  PrismaError,
  UniqueConstraintViolation,
  UnknownError,
  UpdateRecordNotFound,
} from './errors';

@Injectable()
export class PrismaService extends PrismaClient {
  private logger = new Logger();

  constructor(config: ConfigService) {
    const url = config.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
    this.mapError = this.mapError.bind(this);
  }

  exec<T>(fn: Promise<T>): ResultAsync<T, PrismaError> {
    return ResultAsync.fromPromise(fn, this.mapError);
  }

  private mapError(e: PrismaClientKnownRequestError): PrismaError {
    this.logger.error(e);

    switch (e.code) {
      case 'P2002':
        return new UniqueConstraintViolation(e);
      case 'P2003':
        return new ForeignKeyConstraintViolation(e);
      case 'P2025':
        return new UpdateRecordNotFound(e);
      default:
        return new UnknownError(e);
    }
  }
}
