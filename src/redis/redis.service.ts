import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import * as redis from 'redis';
import { RedisDbType } from './types/redisType';

@Injectable()
export class RedisService {
  public codeConnection;
  public tokenConnection;
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
    const isOk = await this.setex(key, code, 60 * 60);
    return isOk ? true : false;
  }

  async getSmsCode(email: string): Promise<string> {
    const key = constructSmsCodeKey(email);

    return await this.get(key);
  }

  async setUserValidity(token: string, isValid: boolean) {
    const key = constructTokenValidityKey(token);
    const isOk = await this.setex(key, isValid, 30 * 24 * 60 * 60);
    return isOk ? true : false;
  }

  async getTokenValidity(token: string): Promise<boolean> {
    const key = constructTokenValidityKey(token);

    return Boolean(await this.get(key));
  }

  async deleteSmsCode(email: string) {
    const key = constructSmsCodeKey(email);
    return await this.del(key);
  }

  private async get(key: string) {
    return this.pub.get(key);
  }

  private set(key, val) {
    return this.pub.set(key, val);
  }

  private setex(key, seconds, value) {
    return this.pub.set(key, value, { EX: seconds });
  }

  private del(key) {
    return this.pub.del(key);
  }
}

const constructSmsCodeKey = (userId: string): string => {
  return `"code":${userId}`;
};

const constructTokenValidityKey = (userId: string): string => {
  return `"tokenValidity":${userId}`;
};
