import { Injectable } from '@nestjs/common';
import { Log } from './log.model';

@Injectable()
export class LogService {
  async addLog(log: Log) {}
}
