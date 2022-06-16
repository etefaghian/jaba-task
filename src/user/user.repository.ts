import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/createUser.dto';
import { User } from './user.model';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userModel.create(createUserDto);
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({
      email,
    });

    return user ?? null;
  }

  async findOneById(id: string) {
    return await this.userModel.find({
      _id: id,
    });
  }

  async deleteOne(id: string) {
    await this.userModel.updateOne({ _id: id }, { isDeleted: true });
  }
}
