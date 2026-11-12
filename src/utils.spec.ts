import { HttpException, HttpStatus } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { firstValueFrom, of } from 'rxjs';
import { generateRandomNumber } from '../utils/generateRandomNumber';
import { AuthGuard } from '../utils/guards/auth.guard';
import { AllExceptionsFilter } from '../utils/exceptionFilters/allExceptionFilter';
import { GlobalResponseInterceptor } from '../utils/interceptors/responseInterceptor';
import { LoggerMiddleware } from '../utils/middlewares/logerMiddleware';
import { User } from '../utils/decorators/user.decorator';

describe('shared utilities', () => {
  it('generates a fixed-length numeric code from the random source', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.123456);
    expect(generateRandomNumber(5)).toBe('12345');
    jest.restoreAllMocks();
  });

  describe('AuthGuard', () => {
    const authService = { verifyJwt: jest.fn() };
    const redisService = { getTokenValidity: jest.fn() };
    const reflector = { get: jest.fn() };
    let guard: AuthGuard;
    let request: any;
    let context: any;

    beforeEach(() => {
      jest.clearAllMocks();
      guard = new AuthGuard(
        authService as any,
        redisService as any,
        reflector as any,
      );
      request = { header: jest.fn().mockReturnValue('Bearer token') };
      context = {
        getHandler: jest.fn(),
        switchToHttp: () => ({ getRequest: () => request }),
      };
      reflector.get.mockReturnValue(false);
      redisService.getTokenValidity.mockResolvedValue(true);
      authService.verifyJwt.mockReturnValue({
        uid: 'user-1',
        eml: 'person@example.com',
        typ: 'access',
        new: true,
      });
    });

    it('accepts a valid token and attaches its claims to the request', async () => {
      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(redisService.getTokenValidity).toHaveBeenCalledWith('token');
      expect(request.tokenData.uid).toBe('user-1');
    });

    it('rejects an invalidated token', async () => {
      const consoleError = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      redisService.getTokenValidity.mockResolvedValue(false);

      await expect(guard.canActivate(context)).resolves.toBe(false);
      expect(authService.verifyJwt).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('rejects malformed authorization headers without throwing', async () => {
      const consoleError = jest
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      request.header.mockReturnValue(undefined);

      await expect(guard.canActivate(context)).resolves.toBe(false);
      consoleError.mockRestore();
    });
  });

  it('extracts user claims from the authenticated request', () => {
    class DecoratedController {}
    User('email')(DecoratedController.prototype, 'handler', 0);
    const metadata = Reflect.getMetadata(
      ROUTE_ARGS_METADATA,
      DecoratedController,
      'handler',
    );
    const parameter = Object.values(metadata)[0] as any;
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          tokenData: { uid: 'user-1', eml: 'person@example.com' },
        }),
      }),
    };

    expect(parameter.factory('email', context)).toBe('person@example.com');
    expect(parameter.factory(undefined, context)).toEqual({
      _id: 'user-1',
      email: 'person@example.com',
    });
  });

  it('wraps successful responses in the standard response envelope', async () => {
    const interceptor = new GlobalResponseInterceptor({} as any);
    const result = await firstValueFrom(
      interceptor.intercept(
        {} as any,
        { handle: () => of({ value: 1 }) } as any,
      ),
    );
    expect(result).toEqual({ result: { value: 1 }, status: 200, error: {} });
  });

  describe('AllExceptionsFilter', () => {
    const reply = jest.fn();
    const response = {};
    const filter = new AllExceptionsFilter({ httpAdapter: { reply } } as any);
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as any;

    beforeEach(() => reply.mockClear());

    it('formats HTTP errors and preserves their status code', () => {
      filter.catch(new HttpException('not found', HttpStatus.NOT_FOUND), host);
      expect(reply).toHaveBeenCalledWith(
        response,
        { status: 'FAILED', result: {}, error: { message: 'not found' } },
        HttpStatus.NOT_FOUND,
      );
    });

    it('hides unexpected error details from the client', () => {
      filter.catch(new Error('secret details'), host);
      expect(reply).toHaveBeenCalledWith(
        response,
        {
          status: 'FAILED',
          result: {},
          error: {
            message: 'INTERNAL_SERVER_ERROR',
            text: 'مشکل مدیریت نشده ای در سرور رخ داده است',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  it('records completed HTTP requests in the logging middleware', () => {
    const createHttpLog = jest.fn();
    const logger = new LoggerMiddleware({ createHttpLog } as any);
    let onFinish: () => void;
    const response: any = {
      on: jest.fn((_event, callback) => (onFinish = callback)),
      get: jest.fn().mockReturnValue('browser'),
      json: jest.fn(),
      get statusCode() {
        return 200;
      },
    };
    const request: any = {
      ip: '127.0.0.1',
      method: 'GET',
      path: '/health',
      body: {},
      get: jest.fn().mockReturnValue('browser'),
    };
    const next = jest.fn();

    logger.use(request, response, next);
    expect(next).toHaveBeenCalled();
    onFinish();
    expect(createHttpLog).toHaveBeenCalledWith({
      data: expect.objectContaining({
        req: expect.objectContaining({
          ip: '127.0.0.1',
          method: 'GET',
          url: '/health',
        }),
        res: expect.objectContaining({ statusCode: 200 }),
      }),
    });
  });
});
