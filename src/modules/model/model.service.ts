import { Injectable } from '@nestjs/common';
import { Model } from '@prisma/client';
import { ResultAsync } from 'neverthrow';
import {
  ModelRepositoryError,
  ModelsRepository,
} from 'src/modules/domain/models.repository';

type CreateModelArgs = Omit<Model, 'id'>;

type CreateModelResult = {
  model: Model;
};

export enum CreateModelError {
  InternalError = 'CreateModelError.InternalError',
  ModelAlreadyExist = 'CreateModelError.ModelAlreadyExist',
}

export type QueryModelsArgs = {};

export type QueryModelsResult = {
  models: Model[];
};

export enum QueryModelsError {
  InternalError = 'QueryModelsError.InternalError',
}

export type QueryModelArgs = {
  name: Model['name'];
};

export type QueryModelResult = {
  model: Model;
};

export enum QueryModelError {
  InternalError = 'QueryModelError.InternalError',
  ModelNotFound = 'QueryModelError.ModelNotFound',
}

@Injectable()
export class ModelService {
  constructor(private readonly models: ModelsRepository) {}

  create(
    args: CreateModelArgs,
  ): ResultAsync<CreateModelResult, CreateModelError> {
    return this.models
      .create(args)
      .map(model => ({ model }))
      .mapErr(e => {
        switch (e) {
          case ModelRepositoryError.ModelAlreadyExist:
            return CreateModelError.ModelAlreadyExist;
          case ModelRepositoryError.InternalError:
            return CreateModelError.InternalError;
        }
      });
  }

  queryAll(
    _: QueryModelsArgs,
  ): ResultAsync<QueryModelsResult, QueryModelsError> {
    return this.models
      .findAll()
      .map(models => ({ models }))
      .mapErr(e => {
        switch (e) {
          case ModelRepositoryError.InternalError:
            return QueryModelsError.InternalError;
        }
      });
  }

  queryOne(
    query: QueryModelArgs,
  ): ResultAsync<QueryModelResult, QueryModelError> {
    return this.models
      .findByName(query.name)
      .map(model => ({ model }))
      .mapErr(e => {
        switch (e) {
          case ModelRepositoryError.ModelNotFound:
            return QueryModelError.ModelNotFound;
          case ModelRepositoryError.InternalError:
            return QueryModelError.InternalError;
        }
      });
  }
}
