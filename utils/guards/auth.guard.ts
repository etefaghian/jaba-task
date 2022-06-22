import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { LogService } from 'src/log/log.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private redisService: RedisService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const shouldRegisterBeComplete =
        this.reflector.get<boolean>(
          'shouldRegisterBeComplete',
          context.getHandler(),
        ) ?? true;

      const request: Request = context.switchToHttp().getRequest();
      const token = request.header('Authorization').split(' ')[1];

      //check token is valid yet or not
      const isTokenValid = await this.redisService.getTokenValidity(token);

      if (!isTokenValid) {
        throw new HttpException('token is not valid', HttpStatus.UNAUTHORIZED);
      }
      const data = this.authService.verifyJwt(token);

      if (shouldRegisterBeComplete === true && data.new === false) {
        throw new HttpException(
          'you shpuld complete registration process',
          HttpStatus.FORBIDDEN,
        );
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
