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

  /**
   * @method
   * add cofiramtion email to queue for future sending
   * @param addConfirmationEmailToQueueDto
   */
  async addConfirmationEmailToQueue(
    addConfirmationEmailToQueueDto: AddConfirmationEmailToQueueDto,
  ) {
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
