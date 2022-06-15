import { IsString } from 'class-validator';

export class CompleteRegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
