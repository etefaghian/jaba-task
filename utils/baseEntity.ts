import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

/**
 * @class
 * base entity for add required field that each entity needs it
 */
export class BaseEntity {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}
