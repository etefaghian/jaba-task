import { IsEnum, IsOptional } from 'class-validator';
import { LogType } from '../log.model';

export class CreateLogDto {
  @IsOptional()
  data: any;

  @IsEnum(LogType)
  @IsOptional()
  type?: LogType;
}
