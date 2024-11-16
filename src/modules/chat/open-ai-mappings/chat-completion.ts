import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletion as OpenAIChatCompletion } from 'openai/resources';
import { ChatCompletionBase, ChatCompletionChoice, CompletionUsage } from '.';

export class ChatCompletion extends ChatCompletionBase {
  @ApiProperty({
    type: [ChatCompletionChoice],
    description: 'A list of chat completion choices',
  })
  public readonly choices: ChatCompletionChoice[];

  constructor(
    id: string,
    choices: ChatCompletionChoice[],
    created: number,
    model: string,
    usage: CompletionUsage,
  ) {
    super(id, created, model, usage);
    this.choices = choices;
  }

  static fromOpenAI(completion: OpenAIChatCompletion): ChatCompletion {
    return new ChatCompletion(
      completion.id,
      completion.choices.map(ChatCompletionChoice.fromOpenAI),
      completion.created,
      completion.model,
      CompletionUsage.fromOpenAI(completion.usage),
    );
  }
}
