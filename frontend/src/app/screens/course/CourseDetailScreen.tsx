import React, { useMemo } from 'react';
import { Alert, FlatList, Image, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../../navigation/types';
import { useCourse, useEnrollCourse, useLessons, useProgress } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView, EmptyView } from '../../../ui/components/StateViews';
import { colors } from '../../../ui/theme/colors';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useAuthStore } from '../../../store/authStore';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { useThemeStore } from '../../../store/themeStore';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ route, navigation }: Props) {
  const { courseId } = route.params;
  const mode = useThemeStore((s) => s.mode);
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const courseQ = useCourse(courseId);
  const lessonsQ = useLessons(courseId);
  const progressQ = useProgress();
  const enrollM = useEnrollCourse();

  const enrolled = useMemo(() => {
    const courseProg = progressQ.data?.courses.find((c) => c.courseId === courseId);
    return Boolean(courseProg?.enrolled);
  }, [progressQ.data, courseId]);

  if (courseQ.isLoading || lessonsQ.isLoading) return <FullScreenLoading label="Loading course..." />;
  if (courseQ.isError) return <Screen>{<ErrorView message={(courseQ.error as Error).message} onRetry={courseQ.refetch} />}</Screen>;
  if (lessonsQ.isError) return <Screen>{<ErrorView message={(lessonsQ.error as Error).message} onRetry={lessonsQ.refetch} />}</Screen>;
  if (!courseQ.data) return <Screen>{<EmptyView title="Course not found" />}</Screen>;

  const lessons = lessonsQ.data ?? [];
  const completedSet = new Set(
    progressQ.data?.courses.find((c) => c.courseId === courseId)?.completedLessonIds ?? [],
  );

  return (
    <Screen scroll={false}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {courseQ.data.coverImageUrl ? (
            <Image
              source={{ uri: courseQ.data.coverImageUrl }}
              style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: colors.surface }}
            />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '900' }}>{courseQ.data.title}</Text>
            {courseQ.data.instructorName ? (
              <Text style={{ color: colors.mutedText, marginTop: 4 }}>By {courseQ.data.instructorName}</Text>
            ) : null}
            <Text style={{ color: colors.mutedText, marginTop: 8 }}>{courseQ.data.description}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <PrimaryButton
            label={enrolled ? 'Enrolled' : !authed ? 'Login to enroll' : enrollM.isPending ? 'Enrolling…' : 'Enroll'}
            onPress={async () => {
              if (!authed) return navigation.navigate('Login');
              try {
                await enrollM.mutateAsync(courseId);
                void useAnalyticsStore.getState().track('course_enrolled', { courseId });
              } catch (e) {
                Alert.alert('Failed', e instanceof Error ? e.message : 'Failed to enroll');
              }
            }}
            disabled={enrolled || enrollM.isPending}
            style={
              enrolled
                ? { flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
                : { flex: 1 }
            }
          />
          <PrimaryButton
            label="Course Overview"
            onPress={() =>
              navigation.navigate('WebContent', {
                title: 'Course Overview',
                courseId,
                html: courseHtml({
                  title: courseQ.data.title,
                  description: courseQ.data.description,
                  outline: courseQ.data.outline,
                  lessons: lessons.map((l) => ({
                    title: l.title,
                    summary: l.summary,
                    durationMinutes: l.durationMinutes,
                  })),
                }),
              })
            }
            style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          />
        </View>
      </Card>

      <FlatList
        data={lessons}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ paddingBottom: 18 }}
        renderItem={({ item }) => {
          const completed = completedSet.has(item.id);
          return (
            <Pressable
              onPress={() => {
                if (!enrolled) {
                  Alert.alert('Enroll required', 'Please enroll in this course to access lessons.');
                  return;
                }
                void useAnalyticsStore.getState().track('lesson_opened', { courseId, lessonId: item.id });
                navigation.navigate('Lesson', { courseId, lessonId: item.id });
              }}
              style={{ marginBottom: 12 }}
            >
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '900', flex: 1 }}>{item.title}</Text>
                  <Text style={{ color: completed ? colors.primary : colors.mutedText, fontWeight: '800' }}>
                    {completed ? 'Done' : `${item.durationMinutes}m`}
                  </Text>
                </View>
                <Text style={{ color: colors.mutedText, marginTop: 6 }}>{item.summary}</Text>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyView title="No lessons yet" subtitle="This course has no lessons." />}
      />
    </Screen>
  );
}

