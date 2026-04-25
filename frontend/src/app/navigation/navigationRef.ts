import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';
import { useAuthStore } from '../../store/authStore';

type NavAction =
  | { name: keyof RootStackParamList; params?: any }
  | { resetToHome: true };

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const pending: NavAction[] = [];

export function safeNavigate<Name extends keyof RootStackParamList>(
  name: Name,
  params?: RootStackParamList[Name],
) {
  if (navigationRef.isReady()) navigationRef.navigate(name as any, params as any);
  else pending.push({ name, params });
}

export function safeResetToHome() {
  if (navigationRef.isReady()) {
    const status = useAuthStore.getState().status;
    const name: keyof RootStackParamList = status === 'authenticated' ? 'Tabs' : 'Welcome';
    navigationRef.reset({ index: 0, routes: [{ name: name as never }] });
  } else {
    pending.push({ resetToHome: true });
  }
}

export function onNavigationReady() {
  while (pending.length) {
    const action = pending.shift();
    if (!action) continue;
    if ('resetToHome' in action) safeResetToHome();
    else safeNavigate(action.name as any, action.params as any);
  }
}
