import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as redis from 'redis';
import { RedisDbType } from './types/redisType';
import { RedisClientType } from '@redis/client';

@Injectable()
export class RedisService {
  private codeConnection: RedisClientType;
  private tokenConnection: RedisClientType;
  constructor(private configService: ConfigService) {
    this.codeConnection = redis.createClient({
      url: this.configService.get('REDIS_URL'),
      database: RedisDbType.code,
    });
    this.tokenConnection = redis.createClient({
      url: this.configService.get('REDIS_URL'),
      database: RedisDbType.token,
    });
    this.tokenConnection.connect();
    this.tokenConnection.on('error', (e) =>
      console.log('redis connection error:', e),
    );
    this.codeConnection.connect();
    this.codeConnection.on('error', (e) =>
      console.log('redis connection error:', e),
    );
  }
  async setSmsCode(code: string, email: string) {
    const key = constructSmsCodeKey(email);
    await this.codeConnection.set(key, code, { EX: 1000 * 60 * 60 });
    return true;
  }
  async getSmsCode(email: string): Promise<string> {
    const key = constructSmsCodeKey(email);
    return await this.codeConnection.get(key);
  }

  async setUserValidity(token: string, isValid: boolean) {
    const key = constructTokenValidityKey(token);

    await this.tokenConnection.set(key, String(isValid), {
      EX: 30 * 24 * 60 * 60,
    });
    return true;
  }

  async getTokenValidity(token: string): Promise<boolean> {
    const key = constructTokenValidityKey(token);
    const value = await this.tokenConnection.get(key);
    return Boolean(value);
  }
  async deleteSmsCode(email: string) {
    const key = constructSmsCodeKey(email);
    return await this.codeConnection.del(key);
  }
}

const constructSmsCodeKey = (userId: string): string => {
  return `"code":${userId}`;
};

const constructTokenValidityKey = (userId: string): string => {
  return `"tokenVal":${userId}`;
};
