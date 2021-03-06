import { Controller, Body, Post, UseGuards } from '@nestjs/common';
import { User } from 'utils/decorators/user.decorator';
import { AuthGuard, ShouldRegisterBeComplete } from 'utils/guards/auth.guard';
import { LoginDto } from './dto/login.dto';
import { RequestLoginDto } from './dto/requestLogin.dto';
import { UpdateInCompleteUserDto } from './dto/updateInCompleteUser.dto';
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
  @ShouldRegisterBeComplete(false)
  @UseGuards(AuthGuard)
  async completeRegister(
    @User('_id') id: string,
    @Body() updateInCompleteUserDto: UpdateInCompleteUserDto,
  ): Promise<any> {
    const result = await this.userService.completeRegister(
      id,
      updateInCompleteUserDto,
    );
    return result;
  }
}
