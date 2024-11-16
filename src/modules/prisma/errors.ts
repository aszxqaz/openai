import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export enum PrismaErrorCode {
  Unknown,
  UniqueConstraintViolation,
  ForeignKeyConstraintViolation,
  UpdateRecordNotFound,
}

export class PrismaError {
  public readonly orig: unknown;
  public readonly code: PrismaErrorCode;
}

export class UnknownError extends PrismaError {
  public readonly code = PrismaErrorCode.Unknown;

  constructor(public readonly orig: unknown) {
    super();
  }
}

export class UniqueConstraintViolation extends PrismaError {
  public readonly code =
    PrismaErrorCode.UniqueConstraintViolation;

  public readonly targets: string[];

  constructor(
    public readonly orig: PrismaClientKnownRequestError,
  ) {
    super();
    this.targets = orig.meta?.target as string[];
  }
}

export class ForeignKeyConstraintViolation extends PrismaError {
  public readonly code =
    PrismaErrorCode.ForeignKeyConstraintViolation;

  public readonly field: string;

  constructor(
    public readonly orig: PrismaClientKnownRequestError,
  ) {
    super();
    const fieldName = orig.meta?.['field_name'] as string;
    this.field = fieldName.match(/_(.*)_fkey/)![1];
  }
}

export class UpdateRecordNotFound extends PrismaError {
  public readonly code =
    PrismaErrorCode.UpdateRecordNotFound;

  public readonly model: string;

  constructor(
    public readonly orig: PrismaClientKnownRequestError,
  ) {
    super();
    this.model = orig.meta?.['modelName'] as string;
  }
}
