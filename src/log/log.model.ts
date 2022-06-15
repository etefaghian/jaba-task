import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogDocument = Log & Document;
enum LogType {
  email = 'email',
}

enum LogSource {
  http = 'http',
  manual = 'manual',
}

@Schema()
export class Log {
  @Prop()
  data: any;

  @Prop({ enum: LogType })
  type: LogType;

  @Prop({ enum: LogSource })
  source: LogSource;
}

export const LogSchema = SchemaFactory.createForClass(Log);
