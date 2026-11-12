import { validate } from 'class-validator';
import { AddConfirmationEmailToQueueDto } from './email/dto/addConfirmationEmailToQueue.dto';
import { CreateInCompleteUserDto } from './user/dto/createInCompleteUser.dto';
import { LoginDto } from './user/dto/login.dto';
import { RequestLoginDto } from './user/dto/requestLogin.dto';
import { UpdateInCompleteUserDto } from './user/dto/updateInCompleteUser.dto';

describe('request DTO validation', () => {
  it('accepts a valid confirmation email request and rejects invalid email/code values', async () => {
    const valid = Object.assign(new AddConfirmationEmailToQueueDto(), {
      email: 'person@example.com',
      code: '12345',
    });
    const invalid = Object.assign(new AddConfirmationEmailToQueueDto(), {
      email: 'not-an-email',
      code: 123,
    });

    await expect(validate(valid)).resolves.toHaveLength(0);
    await expect(validate(invalid)).resolves.toHaveLength(2);
  });

  it('validates email-only login-code requests', async () => {
    const valid = Object.assign(new RequestLoginDto(), {
      email: 'person@example.com',
    });
    const invalid = Object.assign(new RequestLoginDto(), { email: 'invalid' });

    await expect(validate(valid)).resolves.toHaveLength(0);
    await expect(validate(invalid)).resolves.not.toHaveLength(0);
  });

  it('requires an email and string code to log in', async () => {
    const valid = Object.assign(new LoginDto(), {
      email: 'person@example.com',
      code: '12345',
    });
    const invalid = Object.assign(new LoginDto(), {
      email: 'invalid',
      code: 12345,
    });

    await expect(validate(valid)).resolves.toHaveLength(0);
    await expect(validate(invalid)).resolves.toHaveLength(2);
  });

  it('validates incomplete users and registration updates', async () => {
    const validUser = Object.assign(new CreateInCompleteUserDto(), {
      email: 'person@example.com',
      hasCompleteRegister: false,
    });
    const invalidUser = Object.assign(new CreateInCompleteUserDto(), {
      email: 'invalid',
      hasCompleteRegister: 'false',
    });
    const validUpdate = Object.assign(new UpdateInCompleteUserDto(), {
      firstName: 'Pat',
      lastName: 'Lee',
    });
    const invalidUpdate = Object.assign(new UpdateInCompleteUserDto(), {
      firstName: 1,
      lastName: null,
    });

    await expect(validate(validUser)).resolves.toHaveLength(0);
    await expect(validate(invalidUser)).resolves.toHaveLength(2);
    await expect(validate(validUpdate)).resolves.toHaveLength(0);
    await expect(validate(invalidUpdate)).resolves.toHaveLength(2);
  });
});
