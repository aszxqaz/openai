import { User } from '@prisma/client';
import { ChatCompletion, ChatCompletionChunk } from 'openai/resources';
import { CreateChatCompletionOptions } from 'src/modules/openai';

export type CreateCompletionArgs = {
  userId: User['id'];
  options: CreateChatCompletionOptions;
};

export type CreateCompletionStreamArgs = {
  userId: User['id'];
  options: CreateChatCompletionOptions;
  onAbort?: (abortFn: () => void) => void;
};

export type CreateCompletionResult = {
  completion: ChatCompletion;
  creditsCharged: number;
};

export type CreateCompletionStreamResult = {
  chunk: ChatCompletionChunk;
  creditsCharged?: number;
};

export enum CreateCompletionError {
  InsufficientCredits = 'CreateCompletionError.InsufficientCredits',
  InternalError = 'CreateCompletionError.InternalError',
  AccountNotFound = 'CreateCompletionError.AccountNotFound',
  ModelNotFound = 'CreateCompletionError.ModelNotFound',
  BadRequest = 'CreateCompletionError.BadRequest',
  CannotChargeCredits = 'CreateCompletionError.CannotChargeCredits',
}
