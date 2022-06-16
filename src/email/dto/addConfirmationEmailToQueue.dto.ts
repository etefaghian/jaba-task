import { IsEmail, IsString } from 'class-validator';

export class AddConfirmationEmailToQueueDto {
  @IsEmail()
  email: string;
  @IsString()
  code: string;
}
