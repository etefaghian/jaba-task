import { MailerService } from '@nestjs-modules/mailer';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { LogType } from 'src/log/log.model';
import { LogService } from 'src/log/log.service';
import { AddConfirmationEmailToQueueDto } from './dto/addConfirmationEmailToQueue.dto';

@Injectable()
@Processor('email_send')
export class EmailService {
  constructor(
    private logService: LogService,
    private mailerService: MailerService,
    @InjectQueue('email_send')
    private emailSendQueue: Queue<EmailSendQueueType>,
  ) {}

  /** Add the one-time login code email to the sending queue. */
  async addConfirmationEmailToQueue(
    addConfirmationEmailToQueueDto: AddConfirmationEmailToQueueDto,
  ) {
    const { email, code } = addConfirmationEmailToQueueDto;
    await this.logService.createManualLog({
      type: LogType.email,
      data: {
        message: 'add_email_to_queue',
        email,
        status: 'pending',
      },
    });
    await this.emailSendQueue.add({
      type: 'confirmation',
      email,
      code,
      status: 'pending',
    });
  }

  /** Queue a security notice after a user successfully signs in. */
  async addLoginNotificationToQueue(email: string) {
    await this.logService.createManualLog({
      type: LogType.email,
      data: {
        message: 'add_login_notification_to_queue',
        email,
        status: 'pending',
      },
    });

    try {
      await this.emailSendQueue.add({
        type: 'login_notification',
        email,
        status: 'pending',
      });
    } catch (error) {
      await this.logService.createManualLog({
        type: LogType.email,
        data: {
          message: 'queue_login_notification',
          email,
          status: 'failed',
        },
      });
      throw error;
    }
  }

  /** Send queued email jobs. Older confirmation jobs without a type are supported. */
  @Process()
  private async sendEmailFromQueue(job: Job<EmailSendQueueType>) {
    const { email, code, type } = job.data;

    try {
      await this.mailerService.sendMail(
        type === 'login_notification'
          ? {
              to: email,
              subject: 'ورود به حساب کاربری شما',
              text: this.constructLoginNotificationText(),
            }
          : {
              to: email,
              subject: 'تایید ایمیل شما',
              text: this.constructMailText(code),
            },
      );

      await this.logService.createManualLog({
        type: LogType.email,
        data: {
          message:
            type === 'login_notification'
              ? 'send_login_notification'
              : 'send_email',
          email,
          status: 'success',
        },
      });
    } catch (error) {
      await this.logService.createManualLog({
        type: LogType.email,
        data: {
          message:
            type === 'login_notification'
              ? 'send_login_notification'
              : 'send_email',
          email,
          status: 'failed',
        },
      });
      throw error;
    }
  }

  /** Generate content of the confirmation email. */
  constructMailText(code: string) {
    return `با سلام
    کد تایید ایمیل شما :
  ${code}
    در صورتی که از این ایمیل چیزی نمیفهمید آن را نادیده بگیرید
    
    `;
  }

  /** Generate content of a successful sign-in notification. */
  constructLoginNotificationText() {
    return `با سلام
ورود موفقی به حساب کاربری شما انجام شد.
اگر این ورود توسط شما انجام نشده است، لطفاً رمز عبور یا روش ورود خود را امن کنید.`;
  }
}

interface EmailSendQueueType {
  type?: 'confirmation' | 'login_notification';
  email: string;
  code?: string;
  status: 'pending' | 'success' | 'failed';
}
