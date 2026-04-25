import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { User, UserSchema } from './users.schema';
import { MeController } from './me.controller';
import { RequireAuthGuard } from '../auth/require-auth.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersService, RequireAuthGuard],
  controllers: [MeController],
  exports: [UsersService],
})
export class UsersModule {}

