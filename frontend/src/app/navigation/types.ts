export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  Tabs: undefined;
  CourseDetail: { courseId: string };
  Lesson: { courseId: string; lessonId: string };
  Quiz: { courseId: string; lessonId: string };
  Progress: undefined;
  WebContent: { url?: string; html?: string; title?: string; courseId?: string; lessonId?: string; completed?: boolean };
  LearningReminders: undefined;
  ReminderWizard: { reminderId?: string } | undefined;
};

export type RootTabParamList = {
  Featured: undefined;
  Search: undefined;
  MyLearning: undefined;
  Wishlist: undefined;
  Account: undefined;
};
