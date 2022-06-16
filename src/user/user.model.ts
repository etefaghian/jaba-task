import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from 'utils/baseEntity';

export type UserDocument = User & Document;

@Schema()
export class User extends BaseEntity {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  hasCompleteRegister: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
