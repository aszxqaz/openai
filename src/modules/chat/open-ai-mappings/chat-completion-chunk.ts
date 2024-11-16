import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionChunk as OpenAIChatCompletionChunk } from 'openai/resources';
import { ChatCompletionBase } from './chat-completion-base';
import { ChatCompletionChunkChoice } from './chat-completion-chunk-choice';
import { CompletionUsage } from './completion-usage';

export class ChatCompletionChunk extends ChatCompletionBase {
  @ApiProperty({
    type: [ChatCompletionChunkChoice],
    description: 'A list of chat completion choices',
  })
  public readonly choices: ChatCompletionChunkChoice[];

  constructor(
    id: string,
    choices: ChatCompletionChunkChoice[],
    created: number,
    model: string,
    usage: CompletionUsage,
  ) {
    super(id, created, model, usage);
    this.choices = choices;
  }

  static fromOpenAI(
    completion: OpenAIChatCompletionChunk,
  ): ChatCompletionChunk {
    const usage = completion.usage
      ? CompletionUsage.fromOpenAI(completion.usage)
      : null;
    return new ChatCompletionChunk(
      completion.id,
      completion.choices.map(ChatCompletionChunkChoice.fromOpenAI),
      completion.created,
      completion.model,
      usage,
    );
  }
}
