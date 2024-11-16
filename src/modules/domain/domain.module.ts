import { Global, Module } from '@nestjs/common';
import { PrismaModule } from 'src/modules/prisma';
import { AccountRepository } from './account.repository';
import { CredentialsRepository } from './credentials.repository';
import { ModelsRepository } from './models.repository';
import { UserRepository } from './user.repository';

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
