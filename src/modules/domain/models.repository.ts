import { Injectable } from '@nestjs/common';
import { Model } from '@prisma/client';
import { err, ok, ResultAsync } from 'neverthrow';
import { OmitPartial } from 'src/common/types';
import { PrismaErrorCode, PrismaService } from 'src/modules/prisma';

export enum ModelRepositoryError {
  ModelNotFound = 'ModelRepositoryError.ModelNotFound',
  ModelAlreadyExist = 'ModelRepositoryError.ModelAlreadyExist',
  InternalError = 'ModelRepositoryError.InternalError',
}

@Injectable()
export class ModelsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Omit<Model, 'id'>) {
    const query = this.prisma.model.create({
      data,
    });

    return this.prisma.exec(query).mapErr(e => {
      switch (e.code) {
        case PrismaErrorCode.UniqueConstraintViolation:
          return ModelRepositoryError.ModelAlreadyExist as const;
        default:
          return ModelRepositoryError.InternalError as const;
      }
    });
  }

  findAll() {
    return ResultAsync.fromPromise(
      this.prisma.model.findMany(),
      e => ModelRepositoryError.InternalError as const,
    );
  }

  findByName(name: Model['name']) {
    return ResultAsync.fromPromise(
      this.prisma.model.findUnique({
        where: { name },
      }),
      e => ModelRepositoryError.InternalError as const,
    ).andThen(model => {
      if (!model) {
        return err(ModelRepositoryError.ModelNotFound as const);
      }
      return ok(model);
    });
  }

  update(id: Model['id'], data: OmitPartial<Model, 'id'>) {
    const query = this.prisma.model.update({
      where: { id },
      data,
    });

    return this.prisma
      .exec(query)
      .mapErr(e => {
        switch (e.code) {
          case PrismaErrorCode.UpdateRecordNotFound:
            return ModelRepositoryError.ModelNotFound as const;
          default:
            return ModelRepositoryError.InternalError as const;
        }
      })
      .andThen(model =>
        !model ? err(ModelRepositoryError.ModelNotFound as const) : ok(model),
      );
  }
}
