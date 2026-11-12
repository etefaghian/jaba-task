import { HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserService', () => {
  const emailService = {
    addConfirmationEmailToQueue: jest.fn(),
    addLoginNotificationToQueue: jest.fn(),
  };
  const redisService = {
    setSmsCode: jest.fn(),
    getSmsCode: jest.fn(),
    deleteSmsCode: jest.fn(),
    setUserValidity: jest.fn(),
  };
  const authService = { constructJwt: jest.fn() };
  const userRepository = {
    findOneByEmail: jest.fn(),
    createIncompleteUser: jest.fn(),
    findOneById: jest.fn(),
    updateInCompleteRegister: jest.fn(),
  };
  let service: UserService;

  const user = {
    _id: { toString: () => 'user-1' },
    email: 'person@example.com',
    firstName: 'Pat',
    lastName: 'Lee',
  };

  afterEach(() => jest.restoreAllMocks());

  beforeEach(() => {
    jest.clearAllMocks();
    redisService.setSmsCode.mockResolvedValue(true);
    redisService.getSmsCode.mockResolvedValue('12345');
    redisService.deleteSmsCode.mockResolvedValue(1);
    redisService.setUserValidity.mockResolvedValue(true);
    emailService.addConfirmationEmailToQueue.mockResolvedValue(undefined);
    emailService.addLoginNotificationToQueue.mockResolvedValue(undefined);
    userRepository.findOneByEmail.mockResolvedValue(user);
    userRepository.createIncompleteUser.mockResolvedValue(user);
    userRepository.findOneById.mockResolvedValue(user);
    userRepository.updateInCompleteRegister.mockResolvedValue(user);
    authService.constructJwt.mockImplementation((payload) => payload.typ);
    service = new UserService(
      emailService as any,
      redisService as any,
      authService as any,
      userRepository as any,
    );
  });

  it('stores the login code before queueing the verification email', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.12345);
    const result = await service.requestLogin({ email: user.email });

    expect(result).toEqual({ ok: true });
    expect(redisService.setSmsCode).toHaveBeenCalledWith('12345', user.email);
    expect(emailService.addConfirmationEmailToQueue).toHaveBeenCalledWith({
      email: user.email,
      code: '12345',
    });
  });

  it('rejects an incorrect one-time code without creating a session', async () => {
    await expect(
      service.login({ email: user.email, code: 'wrong' }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
    expect(userRepository.findOneByEmail).not.toHaveBeenCalled();
    expect(emailService.addLoginNotificationToQueue).not.toHaveBeenCalled();
  });

  it('creates a new user, creates tokens, consumes the code, and queues a notice', async () => {
    userRepository.findOneByEmail.mockResolvedValue(null);
    const result = await service.login({ email: user.email, code: '12345' });

    expect(userRepository.createIncompleteUser).toHaveBeenCalledWith({
      email: user.email,
      hasCompleteRegister: false,
    });
    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      isUserNew: true,
    });
    expect(
      authService.constructJwt.mock.calls.map(([payload]) => payload.typ),
    ).toEqual(['access', 'refresh']);
    expect(redisService.deleteSmsCode).toHaveBeenCalledWith(user.email);
    expect(redisService.setUserValidity).toHaveBeenCalledWith('access', true);
    expect(emailService.addLoginNotificationToQueue).toHaveBeenCalledWith(
      user.email,
    );
  });

  it('does not fail a valid login if notification queueing fails', async () => {
    emailService.addLoginNotificationToQueue.mockRejectedValue(
      new Error('queue down'),
    );

    await expect(
      service.login({ email: user.email, code: '12345' }),
    ).resolves.toMatchObject({ isUserNew: false });
  });

  it('returns not found if registration user does not exist', async () => {
    userRepository.findOneById.mockResolvedValue(null);

    await expect(
      service.completeRegister('missing', {
        firstName: 'Pat',
        lastName: 'Lee',
      }),
    ).rejects.toMatchObject({ status: HttpStatus.NOT_FOUND });
  });

  it('updates registration and returns access and refresh tokens', async () => {
    const result = await service.completeRegister('user-1', {
      firstName: 'Pat',
      lastName: 'Lee',
    });

    expect(userRepository.updateInCompleteRegister).toHaveBeenCalledWith(
      'user-1',
      { firstName: 'Pat', lastName: 'Lee' },
    );
    expect(result.tokens).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(
      authService.constructJwt.mock.calls.map(([payload]) => payload.typ),
    ).toEqual(['access', 'refresh']);
  });
});
