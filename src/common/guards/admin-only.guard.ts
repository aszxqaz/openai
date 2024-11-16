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
import { Requestor } from 'src/common/auth';

export const AdminOnly = () => UseGuards(AdminOnlyGuard);

@Injectable()
class AdminOnlyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Requestor;

    if (!user) throw new UnauthorizedException();

    if (user.role === UserRole.Admin) return true;

    throw new ForbiddenException('Admin only route');
  }
}
