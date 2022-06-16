import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogService } from 'src/log/log.service';

@Injectable()
export class GlobalResponseInterceptor implements NestInterceptor {
  constructor(private logService: LogService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    this.logService.createHttpLog({
      data: {
        req: { body: req.body, header: req.headers },
        res: { header: res.getHeaders() },
      },
    });

    return next.handle().pipe(
      map((data): any => ({
        result: data,
        status: 200,
        error: {},
      })),
    );
  }
}
