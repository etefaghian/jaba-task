import { Injectable } from '@nestjs/common';

import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
  verifyJwt(token: string) {
    const data = jwt.verify(token, secret);
    return data;
  }

  constructJwt(data: UserJwtData) {
    //construct jwt token from input
    const token = jwt.sign(
      {
        exp:
          data.typ === 'access'
            ? Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
            : Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60,
        ...data,
      },
      secret,
    );
    //return jwt token
    return token;
  }
}

export interface UserJwtData {
  uid: string;
  ver: number;
  eml: string;
  fnm: string;
  lnm: string;
  typ: JwtTokenType;
  new: boolean;
}

export type JwtTokenType = 'access' | 'refresh';
export const secret = 'secret';
