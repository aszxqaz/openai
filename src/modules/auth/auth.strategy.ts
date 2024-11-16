import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthTokenPayload, Requestor } from 'src/common/auth';

import { UserRepository } from 'src/modules/domain';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger();
  constructor(
    readonly config: ConfigService,
    private readonly users: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: AuthTokenPayload): Promise<Requestor | null> {
    this.logger.debug(JSON.stringify(payload));
    return this.users
      .find(payload.userId)
      .match(Requestor.fromUser, () => null);
  }
}
