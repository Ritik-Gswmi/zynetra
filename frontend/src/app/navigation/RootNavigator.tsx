import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from './types';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { CourseDetailScreen } from '../screens/course/CourseDetailScreen';
import { LessonScreen } from '../screens/lesson/LessonScreen';
import { QuizScreen } from '../screens/quiz/QuizScreen';
import { ProgressScreen } from '../screens/progress/ProgressScreen';
import { WebContentScreen } from '../screens/web/WebContentScreen';
import { colors } from '../../ui/theme/colors';
import { TabsNavigator } from './TabsNavigator';
import { LearningRemindersScreen } from '../screens/reminders/LearningRemindersScreen';
import { ReminderWizardScreen } from '../screens/reminders/ReminderWizardScreen';
import { ThemeToggle } from '../../ui/components/ThemeToggle';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { WelcomeScreen } from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  useThemeStore((s) => s.mode);
  const status = useAuthStore((s) => s.status);
  const initialRouteName: keyof RootStackParamList = status === 'authenticated' ? 'Tabs' : 'Welcome';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
        headerRight: () => <ThemeToggle />,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="Tabs"
        component={TabsNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Course' }} />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Lesson' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ title: 'Progress' }} />
      <Stack.Screen
        name="WebContent"
        component={WebContentScreen}
        options={({ route }) => ({ title: route.params?.title ?? 'Web' })}
      />
      <Stack.Screen name="LearningReminders" component={LearningRemindersScreen} options={{ title: 'Learning reminders' }} />
      <Stack.Screen name="ReminderWizard" component={ReminderWizardScreen} options={{ title: 'Learning reminders' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign up' }} />
    </Stack.Navigator>
  );
}
