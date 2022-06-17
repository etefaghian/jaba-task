import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInCompleteUserDto } from './dto/createInCompleteUser.dto';
import { UpdateInCompleteUserDto } from './dto/updateInCompleteUser.dto';
import { User } from './user.model';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async updateInCompleteRegister(
    id: string,
    updateUserDto: UpdateInCompleteUserDto,
  ) {
    return await this.userModel.findOneAndUpdate(
      { _id: id },
      { ...updateUserDto, hasCompleteRegister: true },
      {
        new: true,
      },
    );
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

  async findOneById(id: string): Promise<User | null> {
    return (
      (await this.userModel.findOne({
        _id: id,
      })) ?? null
    );
  }

  async deleteOne(id: string) {
    await this.userModel.updateOne({ _id: id }, { isDeleted: true });
    return true;
  }
}
