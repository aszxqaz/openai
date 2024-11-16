export enum OpenAIServiceErrorCode {
  Unknown = 'OpenAIServiceErrorCode.Unknown',
  NotFound = 'OpenAIServiceErrorCode.NotFound',
  BadRequest = 'OpenAIServiceErrorCode.BadRequest',
  InternalError = 'OpenAIServiceErrorCode.InternalError',
}

export class OpenAIServiceError extends Error {
  constructor(
    public readonly code: OpenAIServiceErrorCode,
    public readonly message: string,
  ) {
    super(message);
  }
}
