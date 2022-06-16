import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { join } from 'path';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email_send',
    }),
    MailerModule.forRoot({
      // transport: 'smtps://user@example.com:topsecret@smtp.example.com',
      // or
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        ignoreTLS: true,
        secure: true,
        auth: {
          user: 'etefagh3232@gmail.com',
          pass: 'bygtpjgtmroglrat',
        },
      },
      defaults: {
        from: 'etefagh3232@gmail.com',
      },
      // template: {
      //   dir: process.cwd() + '/templates/',jjj
      //   options: {
      //     strict: true,
      //   },
      // },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}

console.log({ dir: join(__dirname, 'templates') });
