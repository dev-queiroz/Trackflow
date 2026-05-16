import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { JwtPayloadUser } from '../interfaces/jwt-payload-user.interface';

export const getCurrentUserByContext = (
  _data: unknown,
  ctx: ExecutionContext,
): JwtPayloadUser => {
  const request = ctx.switchToHttp().getRequest<{ user: JwtPayloadUser }>();
  return request.user;
};

export const CurrentUser = createParamDecorator(getCurrentUserByContext);
