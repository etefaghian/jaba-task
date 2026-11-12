import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  const config = {
    getOrThrow: jest.fn((key: string) => {
      const values = {
        JWT_SECRET: 'test-secret',
        JWT_ACCESS_TOKEN_TIME_IN_DAYS: 1,
        JWT_REFRESH_TOKEN_TIME_IN_DAYS: 7,
      };
      return values[key];
    }),
  };
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(config as any);
  });

  it('creates and verifies access tokens', () => {
    const payload = {
      uid: 'user-1',
      ver: 1,
      eml: 'person@example.com',
      fnm: 'Pat',
      lnm: 'Lee',
      typ: 'access' as const,
      new: false,
    };

    const token = service.constructJwt(payload);

    expect(service.verifyJwt(token)).toMatchObject(payload);
    expect(jwt.decode(token)).toMatchObject({ typ: 'access', uid: 'user-1' });
  });

  it('uses the refresh-token lifetime for refresh tokens', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = service.constructJwt({
      uid: 'user-1',
      ver: 1,
      eml: 'person@example.com',
      fnm: '',
      lnm: '',
      typ: 'refresh',
      new: false,
    });

    const { exp } = jwt.decode(token) as jwt.JwtPayload;
    expect(exp).toBeGreaterThanOrEqual(now + 7 * 24 * 60 * 60);
  });

  it('rejects tokens that are not access tokens', () => {
    const token = jwt.sign({ typ: 'refresh' }, 'test-secret');
    expect(() => service.verifyJwt(token)).toThrow(
      'type of token is not correct',
    );
  });

  it('rejects tokens signed with a different secret', () => {
    const token = jwt.sign({ typ: 'access' }, 'other-secret');
    expect(() => service.verifyJwt(token)).toThrow();
  });
});
