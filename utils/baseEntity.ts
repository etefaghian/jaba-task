import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

export class BaseEntity {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}
