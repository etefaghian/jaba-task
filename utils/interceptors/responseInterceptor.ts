import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ShapeKarafsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    //add log
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
