import { Injectable, Logger } from '@nestjs/common';
import { Account, Model } from '@prisma/client';
import { Result, ResultAsync, err, ok } from 'neverthrow';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import {
  AccountRepository,
  AccountRepositoryError,
  ModelRepositoryError,
  ModelsRepository,
} from 'src/modules/domain';
import {
  OpenAIService,
  OpenAIServiceError,
  OpenAIServiceErrorCode,
} from 'src/modules/openai';
import {
  CreateCompletionArgs,
  CreateCompletionError,
  CreateCompletionResult,
  CreateCompletionStreamArgs,
  CreateCompletionStreamResult,
} from '.';

@Injectable()
export class ChatService {
  private logger = new Logger();

  constructor(
    private readonly openai: OpenAIService,
    private readonly models: ModelsRepository,
    private readonly accounts: AccountRepository,
  ) {
    this.chargeCreditsFromAccount = this.chargeCreditsFromAccount.bind(this);
    this.mapModelRepositoryError = this.mapModelRepositoryError.bind(this);
    this.mapOpenAIServiceError = this.mapOpenAIServiceError.bind(this);
    this.checkCreditsSufficiency = this.checkCreditsSufficiency.bind(this);
  }

  createCompletion({
    options,
    userId,
  }: CreateCompletionArgs): ResultAsync<
    CreateCompletionResult,
    CreateCompletionError
  > {
    return ResultAsync.combine([
      this.models
        .findByName(options.model)
        .mapErr(this.mapModelRepositoryError),
      this.accounts.find(userId).mapErr(this.mapAccountRepositoryError),
    ])
      .andThen(this.checkCreditsSufficiency)
      .andThen(data =>
        this.openai
          .createChatCompletion(options)
          .mapErr(this.mapOpenAIServiceError)
          .map(completion => [...data, completion] as const),
      )
      .andThen(data =>
        this.chargeCreditsFromAccount(data).map(
          creditsCharged => [...data, creditsCharged] as const,
        ),
      )
      .map(([_, __, completion, creditsCharged]) => ({
        completion,
        creditsCharged,
      }));
  }

  createChatCompletionStream(
    args: CreateCompletionStreamArgs,
  ): ResultAsync<
    AsyncGenerator<
      Result<CreateCompletionStreamResult, CreateCompletionError>,
      void,
      unknown
    >,
    CreateCompletionError
  > {
    const { options, userId } = args;
    return ResultAsync.combine([
      this.models
        .findByName(options.model)
        .mapErr(this.mapModelRepositoryError),
      this.accounts.find(userId).mapErr(this.mapAccountRepositoryError),
    ])
      .andThen(this.checkCreditsSufficiency)
      .map(([model, account]) => this.getChunkGenerator(args, model, account));
  }

  private async *getChunkGenerator(
    args: CreateCompletionStreamArgs,
    model: Model,
    account: Account,
  ): AsyncGenerator<
    Result<CreateCompletionStreamResult, CreateCompletionError>,
    void,
    unknown
  > {
    const stream = this.openai.createChatCompletionStream(args);
    for await (const chunk of stream) {
      let creditsCharged: number;
      if (chunk.usage) {
        const creditsChargedResult = await this.chargeCreditsFromAccount([
          model,
          account,
          chunk,
        ]);
        if (creditsChargedResult.isErr()) {
          const e = creditsChargedResult._unsafeUnwrapErr();
          yield err(e);
          continue;
        }
        creditsCharged = creditsChargedResult._unsafeUnwrap();
      }
      yield ok({ chunk, creditsCharged });
    }
  }

  private chargeCreditsFromAccount([model, account, completion]: readonly [
    Model,
    Account,
    ChatCompletion | ChatCompletionChunk,
  ]) {
    return ResultAsync.fromSafePromise(
      Promise.resolve(completion.usage.total_tokens * model.creditsPerToken),
    ).andThen(amount =>
      this.accounts
        .credit(account.userId, -amount)
        .map(_ => amount)
        .mapErr(e => {
          switch (e) {
            case AccountRepositoryError.AccountNotFound:
              return CreateCompletionError.AccountNotFound as const;

            case AccountRepositoryError.InternalError:
              return CreateCompletionError.InternalError as const;
          }
        }),
    );
  }

  private checkCreditsSufficiency([model, account]: [Model, Account]) {
    if (account.availableCredits < model.creditsPerToken) {
      return err(CreateCompletionError.InsufficientCredits);
    }
    return ok([model, account] as const);
  }

  private mapOpenAIServiceError(e: OpenAIServiceError) {
    switch (e.code) {
      case OpenAIServiceErrorCode.Unknown:
      case OpenAIServiceErrorCode.InternalError:
        return CreateCompletionError.InternalError;

      case OpenAIServiceErrorCode.NotFound:
        return CreateCompletionError.ModelNotFound;

      case OpenAIServiceErrorCode.BadRequest:
        return CreateCompletionError.BadRequest;
    }
  }

  private mapModelRepositoryError(e: ModelRepositoryError) {
    switch (e) {
      case ModelRepositoryError.ModelNotFound:
        return CreateCompletionError.ModelNotFound;

      case ModelRepositoryError.InternalError:
        return CreateCompletionError.InternalError;
    }
  }

  private mapAccountRepositoryError(e: AccountRepositoryError) {
    switch (e) {
      case AccountRepositoryError.AccountNotFound:
        return CreateCompletionError.AccountNotFound;

      case AccountRepositoryError.InternalError:
        return CreateCompletionError.InternalError;
    }
  }
}
