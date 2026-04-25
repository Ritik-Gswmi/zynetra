import React, { useMemo } from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourses, useProgress } from '../../../api/hooks';
import { useAuthStore } from '../../../store/authStore';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { EmptyView, ErrorView } from '../../../ui/components/StateViews';
import { CourseCard } from './CourseCard';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { colors } from '../../../ui/theme/colors';

export function MyLearningScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'> }) {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const coursesQ = useCourses();
  const progressQ = useProgress();

  const enrolledIds = useMemo(() => {
    if (!authed) return new Set<string>();
    const enrolled = progressQ.data?.courses.filter((c) => c.enrolled).map((c) => c.courseId) ?? [];
    return new Set(enrolled);
  }, [authed, progressQ.data]);

  const enrolledCourses = useMemo(() => {
    const all = coursesQ.data ?? [];
    return all.filter((c) => enrolledIds.has(c.id));
  }, [coursesQ.data, enrolledIds]);

  if (coursesQ.isLoading) return <FullScreenLoading label="Loading..." />;
  if (coursesQ.isError)
    return <Screen>{<ErrorView message={(coursesQ.error as Error).message} onRetry={coursesQ.refetch} />}</Screen>;

  if (!authed) {
    return (
      <Screen>
        <EmptyView title="Login to see your learning" subtitle="Enroll in courses to keep progress across sessions." />
        <PrimaryButton label="Login" onPress={() => props.navigation.navigate('Login')} style={{ marginTop: 12 }} />
      </Screen>
    );
  }

  if (!enrolledCourses.length) {
    return <Screen>{<EmptyView title="No enrolled courses yet" subtitle="Enroll in a course from Featured." />}</Screen>;
  }

  return (
    <Screen scroll={false}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>Enrolled</Text>
      <FlatList
        data={enrolledCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={() => props.navigation.navigate('CourseDetail', { courseId: item.id })} />
        )}
      />
    </Screen>
  );
}

