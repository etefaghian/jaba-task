import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogService } from 'src/log/log.service';

/**
 * @class
 * add a middleware for capture http info for logging in logger service
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logService: LogService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now();
    const { ip, method, path: url, body } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;

      const { statusCode } = response;
      const contentLength = response.get('content-length');
      const result = response.json;

      this.logService.createHttpLog({
        data: {
          elapsedTime,
          req: { ip, method, url, body, userAgent },
          res: { statusCode, contentLength, result },
        },
      });
    });

    next();
  }
}
