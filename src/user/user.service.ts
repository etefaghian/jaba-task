import { Injectable } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { CompleteRegisterDto } from './dto/completeRegister.dto';
import { LoginDto } from './dto/login.dto';
import { RequestLoginDto } from './dto/requestLogin.dto';

@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {} // private repository: ExerciseInstructionRepository,
  async requestLogin(requestLoginDto: RequestLoginDto) {
    console.log('hello from request login');

    await this.emailService.addConfirmationEmailToQueue({
      email: requestLoginDto.email,
      code: '1234',
    });
    return 'all thing is ok';
  }
  async login(LoginDto: LoginDto) {}
  async completeRegister(completeRegisterDto: CompleteRegisterDto) {}
}
