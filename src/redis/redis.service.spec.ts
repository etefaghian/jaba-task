jest.mock('redis', () => ({ createClient: jest.fn() }));

import * as redis from 'redis';
import { RedisService } from './redis.service';
import { RedisDbType } from './types/redisType';

describe('RedisService', () => {
  const codeClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  };
  const tokenClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
  };
  let service: RedisService;

  beforeEach(() => {
    jest.clearAllMocks();
    (redis.createClient as jest.Mock)
      .mockReturnValueOnce(codeClient)
      .mockReturnValueOnce(tokenClient);
    service = new RedisService({ get: () => 'redis://localhost:6379' } as any);
  });

  it('creates separate Redis databases for one-time codes and tokens', () => {
    expect(redis.createClient).toHaveBeenNthCalledWith(1, {
      url: 'redis://localhost:6379',
      database: RedisDbType.code,
    });
    expect(redis.createClient).toHaveBeenNthCalledWith(2, {
      url: 'redis://localhost:6379',
      database: RedisDbType.token,
    });
    expect(codeClient.connect).toHaveBeenCalled();
    expect(tokenClient.connect).toHaveBeenCalled();
  });

  it('stores and retrieves an SMS code with a one-hour expiry', async () => {
    codeClient.get.mockResolvedValue('45678');

    await expect(
      service.setSmsCode('45678', 'person@example.com'),
    ).resolves.toBe(true);
    expect(codeClient.set).toHaveBeenCalledWith(
      '"code":person@example.com',
      '45678',
      {
        EX: 60 * 60,
      },
    );
    await expect(service.getSmsCode('person@example.com')).resolves.toBe(
      '45678',
    );
  });

  it('stores token validity and interprets the stored boolean value correctly', async () => {
    tokenClient.get
      .mockResolvedValueOnce('true')
      .mockResolvedValueOnce('false');

    await expect(service.setUserValidity('token', true)).resolves.toBe(true);
    expect(tokenClient.set).toHaveBeenCalledWith('"tokenVal":token', 'true', {
      EX: 30 * 24 * 60 * 60,
    });
    await expect(service.getTokenValidity('token')).resolves.toBe(true);
    await expect(service.getTokenValidity('token')).resolves.toBe(false);
  });

  it('deletes an SMS code by its email key', async () => {
    await expect(service.deleteSmsCode('person@example.com')).resolves.toBe(1);
    expect(codeClient.del).toHaveBeenCalledWith('"code":person@example.com');
  });
});
