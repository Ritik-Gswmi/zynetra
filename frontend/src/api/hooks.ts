import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from './api';
import { useAuthStore } from '../store/authStore';

export function useCourses() {
  return useQuery({ queryKey: ['courses'], queryFn: api.getCourses });
}

export function useCourse(courseId: string) {
  return useQuery({ queryKey: ['course', courseId], queryFn: () => api.getCourse(courseId) });
}

export function useLessons(courseId: string) {
  return useQuery({ queryKey: ['lessons', courseId], queryFn: () => api.getLessons(courseId) });
}

export function useLesson(courseId: string, lessonId: string) {
  return useQuery({ queryKey: ['lesson', courseId, lessonId], queryFn: () => api.getLesson(courseId, lessonId) });
}

export function useProgress() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    // Include `token` so cached authenticated progress can't be shown to a guest session.
    queryKey: ['progress', token ?? 'guest'],
    queryFn: () => api.getProgress({ token: token! }),
    enabled: Boolean(token),
  });
}

export function useEnrollCourse() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: (courseId: string) => {
      if (!token) throw new Error('Login required');
      return api.enroll({ token, courseId });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}

export function useMarkLessonComplete() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: (params: { courseId: string; lessonId: string }) => {
      if (!token) throw new Error('Login required');
      return api.markLessonComplete({ token, ...params });
    },
    onSuccess: async (_data, vars) => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['progress'] }),
        qc.invalidateQueries({ queryKey: ['lesson', vars.courseId, vars.lessonId] }),
      ]);
    },
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);
  return useMutation({
    mutationFn: (params: { courseId: string; lessonId: string; answers: number[] }) => {
      if (!token) throw new Error('Login required');
      return api.submitQuiz({ token, ...params });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['progress'] });
    },
  });
}
