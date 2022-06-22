import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email_send',
    }),
    MailerModule.forRootAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.getOrThrow('SMTP_HOST'),
            port: configService.getOrThrow('SMTP_PORT'),
            ignoreTLS: true,
            secure: true,
            auth: {
              user: configService.getOrThrow('SMTP_USERNAME'),
              pass: configService.getOrThrow('SMTP_PASSWORD'),
            },
          },
          defaults: {
            from: configService.getOrThrow('SMTP_USERNAME'),
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
