import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { LogService } from 'src/log/log.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
    logService: LogService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const shouldRegisterBeComplete =
        this.reflector.get<boolean>(
          'shouldRegisterBeComplete',
          context.getHandler(),
        ) ?? true;

      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization').split(' ')[1];

      const data = this.authService.verifyJwt(token);

      if (shouldRegisterBeComplete === true && data.new === false) {
        throw new Error('your are not register completely');
      }
      //set user data in req
      context.switchToHttp().getRequest().tokenData = data;

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  }
}
export const ShouldRegisterBeComplete = (shouldRegisterBeComplete: boolean) =>
  SetMetadata('shouldRegisterBeComplete', shouldRegisterBeComplete);
