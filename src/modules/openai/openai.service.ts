import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { err, ok, ResultAsync } from 'neverthrow';
import OpenAI from 'openai';
import { ChatCompletion } from 'openai/resources';
import {
  OpenAIServiceError,
  OpenAIServiceErrorCode,
} from './openai.service.errors';
import {
  CreateChatCompletionArgs,
  CreateChatCompletionStreamArgs,
} from './openai.service.types';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly logger: Logger = new Logger(OpenAIService.name);

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get<string>('OPENAI_API_KEY'),
      baseURL: config.get<string>('OPENAI_BASE_URL'),
    });
  }

  createChatCompletion(
    data: CreateChatCompletionArgs,
  ): ResultAsync<ChatCompletion, OpenAIServiceError> {
    return ResultAsync.fromPromise(
      this.client.chat.completions.create({
        ...data,
        stream: false,
      }),
      e =>
        new OpenAIServiceError(
          OpenAIServiceErrorCode.InternalError,
          'Something went wrong',
        ),
    ).andThen(completion =>
      'error' in completion ? err(this.mapError(completion)) : ok(completion),
    );
  }

  async *createChatCompletionStream({
    options: data,
    onAbort,
  }: CreateChatCompletionStreamArgs) {
    const stream = await this.client.chat.completions.create({
      ...data,
      stream: true,
    });
    onAbort?.(() => {
      this.logger.debug(`Stream aborted`);
      stream.controller.abort();
    });
    for await (const chunk of stream) {
      if (stream.controller.signal.aborted) {
        return;
      }
      this.logger.debug(`Received chat completion ${chunk.id}`);
      yield chunk;
    }
  }

  private mapError(completion: { error: unknown }): OpenAIServiceError {
    if (typeof completion.error == 'object' && 'code' in completion.error) {
      if (typeof completion.error.code == 'number') {
        const message =
          'message' in completion.error &&
          typeof completion.error.message == 'string'
            ? completion.error.message
            : 'Error occured';
        return new OpenAIServiceError(
          OpenAIServiceErrorCode.BadRequest,
          message,
        );
      }
      if (typeof completion.error.code == 'string') {
        let message =
          'message' in completion.error &&
          typeof completion.error.message == 'string'
            ? completion.error.message
            : 'Error occured';
        if (completion.error.code.includes('NOT_FOUND')) {
          return new OpenAIServiceError(
            OpenAIServiceErrorCode.NotFound,
            message,
          );
        }
      }
    }
    return new OpenAIServiceError(
      OpenAIServiceErrorCode.InternalError,
      'Something went wrong',
    );
  }
}
