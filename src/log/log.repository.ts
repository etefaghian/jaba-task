import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLogDto } from './dto/createLog.dto';
import { Log, LogSource } from './log.model';

@Injectable()
export class LogRepository {
  constructor(
    @InjectModel(Log.name)
    private readonly logModel: Model<Log>,
  ) {}

  async createManualLog(createLogDto: CreateLogDto) {
    return await this.logModel.create({
      ...createLogDto,
      source: LogSource.manual,
    });
  }

  async createHttpLog(createLogDto: CreateLogDto) {
    return await this.logModel.create({
      ...createLogDto,
      source: LogSource.http,
    });
  }
}
