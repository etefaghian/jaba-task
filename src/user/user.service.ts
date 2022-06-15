import { Injectable } from '@nestjs/common';
import { CompleteRegisterDto } from './dto/completeRegister.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class UserService {
  constructor() {} // private repository: ExerciseInstructionRepository,
  async requestLogin(requestLoginDto: RequestLoginDto) {}
  async login(LoginDto: LoginDto) {}
  async completeRegister(completeRegisterDto: CompleteRegisterDto) {}
}
