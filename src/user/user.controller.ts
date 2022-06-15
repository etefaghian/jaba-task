import { Controller, Body, Post } from '@nestjs/common';
import { CompleteRegisterDto } from './dto/completeRegister.dto';
import { LoginDto } from './dto/login.dto';
import { RequestLoginDto } from './dto/requestLogin.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/requestLogin')
  async requestLogin(@Body() requestLoginDto: RequestLoginDto): Promise<any> {
    const result = await this.userService.requestLogin(requestLoginDto);
    return result;
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto): Promise<any> {
    const result = await this.userService.login(loginDto);
    return result;
  }

  @Post('/completeRegister')
  async completeRegister(
    @Body() completeRegisterDto: CompleteRegisterDto,
  ): Promise<any> {
    const result = await this.userService.completeRegister(completeRegisterDto);
    return result;
  }
}