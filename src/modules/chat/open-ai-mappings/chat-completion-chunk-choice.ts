import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionChunk as OpenAIChatCompletionChunk } from 'openai/resources';
import { Delta } from './chat-completion-chunk-choice-delta';
import { LogProbs } from './logprobs';

export class ChatCompletionChunkChoice {
  @ApiProperty({
    type: Delta,
    description:
      'A chat completion delta generated by streamed model responses',
  })
  public readonly delta: Delta;

  @ApiProperty({
    enum: ['stop', 'length', 'tool_calls', 'content_filter', 'function_call'],
    description: 'The reason the model stopped generating tokens',
  })
  public readonly finish_reason:
    | 'stop'
    | 'length'
    | 'tool_calls'
    | 'content_filter'
    | 'function_call';

  @ApiProperty({
    type: 'integer',
    description: 'The index of the choice in the list of choices',
  })
  public readonly index: number;

  @ApiProperty({
    type: LogProbs,
    description: 'Log probability information for the choice',
  })
  public readonly logprobs?: LogProbs;

  constructor(
    delta: Delta,
    finish_reason:
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call',
    index: number,
    logprobs?: LogProbs,
  ) {
    this.delta = delta;
    this.finish_reason = finish_reason;
    this.index = index;
    this.logprobs = logprobs;
  }

  static fromOpenAI(
    choice: OpenAIChatCompletionChunk.Choice,
  ): ChatCompletionChunkChoice {
    {
      return new ChatCompletionChunkChoice(
        Delta.fromOpenAI(choice.delta),
        choice.finish_reason,
        choice.index,
        LogProbs.fromOpenAI(choice.logprobs),
      );
    }
  }
}
