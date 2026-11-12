import { IsBoolean, IsEmail } from 'class-validator';

export class CreateInCompleteUserDto {
  @IsEmail()
  email: string;

  @IsBoolean()
  hasCompleteRegister: boolean;
}
