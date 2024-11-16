import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionTokenLogprob as OpenAIChatCompletionTokenLogprob } from 'openai/resources';
import { ApiPropertyBytes, ApiPropertyLogprob } from './properties';
import { TopLogprob } from './top-log-prob';

export class ChatCompletionTokenLogprob {
  @ApiProperty({
    type: 'string',
    description: 'The token',
  })
  public readonly token: string;

  @ApiPropertyBytes()
  public readonly bytes?: number[];

  @ApiPropertyLogprob()
  public readonly logprob: number;

  @ApiProperty({
    type: [TopLogprob],
    description:
      'List of the most likely tokens and their log probability, at this token position',
  })
  public readonly topLogPropbs: TopLogprob[];

  constructor(
    token: string,
    bytes: number[] | undefined,
    logprob: number,
    topLogprobs: TopLogprob[],
  ) {
    this.token = token;
    this.bytes = bytes;
    this.logprob = logprob;
    this.topLogPropbs = topLogprobs;
  }

  static fromOpenAI(
    logprob: OpenAIChatCompletionTokenLogprob,
  ): ChatCompletionTokenLogprob {
    return new ChatCompletionTokenLogprob(
      logprob.token,
      logprob.bytes,
      logprob.logprob,
      logprob.top_logprobs?.map(TopLogprob.fromOpenAI),
    );
  }
}
