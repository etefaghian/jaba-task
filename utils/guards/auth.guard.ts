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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private reflector: Reflector) {}
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
      //set user data in req
      context.switchToHttp().getRequest().user = data;

      return true;
    } catch (error) {
      return false;
    }
  }
}
export const ShouldRegisterBeComplete = (shouldRegisterBeComplete: boolean) =>
  SetMetadata('shouldRegisterBeComplete', shouldRegisterBeComplete);
