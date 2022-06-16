import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInCompleteUserDto } from './dto/createInCompleteUser.dto';
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

  async createIncompleteUser(createUserDto: CreateInCompleteUserDto) {
    return await this.userModel.create({
      ...createUserDto,
      hasCompleteRegister: false,
    });
  }

  async findOneByEmail(email: string) {
    const user = await this.userModel.findOne({
      email,
    });

    return user ?? null;
  }

  async findOneById(id: string) {
    return (
      (await this.userModel.find({
        _id: id,
      })) ?? null
    );
  }

  async deleteOne(id: string) {
    await this.userModel.updateOne({ _id: id }, { isDeleted: true });
    return true;
  }
}
