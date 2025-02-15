/* eslint-disable prettier/prettier */
import { CreateNewUserDto } from '@dtos/user.dto';
import { User } from '@entities/user.entities';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UUID } from 'crypto';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async saveNewUser(input: CreateNewUserDto): Promise<User> {
    new this.userModel({email:input.email, role: input.role}).save();
    return new this.userModel(input).save();
  }
  async findById(id: UUID) {
    return this.userModel.findById(id, { hash: 0 });
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findByEmailTest(email: string) {
    const isCheck = await this.userModel.findOne({ email });
    return isCheck.id
  }

}
