import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @class
 * an interceptor for shaping response of controllers according to karafs response structure
 * @note use it globally or in each module
 * @example use top of controller: @ShapeResponseInterceptor or see documents {@link https://docs.nestjs.com/interceptors#binding-interceptors}
 * @note it shapes response only in successful condition
 *
 */
@Injectable()
export class ShapeKarafsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      //map raw response to karafs response
      map((data): any => ({
        result: data,
        status: 200,
        error: {},
      })),
    );
  }
}
