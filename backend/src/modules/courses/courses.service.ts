import { Injectable } from '@nestjs/common';
import { courses, lessonsByCourseId } from '../../data/catalog';
import { badRequest } from '../../lib/http-errors';

@Injectable()
export class CoursesService {
  getCourses() {
    return courses;
  }

  getCourse(courseId: string) {
    const c = courses.find((x) => x.id === courseId);
    if (!c) badRequest('Course not found');
    return c;
  }

  getLessons(courseId: string) {
    return lessonsByCourseId[courseId] ?? [];
  }

  getLesson(courseId: string, lessonId: string) {
    const l = (lessonsByCourseId[courseId] ?? []).find((x) => x.id === lessonId);
    if (!l) badRequest('Lesson not found');
    return l;
  }
}

