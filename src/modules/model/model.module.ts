import { Module } from '@nestjs/common';
import { ModelController } from './model.controller';
import { ModelService } from './model.service';

@Module({
  providers: [ModelService],
  controllers: [ModelController],
  exports: [],
})
export class ModelModule {}
