import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createVideoPlayer, VideoView } from 'expo-video';
import type { VideoPlayer } from 'expo-video';
import type { WebView } from 'react-native-webview';

import type { RootStackParamList } from '../../navigation/types';
import { useLesson, useMarkLessonComplete, useProgress } from '../../../api/hooks';
import { Screen } from '../../../ui/components/Screen';
import { FullScreenLoading } from '../../../ui/components/FullScreenLoading';
import { ErrorView } from '../../../ui/components/StateViews';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { scheduleLessonReminder } from '../../../lib/notifications';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { useThemeStore } from '../../../store/themeStore';
import { useAuthStore } from '../../../store/authStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

const NativeWebView =
  Platform.OS === 'web'
    ? null
    : ((require('react-native-webview') as typeof import('react-native-webview')).WebView as typeof import('react-native-webview').WebView);

export function LessonScreen({ route, navigation }: Props) {
  const { courseId, lessonId } = route.params;
  useThemeStore((s) => s.mode);
  const authed = useAuthStore((s) => s.status === 'authenticated');
  const lessonQ = useLesson(courseId, lessonId);
  const progressQ = useProgress();
  const completeM = useMarkLessonComplete();
  const videoUrl = lessonQ.data?.videoUrl ?? null;
  const youtubeId = lessonQ.data?.youtubeId ?? null;
  const [videoPlayer, setVideoPlayer] = useState<VideoPlayer | null>(null);
  const [youtubeFailed, setYoutubeFailed] = useState(false);
  const [hasReadWebContent, setHasReadWebContent] = useState(false);

  useEffect(() => {
    if (!videoUrl) {
      setVideoPlayer(null);
      return;
    }

    const player = createVideoPlayer({ uri: videoUrl });
    setVideoPlayer(player);

    return () => {
      try {
        player.release();
      } catch {
        // Ignore.
      }
    };
  }, [videoUrl]);

  const completed = useMemo(() => {
    const courseProg = progressQ.data?.courses.find((c) => c.courseId === courseId);
    return Boolean(courseProg?.completedLessonIds.includes(lessonId));
  }, [progressQ.data, courseId, lessonId]);

  const enrolled = useMemo(() => {
    const courseProg = progressQ.data?.courses.find((c) => c.courseId === courseId);
    return Boolean(courseProg?.enrolled);
  }, [progressQ.data, courseId]);

  if (lessonQ.isLoading) return <FullScreenLoading label="Loading lesson..." />;
  if (lessonQ.isError) return <Screen>{<ErrorView message={(lessonQ.error as Error).message} onRetry={lessonQ.refetch} />}</Screen>;
  if (!lessonQ.data) return null;

  const lesson = lessonQ.data;
  const hasYouTube = Boolean(youtubeId);
  const hasMp4 = Boolean(videoUrl);
  const youtubeWatchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

  return (
    <Screen>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '900' }}>{lesson.title}</Text>
      <Text style={{ color: colors.mutedText, marginTop: 8 }}>{lesson.summary}</Text>

      {enrolled && hasMp4 && videoPlayer ? (
        <Card style={{ marginTop: 14, padding: 10 }}>
          <VideoView
            player={videoPlayer}
            nativeControls
            contentFit="contain"
            style={{ width: '100%', height: 220, borderRadius: 12 }}
          />
        </Card>
      ) : null}

      {enrolled && hasYouTube ? (
        Platform.OS === 'web' ? (
          <Card style={{ marginTop: 14 }}>
            <Text style={{ color: colors.text, fontWeight: '900' }}>Video</Text>
            <Text style={{ color: colors.mutedText, marginTop: 6 }}>Open the YouTube video in a new tab.</Text>
            <PrimaryButton
              label="Open YouTube"
              onPress={async () => {
                const url = `https://www.youtube.com/watch?v=${youtubeId}`;
                try {
                  await Linking.openURL(url);
                } catch (e) {
                  Alert.alert('Could not open', e instanceof Error ? e.message : url);
                }
              }}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          <Card style={{ marginTop: 14, padding: 10 }}>
            {NativeWebView ? (
              <NativeWebView
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback
                setSupportMultipleWindows={false}
                thirdPartyCookiesEnabled
                sharedCookiesEnabled
                mixedContentMode="always"
                onError={(e: any) => {
                  setYoutubeFailed(true);
                  if (__DEV__) {
                    const msg = e?.nativeEvent?.description ?? 'Unknown WebView error';
                    Alert.alert('Video error', msg);
                  }
                }}
                onHttpError={(e: any) => {
                  setYoutubeFailed(true);
                  if (__DEV__) {
                    const status = e?.nativeEvent?.statusCode;
                    Alert.alert('Video HTTP error', typeof status === 'number' ? String(status) : 'Unknown');
                  }
                }}
                source={{
                  html: youtubeEmbedHtml({ youtubeId: youtubeId! }),
                  baseUrl: 'https://www.youtube-nocookie.com',
                }}
                allowsFullscreenVideo
                style={{ width: '100%', height: 220, borderRadius: 12, backgroundColor: colors.surface }}
              />
            ) : null}

            {youtubeFailed && youtubeWatchUrl ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ color: colors.mutedText }}>
                  This video canâ€™t be played inline on this device. Open it in YouTube instead.
                </Text>
                <PrimaryButton
                  label="Open in YouTube"
                  onPress={async () => {
                    try {
                      await Linking.openURL(youtubeWatchUrl);
                    } catch (e) {
                      Alert.alert('Could not open', e instanceof Error ? e.message : youtubeWatchUrl);
                    }
                  }}
                  style={{ marginTop: 10 }}
                />
              </View>
            ) : null}
          </Card>
        )
      ) : null}

      {!enrolled ? (
        <Card style={{ marginTop: 14 }}>
          <Text style={{ color: colors.text, fontWeight: '900' }}>Enroll required</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            Only lesson web content is available until you enroll in this course.
          </Text>
          <PrimaryButton
            label={authed ? 'Go back' : 'Login to enroll'}
            onPress={() => (authed ? navigation.goBack() : navigation.navigate('Login'))}
            style={{ marginTop: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          />
        </Card>
      ) : null}

      <Card style={{ marginTop: 14 }}>
        {enrolled ? (
          <>
            <PrimaryButton
              label={completed ? 'Completed' : completeM.isPending ? 'Saving...' : 'Mark as completed'}
              onPress={async () => {
                if (!hasReadWebContent) {
                  Alert.alert('First read the web content');
                  return;
                }
                try {
                  await completeM.mutateAsync({ courseId, lessonId });
                  void useAnalyticsStore.getState().track('lesson_completed', { courseId, lessonId });
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Failed to save progress';
                  if (/login required/i.test(msg)) {
                    Alert.alert('Login required', 'Please login to save your progress.');
                    navigation.navigate('Login');
                    return;
                  }
                  Alert.alert('Failed', msg);
                }
              }}
              disabled={completed || completeM.isPending}
              style={
                completed ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border } : undefined
              }
            />

            <View style={{ height: 10 }} />

            <PrimaryButton
              label="Open web content"
              onPress={() => {
                setHasReadWebContent(true);
                void useAnalyticsStore.getState().track('web_content_opened', { courseId, lessonId });
            navigation.navigate('WebContent', {
              title: 'Lesson web content',
              courseId,
              lessonId,
              completed,
              html: lessonHtml({
                courseId,
                lessonId,
                title: lesson.title,
                summary: lesson.summary,
                webUrl: lesson.webUrl,
                completed,
                showCompleteButton: false,
              }),
            });
          }}
          style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        />

            <View style={{ height: 10 }} />

            <PrimaryButton
              label="Take quiz"
              onPress={() => {
                void useAnalyticsStore.getState().track('quiz_opened', { courseId, lessonId });
                navigation.navigate('Quiz', { courseId, lessonId });
              }}
              style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
            />
          </>
        ) : (
          <PrimaryButton
            label="Open web content"
            onPress={() => {
              setHasReadWebContent(true);
              void useAnalyticsStore.getState().track('web_content_opened', { courseId, lessonId });
              navigation.navigate('WebContent', {
                title: 'Lesson web content',
                courseId,
                lessonId,
                completed,
                html: lessonHtml({
                  courseId,
                  lessonId,
                  title: lesson.title,
                  summary: lesson.summary,
                  webUrl: lesson.webUrl,
                  completed,
                }),
              });
            }}
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          />
        )}
      </Card>

      {enrolled ? (
        <Pressable
          onPress={() => scheduleLessonReminder({ courseId, lessonId, secondsFromNow: 20 })}
          style={{ marginTop: 14 }}
        >
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Remind me again in 20 seconds</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

function lessonHtml(params: {
  courseId: string;
  lessonId: string;
  title: string;
  summary?: string;
  webUrl?: string;
  completed?: boolean;
  showCompleteButton?: boolean;
}) {
  const completed = Boolean(params.completed);
  const showCompleteButton = params.showCompleteButton ?? true;
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
      }
      :root[data-theme="dark"] {
        --bg: #0B1220;
        --card: #0F1A2E;
        --text: #EAF0FF;
        --muted: rgba(234,240,255,0.80);
        --border: rgba(255,255,255,0.10);
        --primary: #6D5BFF;
      }
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; background: var(--bg); color: var(--text); }
      .card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
      .muted { color: var(--muted); }
      .title { font-weight: 900; }
      ul { margin: 10px 0 0 18px; padding: 0; }
      li { margin: 6px 0; }
      .h { font-weight: 900; margin: 0; }
      button { padding: 10px 12px; border-radius: 12px; border: 0; background: var(--primary); color: white; font-weight: 800; width: 100%; }
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
      ${params.summary ? `<div class="muted" style="margin-top: 8px;">${escapeHtml(params.summary)}</div>` : ''}
    </div>

    <div style="height: 14px;"></div>

    <div class="card">
      <div class="h" style="font-size: 16px;">What you'll learn</div>
      <div class="muted" style="margin-top: 8px;">
        This lesson builds an intuition first, then adds a few practical rules you can apply immediately.
      </div>
      <ul>
        <li>Explain the core idea in your own words.</li>
        <li>Spot common mistakes and how to avoid them.</li>
        <li>Apply a simple checklist to real examples.</li>
      </ul>
      <div style="height: 12px;"></div>
      <div class="h" style="font-size: 16px;">Mini example</div>
      <div class="muted" style="margin-top: 8px;">
        If you can describe <b>${escapeHtml(params.title)}</b> as a sequence of small steps, you can usually debug and improve it quickly.
        Try rewriting the idea as: <i>input â†’ transformation â†’ output</i>.
      </div>
      <div style="height: 12px;"></div>
      <div class="h" style="font-size: 16px;">Quick practice</div>
      <div class="muted" style="margin-top: 8px;">
        Pause for 30 seconds and answer: What is the most important constraint or tradeoff in this topic?
        What would you measure to know you improved?
      </div>
    </div>

    <div style="height: 14px;"></div>

    <div class="card">
      <div class="title" style="font-size: 16px;">Check your understanding</div>
      <div class="muted" style="margin-top: 6px;">
        When you feel comfortable with the idea, mark the lesson complete to update your progress in the app.
      </div>
      <div style="height: 12px;"></div>
      ${showCompleteButton ? `<button id="completeBtn" ${completed ? 'disabled' : ''} onclick="
        try {
          var token = '';
          try { token = String(window.__AUTH_TOKEN__ || ''); } catch(e) {}
          if (!token) {
            try { token = String(localStorage.getItem('authToken') || ''); } catch(e) {}
          }
          var canSave = Boolean(token && token.trim().length);
          if (canSave) {
            var b = document.getElementById('completeBtn');
            if (b) { b.disabled = true; b.innerText = 'Completed'; b.style.opacity = '0.75'; }
          }
        } catch(e) {}
        try { window.ReactNativeWebView.postMessage(JSON.stringify({type:'COMPLETE_LESSON', courseId:${JSON.stringify(
          params.courseId,
        )}, lessonId:${JSON.stringify(params.lessonId)}})); } catch(e) {}
      ">${completed ? 'Completed' : 'Mark as completed'}</button>` : ''}
    </div>

  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function youtubeEmbedHtml(params: { youtubeId: string }) {
  // Using an iframe HTML embed is typically more reliable in mobile WebViews than navigating directly to /embed/... .
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    params.youtubeId,
  )}?playsinline=1&modestbranding=1&rel=0&origin=${encodeURIComponent('https://www.youtube-nocookie.com')}`;

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; height: 100%; background: #101A33; }
      .wrap { position: absolute; inset: 0; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <iframe
        src="${src}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>`;
}
