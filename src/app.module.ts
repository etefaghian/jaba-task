import { MiddlewareConsumer, Module } from '@nestjs/common';
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
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalResponseInterceptor } from 'utils/interceptors/responseInterceptor';
import { LoggerMiddleware } from 'utils/middlewares/logerMiddleware';
import { AllExceptionsFilter } from 'utils/exceptionFilters/allExceptionFilter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    LogModule,
    EmailModule,
    CodeModule,
    RedisModule,

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          prefix: configService.getOrThrow('QUEUE_NAME'),
          redis: {
            host: configService.getOrThrow('REDIS_HOST'),
            port: configService.getOrThrow('REDIS_PORT'),
          },
        };
      },
      inject: [ConfigService],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options = {
          uri: configService.getOrThrow('DATABASE_URL'),
          auth: undefined,
        };
        if (configService.get('DATABASE_USER')) {
          options.auth = {
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
          };
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
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
