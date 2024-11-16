import { ApiProperty } from '@nestjs/swagger';
import { ChatCompletionChunk as OpenAIChatCompletionChunk } from 'openai/resources';
import { ApiPropertyContent, ApiPropertyRefusal } from './properties';

export class Delta {
  @ApiPropertyContent()
  public readonly content?: string;

  @ApiPropertyRefusal()
  public readonly refusal?: string;

  @ApiProperty({
    enum: ['system', 'user', 'assistant', 'tool'],
    description: 'The role of the author of this message',
    example: 'assistant',
  })
  public readonly role?: 'system' | 'user' | 'assistant' | 'tool';

  constructor(
    content?: string,
    refusal?: string,
    role?: 'system' | 'user' | 'assistant' | 'tool',
  ) {
    this.content = content;
    this.refusal = refusal;
    this.role = role;
  }

  static fromOpenAI(delta: OpenAIChatCompletionChunk.Choice.Delta): Delta {
    return new Delta(delta.content, delta.refusal, delta.role);
  }
}
