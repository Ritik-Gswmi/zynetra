import React, { useMemo } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourses, useProgress } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView, EmptyView } from '../../../ui/components/StateViews';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useAnalyticsStore } from '../../../store/analyticsStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Progress'>;

export function ProgressScreen({ navigation }: Props) {
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const events = useAnalyticsStore((s) => s.events);
  const progressQ = useProgress();
  const coursesQ = useCourses();

  const courses = coursesQ.data ?? [];
  const coursesWithProgress = useMemo(() => {
    const byId = new Map(progressQ.data?.courses.map((c) => [c.courseId, c]));
    return courses.map((course) => ({ course, progress: byId.get(course.id) }));
  }, [courses, progressQ.data]);

  if (coursesQ.isLoading) return <FullScreenLoading label="Loading progress…" />;
  if (progressQ.isLoading) return <FullScreenLoading label="Loading progress…" />;
  if (progressQ.isError) return <Screen>{<ErrorView message={(progressQ.error as Error).message} onRetry={progressQ.refetch} />}</Screen>;
  if (coursesQ.isError) return <Screen>{<ErrorView message={(coursesQ.error as Error).message} onRetry={coursesQ.refetch} />}</Screen>;
  if (!courses.length) return <Screen>{<EmptyView title="No courses" />}</Screen>;

  return (
    <Screen scroll={false}>
      {!authed ? (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>Login required</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            Progress tracking is available for authenticated users.
          </Text>
          <PrimaryButton label="Login" onPress={() => navigation.navigate('Login')} style={{ marginTop: 12 }} />
        </Card>
      ) : null}

      {events.length ? (
        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16 }}>Recent activity</Text>
            <Pressable onPress={() => void useAnalyticsStore.getState().clear()}>
              <Text style={{ color: colors.primary, fontWeight: '800' }}>Clear</Text>
            </Pressable>
          </View>
          <View style={{ marginTop: 10, gap: 6 }}>
            {events.slice(0, 5).map((e) => (
              <Text key={e.id} style={{ color: colors.mutedText }} numberOfLines={1}>
                • {e.name}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}

      <FlatList
        data={coursesWithProgress}
        keyExtractor={(x) => x.course.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => {
          const completed = item.progress?.completedLessonIds.length ?? 0;
          const enrolled = Boolean(item.progress?.enrolled);
          return (
            <Pressable onPress={() => navigation.navigate('CourseDetail', { courseId: item.course.id })} style={{ marginBottom: 12 }}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, flex: 1 }}>
                    {item.course.title}
                  </Text>
                  <Text style={{ color: enrolled ? colors.primary : colors.mutedText, fontWeight: '800' }}>
                    {enrolled ? 'Enrolled' : 'Not enrolled'}
                  </Text>
                </View>
                <Text style={{ color: colors.mutedText, marginTop: 8 }}>
                  Lessons completed: {completed}
                </Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
