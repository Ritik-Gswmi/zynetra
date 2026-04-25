import React, { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourses } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView, EmptyView } from '../../../ui/components/StateViews';
import { colors } from '../../../ui/theme/colors';
import { TextField } from '../../../ui/components/TextField';
import { CourseCard } from './CourseCard';

export function SearchScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'> }) {
  const coursesQ = useCourses();
  const courses = coursesQ.data ?? [];
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter((c) => `${c.title} ${c.description} ${c.instructorName ?? ''}`.toLowerCase().includes(needle));
  }, [courses, q]);

  if (coursesQ.isLoading) return <FullScreenLoading label="Loading..." />;
  if (coursesQ.isError)
    return <Screen>{<ErrorView message={(coursesQ.error as Error).message} onRetry={coursesQ.refetch} />}</Screen>;

  return (
    <Screen scroll={false}>
      <View style={{ marginBottom: 10 }}>
        <TextField label="Search courses" value={q} onChangeText={setQ} placeholder="Try: data science, devops, genai..." />
      </View>

      {!filtered.length ? (
        <EmptyView title="No results" subtitle="Try a different keyword." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingBottom: 18 }}
          renderItem={({ item }) => (
            <CourseCard course={item} onPress={() => props.navigation.navigate('CourseDetail', { courseId: item.id })} />
          )}
          ListHeaderComponent={
            q.trim() ? (
              <Text style={{ color: colors.mutedText, marginBottom: 10 }}>
                Showing {filtered.length} result{filtered.length === 1 ? '' : 's'}
              </Text>
            ) : null
          }
        />
      )}
    </Screen>
  );
}

