import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogService } from 'src/log/log.service';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  constructor(private logService: LogService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data): any => ({
        result: data,
        status: 200,
        error: {},
      })),
    );
  }
}
