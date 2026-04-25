import type { Api } from '../api';
import type { AuthResponse, Course, Lesson, ProgressSummary, User } from '../types';
import { courses, lessonsByCourseId } from './mockData';
import { ensureUserProgress, loadDb, saveDb } from './mockDb';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function newId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function newToken() {
  return 'tok_' + newId();
}

async function requireUserId(token: string): Promise<string> {
  const db = await loadDb();
  const userId = db.tokens[token];
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

async function authResponse(user: { id: string; name: string; email: string }): Promise<AuthResponse> {
  const token = newToken();
  const db = await loadDb();
  db.tokens[token] = user.id;
  ensureUserProgress(db, user.id);
  await saveDb(db);
  return { token, user };
}

export const api: Api = {
  login: async ({ email, password }) => {
    await sleep(350);
    const db = await loadDb();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) throw new Error('Invalid email or password');
    return authResponse({ id: user.id, name: user.name, email: user.email });
  },

  signup: async ({ name, email, password }) => {
    await sleep(350);
    const db = await loadDb();
    const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) throw new Error('Email already registered');
    const user = { id: newId(), name, email, password };
    db.users.push(user);
    await saveDb(db);
    return authResponse({ id: user.id, name: user.name, email: user.email });
  },

  updateProfile: async ({ token, name, email }): Promise<User> => {
    await sleep(250);
    const userId = await requireUserId(token);
    const db = await loadDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Unauthorized');

    const nextName = String(name ?? '').trim();
    const nextEmail = String(email ?? '').trim();
    if (!nextName) throw new Error('Name is required');
    if (!nextEmail) throw new Error('Email is required');

    const emailTaken = db.users.some((u) => u.id !== userId && u.email.toLowerCase() === nextEmail.toLowerCase());
    if (emailTaken) throw new Error('Email already registered');

    user.name = nextName;
    user.email = nextEmail;
    await saveDb(db);
    return { id: user.id, name: user.name, email: user.email };
  },

  getCourses: async (): Promise<Course[]> => {
    await sleep(250);
    return courses;
  },

  getCourse: async (courseId: string): Promise<Course> => {
    await sleep(250);
    const course = courses.find((c) => c.id === courseId);
    if (!course) throw new Error('Course not found');
    return course;
  },

  getLessons: async (courseId: string): Promise<Lesson[]> => {
    await sleep(250);
    return lessonsByCourseId[courseId] ?? [];
  },

  getLesson: async (courseId: string, lessonId: string): Promise<Lesson> => {
    await sleep(250);
    const lesson = (lessonsByCourseId[courseId] ?? []).find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  },

  enroll: async ({ token, courseId }) => {
    await sleep(250);
    const userId = await requireUserId(token);
    const db = await loadDb();
    const progress = ensureUserProgress(db, userId);
    if (!progress.enrolledCourseIds.includes(courseId)) progress.enrolledCourseIds.push(courseId);
    await saveDb(db);
  },

  markLessonComplete: async ({ token, courseId, lessonId }) => {
    await sleep(250);
    const userId = await requireUserId(token);
    const db = await loadDb();
    const progress = ensureUserProgress(db, userId);
    progress.completedLessonIdsByCourseId[courseId] ??= [];
    const ids = progress.completedLessonIdsByCourseId[courseId]!;
    if (!ids.includes(lessonId)) ids.push(lessonId);
    await saveDb(db);
  },

  submitQuiz: async ({ token, courseId, lessonId, answers }) => {
    await sleep(350);
    const userId = await requireUserId(token);
    const lesson = (lessonsByCourseId[courseId] ?? []).find((l) => l.id === lessonId);
    if (!lesson) throw new Error('Lesson not found');
    const correct = lesson.quiz.reduce((acc, q, idx) => (answers[idx] === q.answerIndex ? acc + 1 : acc), 0);
    const score = lesson.quiz.length ? Math.round((correct / lesson.quiz.length) * 100) : 0;

    const db = await loadDb();
    const progress = ensureUserProgress(db, userId);
    progress.lastQuizScoreByLessonId[lessonId] = score;
    await saveDb(db);
    return score;
  },

  getProgress: async ({ token }): Promise<ProgressSummary> => {
    await sleep(250);
    const userId = await requireUserId(token);
    const db = await loadDb();
    const progress = ensureUserProgress(db, userId);

    return {
      userId,
      courses: courses.map((c) => ({
        courseId: c.id,
        enrolled: progress.enrolledCourseIds.includes(c.id),
        completedLessonIds: progress.completedLessonIdsByCourseId[c.id] ?? [],
        lastQuizScoreByLessonId: progress.lastQuizScoreByLessonId,
      })),
    };
  },
};
