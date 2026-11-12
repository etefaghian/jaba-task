import { LogRepository } from './log.repository';
import { LogSource } from './log.model';

describe('LogRepository', () => {
  const model = { create: jest.fn() };
  let repository: LogRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new LogRepository(model as any);
    model.create.mockImplementation(async (record) => record);
  });

  it('marks manually created records as manual logs', async () => {
    const dto = { type: 'email' as any, data: { status: 'sent' } };
    await expect(repository.createManualLog(dto)).resolves.toEqual({
      ...dto,
      source: LogSource.manual,
    });
  });

  it('marks HTTP records as HTTP logs', async () => {
    const dto = { data: { path: '/user/login' } };
    await expect(repository.createHttpLog(dto)).resolves.toEqual({
      ...dto,
      source: LogSource.http,
    });
  });
});
