import { HttpException } from '@nestjs/common';
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
import { ChatCompletion } from './open-ai-mappings/chat-completion';
import { ChatCompletionChunk } from './open-ai-mappings/chat-completion-chunk';
import { CreateCompletionData } from './open-ai-mappings/create-completion-data';
import { Message } from './open-ai-mappings/message';

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

export class CreateCompletionStreamResponseChunkError {
  @ApiProperty({
    type: 'string',
    description: 'Error message',
    example: 'Internal Server Error',
  })
  public readonly message: string;

  @ApiProperty({
    type: 'integer',
    description: 'Error code',
    example: 500,
  })
  public readonly code: number;

  constructor(message: string, code: number) {
    this.message = message;
    this.code = code;
  }

  static fromHttpException(
    httpException: HttpException,
  ): CreateCompletionStreamResponseChunkError {
    return new CreateCompletionStreamResponseChunkError(
      httpException.message,
      httpException.getStatus(),
    );
  }
}

export class CreateCompletionStreamChunkResponse {
  @ApiProperty({
    type: ChatCompletionChunk,
    description: 'Represents a streamed chunk of a chat completion',
    nullable: true,
  })
  chunk?: ChatCompletionChunk;

  @ApiProperty({
    type: 'integer',
    description: 'Amount of credits charged for usage of the model',
    example: 2000,
    nullable: true,
  })
  creditsCharged?: number;

  @ApiProperty({
    type: CreateCompletionStreamResponseChunkError,
    description: 'Error details if obtaining chunk failed',
    nullable: true,
  })
  error?: CreateCompletionStreamResponseChunkError;
}
