import { IsEmail, IsString } from 'class-validator';

export class RequestLoginDto {
  @IsString()
  code: string;
}
