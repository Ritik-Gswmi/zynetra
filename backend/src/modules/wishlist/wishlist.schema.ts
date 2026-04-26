import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WishlistDocument = HydratedDocument<Wishlist>;

@Schema({ timestamps: true })
export class Wishlist {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: [String], default: [] })
  courseIds!: string[];
}

export const WishlistSchema = SchemaFactory.createForClass(Wishlist);

