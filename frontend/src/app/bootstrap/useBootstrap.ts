import { useEffect, useState } from 'react';

import { useAuthStore } from '../../store/authStore';
import { configureNotifications, startNotificationListeners } from '../../lib/notifications';
import { useNotificationStore } from '../../store/notificationStore';
import { useAnalyticsStore } from '../../store/analyticsStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useReminderStore } from '../../store/reminderStore';

export function useBootstrap() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Promise.all([
          useAuthStore.getState().hydrate(),
          useNotificationStore.getState().hydrate(),
          useAnalyticsStore.getState().hydrate(),
          useWishlistStore.getState().hydrate(),
          useReminderStore.getState().hydrate(),
          configureNotifications(),
        ]);
        startNotificationListeners();
        await useNotificationStore.getState().refreshPushToken();
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { ready };
}
