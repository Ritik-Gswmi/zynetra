import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { CoursesService } from './courses.service';
import { RequireAuthGuard } from '../auth/require-auth.guard';
import { ProgressService } from '../progress/progress.service';
import { badRequest } from '../../lib/http-errors';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly progress: ProgressService,
  ) {}

  @Get()
  getCourses() {
    return this.courses.getCourses();
  }

  @Get(':courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.courses.getCourse(courseId);
  }

  @Get(':courseId/lessons')
  getLessons(@Param('courseId') courseId: string) {
    return this.courses.getLessons(courseId);
  }

  @Get(':courseId/lessons/:lessonId')
  getLesson(@Param('courseId') courseId: string, @Param('lessonId') lessonId: string) {
    return this.courses.getLesson(courseId, lessonId);
  }

  @UseGuards(RequireAuthGuard)
  @Post(':courseId/enroll')
  async enroll(@Req() req: Request & { user?: any }, @Param('courseId') courseId: string) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');
    await this.progress.enroll(userId, courseId);
    return { ok: true };
  }

  @UseGuards(RequireAuthGuard)
  @Post(':courseId/lessons/:lessonId/complete')
  async completeLesson(
    @Req() req: Request & { user?: any },
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
  ) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');

    const prog = await this.progress.getOrCreate(userId);
    if (!prog.enrolledCourseIds.includes(courseId)) await this.progress.enroll(userId, courseId);

    await this.progress.markLessonComplete(userId, courseId, lessonId);
    return { ok: true };
  }

  @UseGuards(RequireAuthGuard)
  @Post(':courseId/lessons/:lessonId/quiz/submit')
  async submitQuiz(
    @Req() req: Request & { user?: any },
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Body() body: { answers: number[] },
  ) {
    const userId = String((req.user as any)?.userId ?? '');
    if (!userId) badRequest('Unauthorized');

    const prog = await this.progress.getOrCreate(userId);
    if (!prog.enrolledCourseIds.includes(courseId)) badRequest('Enroll required');

    const lesson = this.courses.getLesson(courseId, lessonId);
    const answers = Array.isArray(body.answers) ? body.answers : [];
    if (answers.length !== lesson.quiz.length) badRequest('Invalid answers');

    const correct = lesson.quiz.reduce((acc, q, i) => acc + (answers[i] === q.answerIndex ? 1 : 0), 0);
    const score = lesson.quiz.length ? Math.round((correct / lesson.quiz.length) * 100) : 0;
    await this.progress.setQuizScore(userId, `${courseId}:${lessonId}`, score);
    return { score };
  }
}
