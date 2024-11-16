import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletion as OpenAIChatCompletion } from 'openai/resources';
import { ChatCompletionTokenLogprob } from './chat-completion-token-logprob';

export class LogProbs {
  @ApiProperty({
    type: [ChatCompletionTokenLogprob],
    description:
      'A list of message content tokens with log probability information',
  })
  public readonly content?: ChatCompletionTokenLogprob[];

  @ApiProperty({
    type: [ChatCompletionTokenLogprob],
    description:
      'A list of message refusal tokens with log probability information',
  })
  public readonly refusal?: ChatCompletionTokenLogprob[];

  constructor(
    content: ChatCompletionTokenLogprob[] | undefined,
    refusal: ChatCompletionTokenLogprob[] | undefined,
  ) {
    this.content = content;
    this.refusal = refusal;
  }

  static fromOpenAI(logprobs?: OpenAIChatCompletion.Choice.Logprobs): LogProbs {
    return new LogProbs(
      logprobs?.content?.map(ChatCompletionTokenLogprob.fromOpenAI),
      logprobs?.refusal?.map(ChatCompletionTokenLogprob.fromOpenAI),
    );
  }
}
