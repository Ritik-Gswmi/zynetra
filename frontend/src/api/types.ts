export type User = {
  id: string;
  name: string;
  email: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  instructorName?: string;
  coverImageUrl?: string;
  outline?: CourseOutlineSection[];
};

export type CourseOutlineSection = {
  title: string;
  topics: Array<{
    title: string;
    points: string[];
  }>;
};

export type Lesson = {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  videoKind?: 'mp4' | 'youtube';
  videoUrl?: string;
  youtubeId?: string;
  webUrl?: string;
  summary: string;
  quiz: QuizQuestion[];
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;
};

export type CourseProgress = {
  courseId: string;
  enrolled: boolean;
  completedLessonIds: string[];
  lastQuizScoreByLessonId: Record<string, number | undefined>;
};

export type ProgressSummary = {
  userId: string;
  courses: CourseProgress[];
};

export type AuthResponse = { token: string; user: User };
