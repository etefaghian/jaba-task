import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

/**
 * a global error handler for shaping response
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    //extract status code from exception object according to type of exception class
    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    //get http exception response
    const httpExceptionResponse: string | Record<string, any> =
      exception instanceof HttpException ? exception.getResponse() : null;

    //construct error object according to source of error
    const errorObject: KarafsResponse['error'] =
      exception instanceof KarafsException
        ? //we shape it previously in karafs exception we just use shaped response
          exception.getResponse()['error']
        : exception instanceof HttpException
        ? //shape http exception with just message field
          {
            //extract message from error object if response is object else return http exception that is in string format
            message:
              typeof httpExceptionResponse === 'object' &&
              httpExceptionResponse.message
                ? String(httpExceptionResponse.message)
                : httpExceptionResponse,
          }
        : //shape unhandled exception
          {
            message: 'INTERNAL_SERVER_ERROR',
            description: 'مشکل مدیریت نشده ای در سرور رخ داده است',
          };

    //construct response body with status and message and description
    const responseBody: KarafsResponse = {
      status: ResponseStatus.FAILED,
      result: {},
      error: errorObject,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
