export enum OpenAIServiceErrorCode {
  Unknown,
  NotFound,
  BadRequest,
  InternalError,
}

export class OpenAIServiceError extends Error {
  constructor(
    public readonly code: OpenAIServiceErrorCode,
    public readonly message: string,
  ) {
    super(message);
  }
}
