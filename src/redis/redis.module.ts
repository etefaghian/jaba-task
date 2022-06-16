import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
  imports: [ConfigModule],
})
export class RedisModule {}
