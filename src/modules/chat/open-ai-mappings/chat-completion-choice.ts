import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletion as OpenAIChatCompletion } from 'openai/resources';
import { ChatCompletionMessage, LogProbs } from '.';
export class ChatCompletionChoice {
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
  public readonly logprobs: LogProbs;

  @ApiProperty({
    type: ChatCompletionMessage,
    description: 'A chat completion message generated by the model',
  })
  public readonly message: ChatCompletionMessage;

  constructor(
    finish_reason:
      | 'stop'
      | 'length'
      | 'tool_calls'
      | 'content_filter'
      | 'function_call',
    index: number,
    logprobs: LogProbs,
    message: ChatCompletionMessage,
  ) {
    this.finish_reason = finish_reason;
    this.index = index;
    this.logprobs = logprobs;
    this.message = message;
  }

  static fromOpenAI(choice: OpenAIChatCompletion.Choice) {
    return new ChatCompletionChoice(
      choice.finish_reason,
      choice.index,
      LogProbs.fromOpenAI(choice.logprobs),
      ChatCompletionMessage.fromOpenAI(choice.message),
    );
  }
}
