import { IsString } from 'class-validator';

export class UpdateInCompleteUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
