import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserJwtData } from 'src/auth/auth.service';

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
