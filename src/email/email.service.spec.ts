import { EmailService } from './email.service';

describe('EmailService', () => {
  const logService = {
    createManualLog: jest.fn().mockResolvedValue(undefined),
  };
  const mailerService = { sendMail: jest.fn().mockResolvedValue(undefined) };
  const queue = { add: jest.fn().mockResolvedValue(undefined) };
  let service: EmailService;

  beforeEach(() => {
    jest.clearAllMocks();
    logService.createManualLog.mockResolvedValue(undefined);
    mailerService.sendMail.mockResolvedValue(undefined);
    queue.add.mockResolvedValue(undefined);
    service = new EmailService(
      logService as any,
      mailerService as any,
      queue as any,
    );
  });

  it('queues a confirmation message without logging its one-time code', async () => {
    await service.addConfirmationEmailToQueue({
      email: 'person@example.com',
      code: '12345',
    });

    expect(queue.add).toHaveBeenCalledWith({
      type: 'confirmation',
      email: 'person@example.com',
      code: '12345',
      status: 'pending',
    });
    expect(logService.createManualLog).toHaveBeenCalledWith({
      type: 'email',
      data: {
        message: 'add_email_to_queue',
        email: 'person@example.com',
        status: 'pending',
      },
    });
  });

  it('queues login security notices', async () => {
    await service.addLoginNotificationToQueue('person@example.com');

    expect(queue.add).toHaveBeenCalledWith({
      type: 'login_notification',
      email: 'person@example.com',
      status: 'pending',
    });
  });

  it('records and propagates login notification enqueue failures', async () => {
    queue.add.mockRejectedValue(new Error('queue unavailable'));

    await expect(
      service.addLoginNotificationToQueue('person@example.com'),
    ).rejects.toThrow('queue unavailable');
    expect(logService.createManualLog).toHaveBeenLastCalledWith({
      type: 'email',
      data: {
        message: 'queue_login_notification',
        email: 'person@example.com',
        status: 'failed',
      },
    });
  });

  it('sends confirmation emails and logs delivery success', async () => {
    await (service as any).sendEmailFromQueue({
      data: {
        type: 'confirmation',
        email: 'person@example.com',
        code: '12345',
      },
    });

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'person@example.com',
      subject: 'تایید ایمیل شما',
      text: service.constructMailText('12345'),
    });
    expect(logService.createManualLog).toHaveBeenLastCalledWith({
      type: 'email',
      data: {
        message: 'send_email',
        email: 'person@example.com',
        status: 'success',
      },
    });
  });

  it('sends a queued login notification and logs success', async () => {
    await (service as any).sendEmailFromQueue({
      data: { type: 'login_notification', email: 'person@example.com' },
    });

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'person@example.com',
      subject: 'ورود به حساب کاربری شما',
      text: service.constructLoginNotificationText(),
    });
    expect(logService.createManualLog).toHaveBeenLastCalledWith({
      type: 'email',
      data: {
        message: 'send_login_notification',
        email: 'person@example.com',
        status: 'success',
      },
    });
  });

  it('sends legacy confirmation jobs and records send failures', async () => {
    mailerService.sendMail.mockRejectedValue(new Error('SMTP failure'));

    await expect(
      (service as any).sendEmailFromQueue({
        data: { email: 'person@example.com', code: '12345' },
      }),
    ).rejects.toThrow('SMTP failure');
    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: 'person@example.com',
      subject: 'تایید ایمیل شما',
      text: service.constructMailText('12345'),
    });
    expect(logService.createManualLog).toHaveBeenLastCalledWith({
      type: 'email',
      data: {
        message: 'send_email',
        email: 'person@example.com',
        status: 'failed',
      },
    });
  });
});
