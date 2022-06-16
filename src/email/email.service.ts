import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { AddConfirmationEmailToQueueDto } from './dto/addConfirmationEmailToQueue.dto';

@Injectable()
@Processor('email_send')
export class EmailService {
  constructor(
    private mailerService: MailerService,
    @InjectQueue('email_send')
    private emailSendQueue: Queue<EmailSendQueueType>,
  ) {}

  async addConfirmationEmailToQueue(
    addConfirmationEmailToQueueDto: AddConfirmationEmailToQueueDto,
  ) {
    const job = await this.emailSendQueue.add({
      email: addConfirmationEmailToQueueDto.email,
      code: addConfirmationEmailToQueueDto.code,
      status: 'pending',
    });
  }

  @Process()
  async sendEmailFromQueue(job: Job<EmailSendQueueType>) {
    const { email, code } = job.data;
    this.mailerService
      .sendMail({
        to: email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'تایید ایمیل شما',
        text: code,
        // template: './confirmation',
        // context: {
        //   code,
        // },
      })
      .catch((e) => {
        console.log(e);
      });
  }
}

interface EmailSendQueueType {
  email: string;
  code: string;
  status: 'pending' | 'success' | 'failed';
}
