import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtData } from 'src/auth/auth.service';

/**
 * @function
 * a decorator for getting user information from token
 * @note use it along side auth guard
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userJwtData: UserJwtData = request.tokenData;

    const user = {
      _id: userJwtData.uid,
      email: userJwtData.eml,
    };

    return data ? user?.[data] : user;
  },
);
