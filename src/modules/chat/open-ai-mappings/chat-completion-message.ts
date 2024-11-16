import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionMessage as OpenAIChatCompletionMessage } from 'openai/resources';
import { ApiPropertyContent, ApiPropertyRefusal } from '.';

export class ChatCompletionMessage {
  @ApiPropertyContent()
  public readonly content?: string;

  @ApiPropertyRefusal()
  public readonly refusal?: string;

  @ApiProperty({
    enum: ['assistant'],
    description: 'The role of the author of this message',
  })
  public readonly role: 'assistant';

  constructor(content: string | undefined, refusal: string | undefined) {
    this.content = content;
    this.refusal = refusal;
    this.role = 'assistant';
  }

  static fromOpenAI(
    message: OpenAIChatCompletionMessage,
  ): ChatCompletionMessage {
    return new ChatCompletionMessage(message.content, message.refusal);
  }
}
