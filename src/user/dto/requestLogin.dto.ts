import { IsEmail, IsString } from 'class-validator';

export class RequestLoginDto {
  @IsEmail()
  email: string;
}
