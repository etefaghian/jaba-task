import { validate } from 'class-validator';
import { CreateLogDto } from './createLog.dto';
import { LogType } from '../log.model';

describe('CreateLogDto', () => {
  it('accepts optional data and supported log types', async () => {
    const dto = Object.assign(new CreateLogDto(), {
      type: LogType.email,
      data: { event: 'sent' },
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
    await expect(validate(new CreateLogDto())).resolves.toHaveLength(0);
  });

  it('rejects unsupported log types', async () => {
    const dto = Object.assign(new CreateLogDto(), { type: 'other' });
    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
