import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { LogModule } from './log/log.module';
import { EmailModule } from './email/email.module';
import { CodeModule } from './code/code.module';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from './redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalResponseInterceptor } from 'utils/interceptors/responseInterceptor';

@Module({
  imports: [
    UserModule,
    LogModule,
    EmailModule,
    CodeModule,
    RedisModule,
    BullModule.forRoot({
      prefix: 'jabama',
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options = {
          uri: 'mongodb://localhost:27017/jabama',
          auth: undefined,
        };
        if (configService.get('DATABASE_USER')) {
          // options.auth = {
          //   username: configService.get('DATABASE_USER'),
          //   password: configService.get('DATABASE_PASSWORD'),
          // };
        }
        return options;
      },
      inject: [ConfigService],
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalResponseInterceptor,
    },
  ],
})
export class AppModule {}
