import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes } from 'mongoose';

export type LogDocument = Log & Document;
export enum LogType {
  email = 'email',
  redis = 'redis',
  auth = 'auth',
}

export enum LogSource {
  http = 'http',
  manual = 'manual',
}

@Schema()
export class Log {
  @Prop({ type: SchemaTypes.Mixed })
  data: any;

  @Prop({ enum: LogType })
  type?: LogType;

  @Prop({ enum: LogSource })
  source: LogSource;
}

export const LogSchema = SchemaFactory.createForClass(Log);
