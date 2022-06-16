import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class CreateInCompleteUserDto {
  @IsEmail()
  email: string;

  @IsBoolean()
  hasCompleteRegister: boolean;
}
