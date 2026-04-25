import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, Platform, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WebView } from 'react-native-webview';

import type { RootStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../../store/authStore';
import { Screen } from '../../../ui/components/Screen';
import { Card } from '../../../ui/components/Card';
import { colors } from '../../../ui/theme/colors';
import { useMarkLessonComplete } from '../../../api/hooks';
import { useAnalyticsStore } from '../../../store/analyticsStore';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { useThemeStore } from '../../../store/themeStore';

const NativeWebView =
  Platform.OS === 'web'
    ? null
    : ((require('react-native-webview') as typeof import('react-native-webview')).WebView as typeof import('react-native-webview').WebView);

type Props = NativeStackScreenProps<RootStackParamList, 'WebContent'>;

export function WebContentScreen({ route, navigation }: Props) {
  const mode = useThemeStore((s) => s.mode);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const completeM = useMarkLessonComplete();

  const webRef = useRef<WebView>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const title = route.params.title ?? 'Learning content';

  useEffect(() => {
    void useAnalyticsStore.getState().track('webview_opened', {
      title,
      hasHtml: route.params.html != null,
      hasUrl: route.params.url != null,
    });
  }, [route.params.html, route.params.url, title]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!webRef.current) return;

    const js = `
      (function() {
        try { window.__APP_THEME__ = ${JSON.stringify(mode)}; } catch(e) {}
        try { localStorage.setItem('appTheme', ${JSON.stringify(mode)}); } catch(e) {}
        try { document.documentElement.dataset.theme = ${JSON.stringify(mode)}; } catch(e) {}
      })();
      true;
    `;

    try {
      webRef.current.injectJavaScript(js);
    } catch {
      // Ignore.
    }
  }, [mode]);

  const injected = useMemo(() => {
    const safeToken = token ?? '';
    const safeEmail = user?.email ?? '';
    const safeTheme = mode;
    return `
      (function() {
        try { window.__AUTH_TOKEN__ = ${JSON.stringify(safeToken)}; } catch(e) {}
        try { localStorage.setItem('authToken', ${JSON.stringify(safeToken)}); } catch(e) {}
        try { localStorage.setItem('userEmail', ${JSON.stringify(safeEmail)}); } catch(e) {}
        try { window.__APP_THEME__ = ${JSON.stringify(safeTheme)}; } catch(e) {}
        try { localStorage.setItem('appTheme', ${JSON.stringify(safeTheme)}); } catch(e) {}
        try { document.documentElement.dataset.theme = ${JSON.stringify(safeTheme)}; } catch(e) {}
      })();
      true;
    `;
  }, [token, user?.email, mode]);

  const source = useMemo(() => {
    if (route.params.html != null) return { html: route.params.html, baseUrl: 'https://bytelearn.local' };
    if (route.params.url != null)
      return { uri: route.params.url, headers: token ? { Authorization: `Bearer ${token}` } : undefined };
    return { html: emptyHtml(), baseUrl: 'https://bytelearn.local' };
  }, [route.params.html, route.params.url, token]);

  const webOpenUrl = useMemo(() => {
    if (route.params.url) return route.params.url;
    if (route.params.html) return `data:text/html;charset=utf-8,${encodeURIComponent(route.params.html)}`;
    return null;
  }, [route.params.html, route.params.url]);

  return (
    <Screen scroll={false}>
      <Card style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.text, fontWeight: '900' }}>{title}</Text>
        <Text style={{ color: colors.mutedText, marginTop: 6 }}>Interactive course content</Text>
      </Card>

      {Platform.OS === 'web' ? (
        <Card>
          <Text style={{ color: colors.text, fontWeight: '900' }}>Web fallback</Text>
          <Text style={{ color: colors.mutedText, marginTop: 6 }}>
            WebView isn’t supported on Expo Web. Open the content in a new tab.
          </Text>
          <PrimaryButton
            label={webOpenUrl ? 'Open content' : 'No content'}
            disabled={!webOpenUrl}
            onPress={async () => {
              if (!webOpenUrl) return;
              try {
                await Linking.openURL(webOpenUrl);
              } catch (e) {
                Alert.alert('Could not open', e instanceof Error ? e.message : 'Failed to open content');
              }
            }}
            style={{ marginTop: 12 }}
          />
        </Card>
      ) : (
        <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
          {NativeWebView ? (
            <NativeWebView
              key={route.params.html != null ? mode : 'static'}
              ref={webRef as any}
              source={source as any}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
              injectedJavaScriptBeforeContentLoaded={injected}
              onMessage={async (evt: any) => {
                const msg = evt.nativeEvent.data;
                let parsed: any = null;
                try {
                  parsed = JSON.parse(msg);
                } catch {
                  parsed = { type: 'TEXT', value: msg };
                }

                if (parsed?.type === 'AUTH_INJECTED') return;

                if (parsed?.type === 'OPEN_URL' && typeof parsed?.url === 'string') {
                  try {
                    await Linking.openURL(parsed.url);
                  } catch {
                    Alert.alert('Could not open link', parsed.url);
                  }
                  return;
                }

                if (parsed?.type === 'PING') {
                  if (__DEV__) setLastMessage('PING');
                  return;
                }

                if (__DEV__) setLastMessage(typeof parsed?.type === 'string' ? parsed.type : msg);

                if (parsed?.type === 'COMPLETE_LESSON') {
                  const courseId =
                    (typeof parsed?.courseId === 'string' && parsed.courseId) || route.params.courseId || 'foundations';
                  const lessonId =
                    (typeof parsed?.lessonId === 'string' && parsed.lessonId) || route.params.lessonId || 'tokens';
                  Alert.alert('Lesson completed', 'Saving your progress…');
                  try {
                    await completeM.mutateAsync({ courseId, lessonId });
                    void useAnalyticsStore.getState().track('lesson_completed', {
                      courseId,
                      lessonId,
                      source: 'webview',
                    });
                  } catch (e) {
                    const msg = e instanceof Error ? e.message : 'Failed to save progress';
                    if (/login required/i.test(msg)) {
                      Alert.alert('Login required', 'Please login to save your progress.');
                      navigation.navigate('Login');
                      return;
                    }
                    Alert.alert('Failed', msg);
                  }
                }
              }}
            />
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function emptyHtml() {
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
      }
      :root[data-theme="dark"] {
        --bg: #0B1220;
        --card: #0F1A2E;
        --text: #EAF0FF;
        --muted: rgba(234,240,255,0.80);
        --border: rgba(255,255,255,0.10);
      }
      body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; padding: 16px; background: var(--bg); color: var(--text); }
      .card { border: 1px solid var(--border); border-radius: 14px; padding: 14px; background: var(--card); }
      .muted { color: var(--muted); }
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
      <h2 style="margin:0 0 8px 0;">No course content loaded</h2>
      <div class="muted">
        Open a course or lesson, then tap <b>Open web content</b> to view related material here.
      </div>
    </div>
  </body>
</html>`;
}