function courseHtml(params: {
  title: string;
  description?: string;
  lessons: Array<{ title: string; summary?: string; durationMinutes: number }>;
  outline?: Array<{ title: string; topics: Array<{ title: string; points: string[] }> }>;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root {
        --bg: #F9FAFB;
        --card: #FFFFFF;
        --text: #0F172A;
        --muted: rgba(15,23,42,0.70);
        --border: rgba(15,23,42,0.12);
        --primary: #4F46E5;
        --chipBg: rgba(79,70,229,0.10);
      }
      :root[data-theme="dark"] {
        --bg: #0B1220;
        --card: #0F1A2E;
        --text: #EAF0FF;
        --muted: rgba(234,240,255,0.80);
        --border: rgba(255,255,255,0.10);
        --primary: #6D5BFF;
        --chipBg: rgba(109,91,255,0.18);
      }
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; background: var(--bg); color: var(--text); }
      .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
      .muted { color: var(--muted); }
      .chip { display: inline-block; padding: 6px 10px; border-radius: 999px; background: var(--chipBg); color: var(--primary); font-weight: 700; margin-top: 10px; }
      .lesson { margin-top: 10px; }
      .row { display: flex; justify-content: space-between; gap: 10px; }
      .title { font-weight: 900; }
      ul { margin: 8px 0 0 18px; padding: 0; }
      li { margin: 6px 0; }
    </style>
    <script>
      (function() {
        try {
          var t = (window.__APP_THEME__ || localStorage.getItem('appTheme') || 'light').replace(/"/g,'');
          document.documentElement.dataset.theme = t === 'dark' ? 'dark' : 'light';
        } catch (e) {}
      })();
    </script>
  </head>
  <body>
    <div class="card">
      <div class="title" style="font-size: 20px;">${escapeHtml(params.title)}</div>
      ${params.description ? `<div class="muted" style="margin-top: 8px;">${escapeHtml(params.description)}</div>` : ''}
    </div>

    <div style="height: 14px;"></div>

    ${
      params.outline?.length
        ? `<div class="card">
            <div class="title" style="font-size: 16px;">Topics</div>
            <div class="muted" style="margin-top: 6px;">High-level topics and sub-topics.</div>
            ${params.outline
              .map(
                (section) => `
                  <div style="margin-top: 12px;">
                    <div class="title">${escapeHtml(section.title)}</div>
                    ${section.topics
                      .map(
                        (topic) => `
                          <div style="margin-top: 10px;">
                            <div class="title" style="font-weight: 800;">${escapeHtml(topic.title)}</div>
                            <ul>
                              ${topic.points.map((p) => `<li class="muted">${escapeHtml(p)}</li>`).join('')}
                            </ul>
                          </div>
                        `,
                      )
                      .join('')}
                  </div>
                `,
              )
              .join('')}
          </div>
          <div style="height: 14px;"></div>`
        : ''
    }

    <div class="card">
      <div class="title" style="font-size: 16px;">Lessons</div>
      <div class="muted" style="margin-top: 6px;">Tap a lesson in the app to start learning.</div>
      ${params.lessons
        .map(
          (l) => `
            <div class="lesson">
              <div class="row">
                <div class="title">${escapeHtml(l.title)}</div>
                <div class="muted" style="white-space: nowrap;">${escapeHtml(String(l.durationMinutes))}m</div>
              </div>
              ${l.summary ? `<div class="muted" style="margin-top: 6px;">${escapeHtml(l.summary)}</div>` : ''}
            </div>
          `,
        )
        .join('')}
    </div>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
