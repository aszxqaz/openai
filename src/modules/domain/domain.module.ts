import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma';
import {
  AccountRepository,
  CredentialsRepository,
  ModelsRepository,
  UserRepository,
} from '.';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    UserRepository,
    AccountRepository,
    CredentialsRepository,
    ModelsRepository,
  ],
  exports: [
    UserRepository,
    AccountRepository,
    CredentialsRepository,
    ModelsRepository,
  ],
})
export class DomainModule {}
