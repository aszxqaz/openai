import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
  AuthController,
  AuthenticationGuard,
  AuthService,
  AuthStrategy,
} from '.';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [AuthService, AuthenticationGuard, AuthStrategy],
  controllers: [AuthController],
  exports: [AuthService, AuthenticationGuard, AuthStrategy],
})
export class AuthModule {}
