import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Observable } from 'rxjs';
import { Requestor } from '../types';

export const RestrictedByUserId = () => UseGuards(RestrictedByUserIdGuard);

@Injectable()
class RestrictedByUserIdGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Requestor;

    if (!user) throw new UnauthorizedException();

    if (user.role === UserRole.Admin) return true;

    const userIdParam = parseInt(request.params['userId']);
    if (userIdParam == user.id) return true;

    throw new ForbiddenException('Restricted to the other user');
  }
}
