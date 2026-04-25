import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { registerForPushNotificationsAsync } from '../lib/notifications';

type NotificationState = {
  pushToken: string | null;
  hydrate: () => Promise<void>;
  refreshPushToken: () => Promise<void>;
};

const STORAGE_KEY = 'pushToken.v1';

export const useNotificationStore = create<NotificationState>((set) => ({
  pushToken: null,

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) set({ pushToken: raw });
  },

  refreshPushToken: async () => {
    try {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;
      await AsyncStorage.setItem(STORAGE_KEY, token);
      set({ pushToken: token });
    } catch {
      // Ignore.
    }
  },
}));
