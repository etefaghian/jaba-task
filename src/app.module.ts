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

@Module({
  imports: [
    UserModule,
    LogModule,
    EmailModule,
    CodeModule,
    RedisModule,

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options = {
          uri: configService.get<string>('DATABASE_URI'),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
