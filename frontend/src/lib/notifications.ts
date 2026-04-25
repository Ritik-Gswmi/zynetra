import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { safeNavigate } from '../app/navigation/navigationRef';
import { useAnalyticsStore } from '../store/analyticsStore';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  // Web: expo-notifications is a partial implementation and some APIs can throw.
}

let responseSub: Notifications.Subscription | undefined;
const LEARNING_REMINDER_ID_KEY = 'learningReminderNotificationIds';

function navigateFromData(data: Record<string, unknown> | undefined) {
  const courseId = typeof data?.courseId === 'string' ? data.courseId : undefined;
  const lessonId = typeof data?.lessonId === 'string' ? data.lessonId : undefined;

  void useAnalyticsStore.getState().track('notification_clicked', { courseId, lessonId });

  if (courseId && lessonId) safeNavigate('Lesson', { courseId, lessonId });
  else if (courseId) safeNavigate('CourseDetail', { courseId });
  else safeNavigate('Tabs');
}

export async function configureNotifications() {
  if (Platform.OS === 'web') {
    // Browser permission prompts generally require a user gesture; request on-demand instead.
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) {
      await Notifications.requestPermissionsAsync();
    }
  } catch {
    // Ignore: some environments don't support these APIs (e.g. web).
  }
}

export function startNotificationListeners() {
  if (Platform.OS === 'web') return;
  if (responseSub) return;

  try {
    responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, unknown> | undefined;
      navigateFromData(data);
    });

    void Notifications.getLastNotificationResponseAsync().then((last) => {
      if (!last) return;
      const data = last.notification.request.content.data as Record<string, unknown> | undefined;
      navigateFromData(data);
    });
  } catch {
    // Ignore.
  }
}

export async function scheduleLessonReminder(params: {
  courseId: string;
  lessonId?: string;
  secondsFromNow?: number;
}) {
  const triggerSeconds = Math.max(5, params.secondsFromNow ?? 15);
  const data = { courseId: params.courseId, lessonId: params.lessonId };

  if (Platform.OS === 'web') {
    // Web fallback: expo-notifications scheduling isn't supported on web.
    try {
      const WebNotification = (globalThis as any).Notification as any;
      if (!WebNotification) return;
      let permission = WebNotification.permission as string | undefined;
      if (permission !== 'granted' && typeof WebNotification.requestPermission === 'function') {
        permission = (await WebNotification.requestPermission()) as string | undefined;
      }
      if (permission !== 'granted') return;

      globalThis.setTimeout(() => {
        try {
          const n = new WebNotification('Time for a quick lesson', {
            body: 'Continue your micro-learning streak.',
            data,
          });
          n.onclick = () => {
            try {
              globalThis.window?.focus?.();
            } catch {
              // Ignore.
            }
            navigateFromData(data);
            n.close?.();
          };
        } catch {
          // Ignore.
        }
      }, triggerSeconds * 1000);
    } catch {
      // Ignore.
    }
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time for a quick lesson',
        body: 'Continue your micro-learning streak.',
        data,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: triggerSeconds,
        repeats: false,
      },
    });
  } catch {
    // Prevent "Uncaught (in promise)" in environments where scheduling isn't available.
  }
}

export async function scheduleDailyLearningReminder(params: {
  hour: number;
  minute: number;
  frequency: { type: 'daily' } | { type: 'once' } | { type: 'days'; days: number[] };
}) {
  if (Platform.OS === 'web') {
    // Web fallback: no reliable scheduled notifications; keep state in store and let the UI show it as enabled.
    return;
  }

  try {
    await cancelLearningReminder();
  } catch {
    // Ignore.
  }

  try {
    const hour = Math.max(0, Math.min(23, params.hour));
    const minute = Math.max(0, Math.min(59, params.minute));

    const ids: string[] = [];

    if (params.frequency.type === 'daily') {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Learning reminder',
          body: 'Take 5 minutes to continue your course.',
          data: { type: 'LEARNING_REMINDER' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      ids.push(id);
    } else if (params.frequency.type === 'once') {
      const now = new Date();
      const target = new Date();
      target.setHours(hour, minute, 0, 0);
      if (target.getTime() <= now.getTime() + 15_000) {
        target.setDate(target.getDate() + 1);
      }

      const seconds = Math.max(5, Math.round((target.getTime() - now.getTime()) / 1000));
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Learning reminder',
          body: 'Take 5 minutes to continue your course.',
          data: { type: 'LEARNING_REMINDER' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
        },
      });
      ids.push(id);
    } else {
      const days = Array.from(
        new Set((params.frequency.days ?? []).filter((d) => typeof d === 'number' && d >= 0 && d <= 6).map((d) => Math.floor(d))),
      );

      // Expo expects weekday as 1..7 in many environments (Sun..Sat).
      for (const d of days) {
        const weekday = d === 0 ? 1 : d + 1;
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Learning reminder',
            body: 'Take 5 minutes to continue your course.',
            data: { type: 'LEARNING_REMINDER' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            weekday,
            hour,
            minute,
            repeats: true,
          } as any,
        });
        ids.push(id);
      }
    }

    try {
      await AsyncStorage.setItem(LEARNING_REMINDER_ID_KEY, JSON.stringify(ids));
    } catch {
      // Ignore.
    }
  } catch {
    // Ignore: scheduling may not be available in some environments.
  }
}

export async function cancelLearningReminder() {
  if (Platform.OS === 'web') return;
  try {
    const raw = await AsyncStorage.getItem(LEARNING_REMINDER_ID_KEY);
    const ids = raw ? (JSON.parse(raw) as unknown) : null;
    const list = Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : [];
    await Promise.all(list.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null)));
  } catch {
    // Ignore.
  } finally {
    try {
      await AsyncStorage.removeItem(LEARNING_REMINDER_ID_KEY);
    } catch {
      // Ignore.
    }
  }
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) return null;

  // Expo Go (store client) removed Android remote push notification support in SDK 53+.
  // Use a development build (expo-dev-client) or a standalone build for push.
  if (
    Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo' ||
    Constants.expoGoConfig != null
  ) {
    return null;
  }

  try {
    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return null;

    const projectId =
      Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.owner;

    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId: String(projectId) } : undefined,
    );
    return token.data;
  } catch {
    return null;
  }
}

export async function sendPushNotification(params: {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.to,
        title: params.title,
        body: params.body,
        data: params.data ?? {},
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Push request failed (${res.status})`);
    }
  } catch (e) {
    throw e instanceof Error ? e : new Error('Failed to send push notification');
  }
}
