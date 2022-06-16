import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/createLog.dto';
import { Log } from './log.model';
import { LogRepository } from './log.repository';

@Injectable()
export class LogService {
  constructor(private logRepository: LogRepository) {}

  async createManualLog(createLogDto: CreateLogDto) {
    return await this.logRepository.createManualLog(createLogDto);
  }

  async createHttpLog(createLogDto: CreateLogDto) {
    return await this.logRepository.createHttpLog(createLogDto);
  }
}
