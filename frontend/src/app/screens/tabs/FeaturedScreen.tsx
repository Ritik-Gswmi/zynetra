import React, { useMemo } from 'react';
import { FlatList, ImageBackground, Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourses } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView, EmptyView } from '../../../ui/components/StateViews';
import { colors } from '../../../ui/theme/colors';
import { CourseCard } from './CourseCard';
import { useThemeStore } from '../../../store/themeStore';

export function FeaturedScreen(props: { navigation: NativeStackNavigationProp<RootStackParamList, 'Tabs'> }) {
  const coursesQ = useCourses();
  const courses = coursesQ.data ?? [];
  const mode = useThemeStore((s) => s.mode);

  const hero = useMemo(() => courses[0] ?? null, [courses]);

  if (coursesQ.isLoading) return <FullScreenLoading label="Loading..." />;
  if (coursesQ.isError)
    return <Screen>{<ErrorView message={(coursesQ.error as Error).message} onRetry={coursesQ.refetch} />}</Screen>;
  if (!courses.length) return <Screen>{<EmptyView title="No courses yet" subtitle="Check back later." />}</Screen>;

  return (
    <Screen scroll={false}>
      {hero ? (
        <Pressable onPress={() => props.navigation.navigate('CourseDetail', { courseId: hero.id })}>
          <ImageBackground
            source={hero.coverImageUrl ? { uri: hero.coverImageUrl } : undefined}
            style={{ height: 190, borderRadius: 18, overflow: 'hidden', marginBottom: 12, backgroundColor: colors.surface }}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', padding: 14, justifyContent: 'flex-end' }}>
              <Text style={{ color: mode === 'light' ? 'white' : colors.text, fontSize: 22, fontWeight: '800' }} numberOfLines={2}>
                {hero.title}
              </Text>
              <Text style={{ color: mode === 'light' ? 'rgba(255,255,255,0.82)' : colors.mutedText, marginTop: 6 }} numberOfLines={2}>
                {hero.description}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      ) : null}

      <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16, marginBottom: 10 }}>All courses</Text>

      <FlatList
        data={courses}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => (
          <CourseCard course={item} onPress={() => props.navigation.navigate('CourseDetail', { courseId: item.id })} />
        )}
      />
    </Screen>
  );
}
