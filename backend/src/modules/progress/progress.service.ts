import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { Progress, ProgressDocument } from './progress.schema';

@Injectable()
export class ProgressService {
  constructor(@InjectModel(Progress.name) private readonly progress: Model<ProgressDocument>) {}

  async getOrCreate(userId: string) {
    const existing = await this.progress.findOne({ userId }).exec();
    if (existing) return existing;
    return this.progress.create({ userId });
  }

  async enroll(userId: string, courseId: string) {
    const doc = await this.getOrCreate(userId);
    if (!doc.enrolledCourseIds.includes(courseId)) doc.enrolledCourseIds.push(courseId);
    await doc.save();
    return doc;
  }

  async markLessonComplete(userId: string, courseId: string, lessonId: string) {
    const doc = await this.getOrCreate(userId);
    doc.completedLessonIdsByCourseId[courseId] ??= [];
    if (!doc.completedLessonIdsByCourseId[courseId]!.includes(lessonId)) {
      doc.completedLessonIdsByCourseId[courseId]!.push(lessonId);
    }
    // `completedLessonIdsByCourseId` is stored as a generic Object (Mixed).
    // Mongoose doesn't always detect deep mutations automatically.
    doc.markModified('completedLessonIdsByCourseId');
    await doc.save();
    return doc;
  }

  async setQuizScore(userId: string, lessonKey: string, score: number) {
    const doc = await this.getOrCreate(userId);
    doc.lastQuizScoreByLessonId[lessonKey] = score;
    // `lastQuizScoreByLessonId` is stored as a generic Object (Mixed).
    doc.markModified('lastQuizScoreByLessonId');
    await doc.save();
    return doc;
  }

  async toProgressSummary(userId: string) {
    const doc = await this.getOrCreate(userId);
    const courseIds = Array.from(
      new Set([...doc.enrolledCourseIds, ...Object.keys(doc.completedLessonIdsByCourseId ?? {})]),
    );
    return {
      userId,
      courses: courseIds.map((courseId) => ({
        courseId,
        enrolled: doc.enrolledCourseIds.includes(courseId),
        completedLessonIds: doc.completedLessonIdsByCourseId?.[courseId] ?? [],
        lastQuizScoreByLessonId: doc.lastQuizScoreByLessonId ?? {},
      })),
    };
  }
}
