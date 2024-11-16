import { ChatCompletionTokenLogprob as OpenAIChatCompletionTokenLogprob } from 'openai/resources';
import { ApiPropertyBytes, ApiPropertyLogprob, ApiPropertyToken } from '.';

export class TopLogprob {
  @ApiPropertyToken()
  readonly token: string;

  @ApiPropertyBytes()
  public readonly bytes?: number[];

  @ApiPropertyLogprob()
  public readonly logprob: number;

  constructor(token: string, bytes: number[] | undefined, logprob: number) {
    this.token = token;
    this.bytes = bytes;
    this.logprob = logprob;
  }

  static fromOpenAI(
    logprob: OpenAIChatCompletionTokenLogprob.TopLogprob,
  ): TopLogprob {
    return new TopLogprob(logprob.token, logprob.bytes, logprob.logprob);
  }
}
