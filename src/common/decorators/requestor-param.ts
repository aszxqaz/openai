import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Requestor } from 'src/common/auth';

export const RequestorParam = createParamDecorator(
  (data: keyof Requestor | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
