import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Model } from '@prisma/client';
import { AdminOnly } from 'src/common/guards';
import { Model as ModelSchema } from 'src/common/swagger/schemas';
import { CreateModelRequestBody } from './model.controller.types';
import {
  CreateModelError,
  ModelService,
  QueryModelError,
  QueryModelsError,
} from './model.service';

@ApiTags('Models')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'User not logged in' })
@ApiInternalServerErrorResponse({ description: 'Server error' })
//
@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @ApiOperation({ summary: 'Get list of supported OpenAI models' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: [ModelSchema],
  })
  //
  @Get()
  findAll(): Promise<Model[]> {
    return this.modelService.queryAll({}).match(
      result => result.models,
      e => {
        switch (e) {
          case QueryModelsError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }

  @ApiOperation({ summary: 'Find supported OpenAI model by name' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: ModelSchema,
  })
  @ApiNotFoundResponse({ description: 'OpenAI model not found' })
  //
  @Get(':name')
  findOne(@Param('name') name: string): Promise<Model> {
    return this.modelService.queryOne({ name }).match(
      result => result.model,
      e => {
        switch (e) {
          case QueryModelError.ModelNotFound:
            throw new NotFoundException('Model not found');
          case QueryModelError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }

  @ApiOperation({ summary: 'Add supported OpenAI model (admin only)' })
  @ApiConflictResponse({ description: 'Model with this name already exists' })
  @ApiForbiddenResponse({ description: 'You are not an admin' })
  @ApiResponse({
    description: 'Success',
    status: HttpStatus.OK,
    type: [ModelSchema],
  })
  //
  @AdminOnly()
  @Post()
  create(@Body() data: CreateModelRequestBody): Promise<Model> {
    return this.modelService.create(data).match(
      result => result.model,
      e => {
        switch (e) {
          case CreateModelError.ModelAlreadyExist:
            throw new ConflictException('Model with this name already exists');
          case CreateModelError.InternalError:
            throw new InternalServerErrorException('Something went wrong');
        }
      },
    );
  }
}
