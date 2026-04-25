import React, { useMemo } from 'react';
import { FlatList, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourses, useProgress } from '../../../api/hooks';
import { useAuthStore } from '../../../store/authStore';
import { useWishlistStore } from '../../../store/wishlistStore';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { EmptyView, ErrorView } from '../../../ui/components/StateViews';
import { CourseCard } from './CourseCard';
import { colors } from '../../../ui/theme/colors';

export function WishlistScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'> }) {
  const coursesQ = useCourses();
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const progressQ = useProgress();
  const wishedIds = useWishlistStore((s) => s.courseIds);

  const enrolledIds = useMemo(() => {
    if (!authed) return new Set<string>();
    const enrolled = progressQ.data?.courses.filter((c) => c.enrolled).map((c) => c.courseId) ?? [];
    return new Set(enrolled);
  }, [authed, progressQ.data]);

  const wishedCourses = useMemo(() => {
    const all = coursesQ.data ?? [];
    const set = new Set(wishedIds);
    return all.filter((c) => set.has(c.id) && !enrolledIds.has(c.id));
  }, [coursesQ.data, wishedIds, enrolledIds]);

  if (coursesQ.isLoading) return <FullScreenLoading label="Loading..." />;
  if (coursesQ.isError)
    return <Screen>{<ErrorView message={(coursesQ.error as Error).message} onRetry={coursesQ.refetch} />}</Screen>;

  if (!wishedCourses.length) {
    return <Screen>{<EmptyView title="No wishlist courses" subtitle="Tap the heart on any course to save it." />}</Screen>;
  }

  return (
    <Screen scroll={false}>
      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>Saved for later</Text>
      <FlatList
        data={wishedCourses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={() => props.navigation.navigate('CourseDetail', { courseId: item.id })} />
        )}
      />
    </Screen>
  );
}

