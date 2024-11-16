import { Module } from '@nestjs/common';
import { UserController } from '.';

@Module({
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class UserModule {}
