import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Log, LogSchema } from './log.model';
import { LogRepository } from './log.repository';
import { LogService } from './log.service';

@Module({
  providers: [LogRepository, LogService],
  exports: [LogService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Log.name,
        schema: LogSchema,
      },
    ]),
  ],
})
@Global()
export class LogModule {}
