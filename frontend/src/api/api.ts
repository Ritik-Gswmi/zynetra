import { API_BASE_URL } from '../config';
import type { AuthResponse, Course, Lesson, ProgressSummary, User } from './types';
import * as mock from './mock/mockApi';
import * as rest from './rest/restApi';

export type Api = {
  login: (params: { email: string; password: string }) => Promise<AuthResponse>;
  signup: (params: { name: string; email: string; password: string }) => Promise<AuthResponse>;
  updateProfile: (params: { token: string; name: string; email: string }) => Promise<User>;
  getCourses: () => Promise<Course[]>;
  getCourse: (courseId: string) => Promise<Course>;
  getLessons: (courseId: string) => Promise<Lesson[]>;
  getLesson: (courseId: string, lessonId: string) => Promise<Lesson>;
  enroll: (params: { token: string; courseId: string }) => Promise<void>;
  markLessonComplete: (params: { token: string; courseId: string; lessonId: string }) => Promise<void>;
  submitQuiz: (params: { token: string; courseId: string; lessonId: string; answers: number[] }) => Promise<number>;
  getProgress: (params: { token: string }) => Promise<ProgressSummary>;
};

export const api: Api = API_BASE_URL ? rest.api : mock.api;
