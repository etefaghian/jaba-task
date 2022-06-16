import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export class BaseEntity {
  @Prop()
  _id: string;

  @Prop(Date)
  createdAt: Date;

  @Prop(Date)
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}
