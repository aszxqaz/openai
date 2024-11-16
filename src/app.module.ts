import { MorganMiddleware } from '@nest-middlewares/morgan';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { defaultMorganFn } from 'src/common/logging/morgan';
import { AccountModule } from 'src/modules/account';
import { AuthenticationGuard } from 'src/modules/auth/auth.guard';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthStrategy } from 'src/modules/auth/auth.strategy';
import { ChatModule } from 'src/modules/chat/chat.module';
import { DomainModule } from 'src/modules/domain';
import { ModelModule } from 'src/modules/model';
import { OpenAIModule } from 'src/modules/openai/openai.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      isGlobal: true,
    }),
    OpenAIModule,
    DomainModule,
    AuthModule,
    AccountModule,
    ModelModule,
    UserModule,
    ChatModule,
  ],
  providers: [
    AuthStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
})
export class AppModule implements NestModule {
  private reqLogger = new Logger('RequestLogger');

  configure(consumer: MiddlewareConsumer) {
    MorganMiddleware.configure(defaultMorganFn, {
      stream: { write: this.reqLogger.log.bind(this.reqLogger) },
    });
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
