import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProgressDocument = HydratedDocument<Progress>;

@Schema({ timestamps: true })
export class Progress {
  @Prop({ required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: [String], default: [] })
  enrolledCourseIds!: string[];

  @Prop({ type: Object, default: {} })
  completedLessonIdsByCourseId!: Record<string, string[]>;

  @Prop({ type: Object, default: {} })
  lastQuizScoreByLessonId!: Record<string, number | undefined>;
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);

