import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}

  async findById(id: string) {
    return this.users.findById(id).exec();
  }

  async findByEmail(email: string) {
    return this.users.findOne({ email }).exec();
  }

  async create(params: { name: string; email: string; passwordHash: string }) {
    const doc = await this.users.create(params);
    return doc;
  }

  async updateProfile(userId: string, params: { name?: string; email?: string }) {
    const next: Partial<User> = {};
    if (params.name != null) next.name = params.name.trim();
    if (params.email != null) next.email = params.email.trim().toLowerCase();
    return this.users.findByIdAndUpdate(userId, { $set: next }, { new: true }).exec();
  }
}

