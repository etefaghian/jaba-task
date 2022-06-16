import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { generateRandomNumber } from 'utils/generateRandomNumber';
import { CompleteRegisterDto } from './dto/completeRegister.dto';
import { LoginDto } from './dto/login.dto';
import { RequestLoginDto } from './dto/requestLogin.dto';

@Injectable()
export class UserService {
  constructor(
    private emailService: EmailService,
    private redisService: RedisService,
    private authService: AuthService,
  ) {} // private repository: ExerciseInstructionRepository,
  async requestLogin(requestLoginDto: RequestLoginDto) {
    //construct a random string
    const randomNumber = generateRandomNumber(5);

    //save random string in in memory db
    this.redisService.setSmsCode(randomNumber, requestLoginDto.email);

    //send email to user according to given email
    await this.emailService.addConfirmationEmailToQueue({
      email: requestLoginDto.email,
      code: randomNumber,
    });

    return { ok: true };
  }
  async login(loginDto: LoginDto) {
    //find user from database
    //checks codes is equal or not
    const code = await this.redisService.getSmsCode(loginDto.email);
    if (code !== loginDto.code) {
      throw new Error('token is not equal');
    }

    //generate access and refresh token
    const accessToken = this.authService.constructJwt({
      ver: 1,
      typ: 'access',
      lnm: 'from db',
      fnm: 'from db',
      eml: loginDto.email,
      uid: '',
    });

    const refreshToken = this.authService.constructJwt({
      ver: 1,
      typ: 'access',
      lnm: 'from db',
      fnm: 'from db',
      eml: loginDto.email,
      uid: '',
    });
    //delete redis record
    this.redisService.deleteSmsCode(loginDto.email);
    //set token validity in redis
    this.redisService.setUserValidity(accessToken, true);
    //checks user is new or not

    //return result
    return { accessToken, refreshToken };
  }
  async completeRegister(completeRegisterDto: CompleteRegisterDto) {}
}
