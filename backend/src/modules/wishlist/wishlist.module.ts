import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Wishlist, WishlistSchema } from './wishlist.schema';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { RequireAuthGuard } from '../auth/require-auth.guard';

@Module({
  imports: [MongooseModule.forFeature([{ name: Wishlist.name, schema: WishlistSchema }])],
  controllers: [WishlistController],
  providers: [WishlistService, RequireAuthGuard],
  exports: [WishlistService],
})
export class WishlistModule {}

