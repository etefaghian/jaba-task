import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

describe('bootstrap', () => {
  const app = {
    enableCors: jest.fn(),
    listen: jest.fn().mockResolvedValue(undefined),
    useGlobalPipes: jest.fn(),
  };
  let createSpy: jest.SpyInstance;
  const originalPort = process.env.PORT;

  beforeEach(() => {
    jest.clearAllMocks();
    createSpy = jest.spyOn(NestFactory, 'create').mockResolvedValue(app as any);
  });

  afterEach(() => {
    createSpy.mockRestore();
    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;
  });

  it('creates the application, enables CORS, listens, and installs validation', async () => {
    process.env.PORT = '4567';

    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalledTimes(1);
    expect(app.enableCors).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith('4567');
    const [pipe] = app.useGlobalPipes.mock.calls[0];
    expect(pipe).toBeInstanceOf(ValidationPipe);
    expect(app.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        validatorOptions: expect.anything(),
      }),
    );
  });

  it('defaults to port 3000 when PORT is not configured', async () => {
    delete process.env.PORT;

    await bootstrap();

    expect(app.listen).toHaveBeenCalledWith(3000);
  });
});
