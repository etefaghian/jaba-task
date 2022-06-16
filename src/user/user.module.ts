import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from 'src/redis/redis.module';
import { UserRepository } from './user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [
    EmailModule,
    AuthModule,
    RedisModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
})
export class UserModule {}
