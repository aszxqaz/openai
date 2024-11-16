import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  Res,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { Result } from 'neverthrow';
import { RequestorParam } from 'src/common/decorators';
import { SseController } from 'src/common/sse';
import {
  CreateCompletionBody,
  CreateCompletionResponse,
} from './chat.controller.types';
import { ChatService } from './chat.service';
import {
  CreateCompletionError,
  CreateCompletionStreamResult,
} from './chat.service.types';
import { ChatCompletion } from './open-ai-mappings/chat-completion';
import { ChatCompletionChunk } from './open-ai-mappings/chat-completion-chunk';

@ApiTags('Chats')
@ApiBearerAuth()
@ApiInternalServerErrorResponse({ description: 'Server error' })
@ApiUnauthorizedResponse({ description: 'User not logged in' })
@Controller('openai')
export class ChatController extends SseController {
  private logger = new Logger();

  constructor(private readonly chatService: ChatService) {
    super();
  }

  @ApiOperation({ summary: 'Generate chat completion' })
  @ApiOkResponse({
    description: 'Success',
    type: CreateCompletionResponse,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Model not found or not supported',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient credits for generaiton',
  })
  //
  @HttpCode(HttpStatus.OK)
  @Post('chat/completions')
  createCompletion(
    @Body() body: CreateCompletionBody,
    @RequestorParam('id') userId: User['id'],
  ): Promise<CreateCompletionResponse> {
    return this.chatService
      .createCompletion({
        options: body,
        userId,
      })
      .match(
        ({ completion, creditsCharged }) => ({
          completion: ChatCompletion.fromOpenAI(completion),
          creditsCharged,
        }),
        e => {
          throw this.mapErrorToHttp(e);
        },
      );
  }

  @ApiOperation({
    summary: 'Generate chat completion by streaming chunks (SSE)',
  })
  @ApiOkResponse({
    description: 'Success',
    type: ChatCompletionChunk,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Model not found or not supported',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input parameters',
  })
  @ApiForbiddenResponse({
    description: 'Insufficient credits for generaiton',
  })
  //
  @HttpCode(HttpStatus.OK)
  @Post('stream/chat/completions')
  async createCompletionStream(
    @Res({ passthrough: false }) res: Response,
    @Req() req: Request,
    @Body() body: CreateCompletionBody,
    @RequestorParam('id') userId: User['id'],
  ) {
    const onAbort = (abortFn: () => void) => {
      req.socket.on('close', abortFn);
    };

    const streamResult = await this.chatService.createChatCompletionStream({
      options: body,
      userId,
      onAbort,
    });

    if (streamResult.isErr()) {
      const e = streamResult._unsafeUnwrapErr();
      throw this.mapErrorToHttp(e);
    }

    const stream = this.getChunkResponseGenerator(streamResult._unsafeUnwrap());

    this.stream(res, stream);
  }

  private async *getChunkResponseGenerator(
    stream: AsyncGenerator<
      Result<CreateCompletionStreamResult, CreateCompletionError>,
      void,
      unknown
    >,
  ) {
    for await (const result of stream) {
      if (result.isOk()) {
        const { chunk, creditsCharged } = result._unsafeUnwrap();
        yield {
          chunk: ChatCompletionChunk.fromOpenAI(chunk),
          creditsCharged,
        };
      } else {
        const e = result._unsafeUnwrapErr();
        yield {
          error: this.mapErrorToHttp(e),
        };
      }
    }
  }

  private mapErrorToHttp(e: CreateCompletionError): HttpException {
    switch (e) {
      case CreateCompletionError.AccountNotFound:
      case CreateCompletionError.InternalError:
      case CreateCompletionError.CannotChargeCredits:
        return new InternalServerErrorException('Something went wrong');

      case CreateCompletionError.ModelNotFound:
        return new UnprocessableEntityException('Model not supported');

      case CreateCompletionError.BadRequest:
        return new BadRequestException('Input parameters are invalid');

      case CreateCompletionError.InsufficientCredits:
        return new ForbiddenException('Insufficient credits');
    }
  }
}
