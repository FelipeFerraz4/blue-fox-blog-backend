import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { KeycloakUser } from './jwt.strategy';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): KeycloakUser | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
  },
);
