import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as jwt from 'jsonwebtoken';
import { ONE_DAY } from 'utils/date';
@Injectable()
export class AuthService {
  private secret: string;
  constructor(private configService: ConfigService) {
    this.secret = configService.getOrThrow('JWT_SECRET');
  }

  /**
   * @method
   * validate access token
   * @note use another method for refresh token
   * @param token
   * @returns
   */
  verifyJwt(token: string): UserJwtData {
    const data: UserJwtData = jwt.verify(token, this.secret) as any;

    if (data.typ !== 'access') {
      throw new Error('type of token is not correct ');
    }
    return data;
  }

  /**
   * @method
   * generate new jwt token with given data
   * @remark exp set according to typ field in input data
   * @param data
   * @returns
   */
  constructJwt(data: UserJwtData) {
    //construct jwt token from input
    const token = jwt.sign(
      {
        ...data,
        exp:
          data.typ === 'access'
            ? Math.floor(Date.now() / 1000) +
              ONE_DAY *
                this.configService.getOrThrow('JWT_ACCESS_TOKEN_TIME_IN_DAYS')
            : Math.floor(Date.now() / 1000) +
              ONE_DAY *
                this.configService.getOrThrow('JWT_REFRESH_TOKEN_TIME_IN_DAYS'),
      },
      this.secret,
    );
    //return jwt token
    return token;
  }
}

/**
 * @interface
 * represent user data that we store in jwt
 */
export interface UserJwtData {
  uid: string;
  ver: number;
  eml: string;
  fnm: string;
  lnm: string;
  typ: JwtTokenType;
  new: boolean;
}

/**
 * represent variant type of jwt token
 */
export type JwtTokenType = 'access' | 'refresh';
