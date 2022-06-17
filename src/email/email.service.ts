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

  /**
   * @method
   * add confirmation email to queue for future sending
   * @param addConfirmationEmailToQueueDto
   */
  async addConfirmationEmailToQueue(
    addConfirmationEmailToQueueDto: AddConfirmationEmailToQueueDto,
  ) {
    this.logService.createManualLog({
      type: LogType.email,
      data: {
        message: 'add_email_to_queue',
        email: addConfirmationEmailToQueueDto.email,
        code: addConfirmationEmailToQueueDto.code,
        status: 'pending',
      },
    });
    await this.emailSendQueue.add({
      email: addConfirmationEmailToQueueDto.email,
      code: addConfirmationEmailToQueueDto.code,
      status: 'pending',
    });
  }

  /**
   * @method
   * send email from queue to receiver
   */
  @Process()
  private async sendEmailFromQueue(job: Job<EmailSendQueueType>) {
    const { email, code } = job.data;
    this.mailerService

      .sendMail({
        to: email,
        subject: 'تایید ایمیل شما',
        text: this.constructMailText(code),
      })
      .catch((e) => {
        console.log(e);
      })
      .then(() => {
        this.logService.createManualLog({
          type: LogType.email,
          data: {
            message: 'send_email',
            email,
            code,
            status: 'success',
          },
        });
      });
  }

  /**
   * @method
   * generate content of confirmation email
   * @param code
   * @returns
   */
  constructMailText(code: string) {
    return `با سلام
    کد تایید ایمیل شما :
  ${code}
    در صورتی که از این ایمیل چیزی نمیفهمید آن را نادیده بگیرید
    
    `;
  }
}

interface EmailSendQueueType {
  email: string;
  code: string;
  status: 'pending' | 'success' | 'failed';
}
