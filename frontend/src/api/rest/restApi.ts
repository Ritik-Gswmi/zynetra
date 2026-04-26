import { API_BASE_URL } from '../../config';
import type { Api } from '../api';
import type { AuthResponse, Course, Lesson, ProgressSummary, User } from '../types';

function toFriendlyErrorMessage(res: Response, text: string) {
  const status = res.status;
  const cleanText = String(text ?? '').trim();

  const parsedApiMessage = (() => {
    if (!cleanText) return null;
    try {
      const parsed = JSON.parse(cleanText) as any;
      const msg = parsed?.message;
      if (typeof msg === 'string') return msg.trim();
      if (Array.isArray(msg) && typeof msg[0] === 'string') return String(msg[0]).trim();
      return null;
    } catch {
      return null;
    }
  })();

  // Prefer explicit message from API if it's short and human-readable.
  if (parsedApiMessage && parsedApiMessage.length <= 160) return parsedApiMessage;
  if (cleanText && cleanText.length <= 160 && !/^\{[\s\S]*\}$/.test(cleanText)) return cleanText;

  if (status === 401) return 'Please login to continue.';
  if (status === 403) return 'You don’t have permission to do that.';
  if (status === 404) return 'Something went wrong. Please try again.';
  if (status === 429) return 'Too many requests. Please wait and try again.';
  if (status >= 500) return 'Server error. Please try again in a moment.';
  if (status >= 400) return 'Something went wrong. Please check your input and try again.';

  return 'Something went wrong. Please try again.';
}

async function request<T>(path: string, init?: RequestInit & { token?: string }) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...headers, ...(init?.headers as any) } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Network request failed|Failed to fetch|NetworkError/i.test(msg)) {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    throw e instanceof Error ? e : new Error(msg);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(toFriendlyErrorMessage(res, text));
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text().catch(() => '');
  if (!text || !text.trim()) return undefined as T;
  return JSON.parse(text) as T;
}

export const api: Api = {
  login: (params) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(params) }),
  signup: (params) => request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(params) }),
  updateProfile: ({ token, name, email }) =>
    request<User>('/me', { method: 'PATCH', token, body: JSON.stringify({ name, email }) }),
  getCourses: () => request<Course[]>('/courses'),
  getCourse: (courseId) => request<Course>(`/courses/${courseId}`),
  getLessons: (courseId) => request<Lesson[]>(`/courses/${courseId}/lessons`),
  getLesson: (courseId, lessonId) => request<Lesson>(`/courses/${courseId}/lessons/${lessonId}`),
  enroll: ({ token, courseId }) => request<void>(`/courses/${courseId}/enroll`, { method: 'POST', token }),
  markLessonComplete: ({ token, courseId, lessonId }) =>
    request<void>(`/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'POST', token }),
  submitQuiz: ({ token, courseId, lessonId, answers }) =>
    request<number>(`/courses/${courseId}/lessons/${lessonId}/quiz/submit`, {
      method: 'POST',
      token,
      body: JSON.stringify({ answers }),
    }),
  getProgress: ({ token }) => request<ProgressSummary>('/progress', { token }),
  getWishlist: ({ token }) => request<{ courseIds: string[] }>('/wishlist', { token }),
  setWishlist: ({ token, courseIds }) =>
    request<{ courseIds: string[] }>('/wishlist', { method: 'PUT', token, body: JSON.stringify({ courseIds }) }),
};
