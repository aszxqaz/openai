import { ApiProperty } from '@nestjs/swagger';
import { CompletionUsage } from './completion-usage';

export class ChatCompletionBase {
  @ApiProperty({
    type: 'string',
    description: 'A unique identifier for the chat completion',
  })
  public readonly id: string;

  @ApiProperty({
    description: 'The timestamp at which the chat completion was created',
    example: 1673950400,
    type: 'integer',
    format: 'unixTimestamp',
  })
  public readonly created: number;

  @ApiProperty({ description: 'The model used for the chat completion' })
  public readonly model: string;

  @ApiProperty({
    description: 'The completion usage information',
    type: CompletionUsage,
    required: false,
  })
  public readonly usage?: CompletionUsage;

  constructor(
    id: string,
    created: number,
    model: string,
    usage?: CompletionUsage,
  ) {
    this.id = id;
    this.created = created;
    this.model = model;
    this.usage = usage;
  }
}
