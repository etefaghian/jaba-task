import { UserController } from './user.controller';

describe('UserController', () => {
  const userService = {
    requestLogin: jest.fn(),
    login: jest.fn(),
    completeRegister: jest.fn(),
  };
  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(userService as any);
  });

  it('delegates login-code requests', async () => {
    const dto = { email: 'person@example.com' };
    userService.requestLogin.mockResolvedValue({ ok: true });

    await expect(controller.requestLogin(dto)).resolves.toEqual({ ok: true });
    expect(userService.requestLogin).toHaveBeenCalledWith(dto);
  });

  it('delegates logins', async () => {
    const dto = { email: 'person@example.com', code: '12345' };
    userService.login.mockResolvedValue({ accessToken: 'token' });

    await expect(controller.login(dto)).resolves.toEqual({
      accessToken: 'token',
    });
    expect(userService.login).toHaveBeenCalledWith(dto);
  });

  it('passes the authenticated user id and registration data to the service', async () => {
    const dto = { firstName: 'Pat', lastName: 'Lee' };
    userService.completeRegister.mockResolvedValue({
      user: { firstName: 'Pat' },
    });

    await expect(controller.completeRegister('user-1', dto)).resolves.toEqual({
      user: { firstName: 'Pat' },
    });
    expect(userService.completeRegister).toHaveBeenCalledWith('user-1', dto);
  });
});
