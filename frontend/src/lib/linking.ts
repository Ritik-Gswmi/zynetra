import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';

import type { RootStackParamList } from '../app/navigation/types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'aimicro://'],
  config: {
    screens: {
      Tabs: '',
      CourseDetail: 'course/:courseId',
      Lesson: 'lesson/:courseId/:lessonId',
      Progress: 'progress',
      WebContent: 'web',
      Login: 'login',
      Signup: 'signup',
    },
  },
};
