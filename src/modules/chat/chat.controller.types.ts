import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ChatCompletion,
  ChatCompletionChunk,
  CreateCompletionData,
  Message,
} from '.';

export class CreateCompletionBody extends CreateCompletionData {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @Type(() => Message)
  messages: Message[];

  @IsString()
  @IsNotEmpty()
  model: string;
}

export class CreateCompletionResponse {
  @ApiProperty({
    type: ChatCompletion,
    description: 'Chat completion generated by the model',
  })
  completion: ChatCompletion;

  @ApiProperty({
    type: 'integer',
    description: 'Amount of credits charged for usage of the model',
    example: 2000,
  })
  creditsCharged: number;
}

export class CreateCompletionStreamResponse {
  @ApiProperty({
    type: ChatCompletionChunk,
    description: 'Represents a streamed chunk of a chat completion',
  })
  completion: ChatCompletionChunk;

  @ApiProperty({
    type: 'integer',
    description: 'Amount of credits charged for usage of the model',
    example: 2000,
  })
  creditsCharged?: number;
}