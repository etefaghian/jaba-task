import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [EmailModule, AuthModule, RedisModule],
})
export class UserModule {}
