import { LogService } from './log.service';

describe('LogService', () => {
  const repository = {
    createManualLog: jest.fn(),
    createHttpLog: jest.fn(),
  };
  let service: LogService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LogService(repository as any);
  });

  it('delegates manual logs to the repository', async () => {
    const dto = { data: { event: 'login' } };
    repository.createManualLog.mockResolvedValue('saved');

    await expect(service.createManualLog(dto)).resolves.toBe('saved');
    expect(repository.createManualLog).toHaveBeenCalledWith(dto);
  });

  it('delegates HTTP logs to the repository', async () => {
    const dto = { data: { path: '/user/login' } };
    repository.createHttpLog.mockResolvedValue('saved');

    await expect(service.createHttpLog(dto)).resolves.toBe('saved');
    expect(repository.createHttpLog).toHaveBeenCalledWith(dto);
  });
});
