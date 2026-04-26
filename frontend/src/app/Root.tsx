import React from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

import { RootNavigator } from './navigation/RootNavigator';
import { linking } from '../lib/linking';
import { navigationRef, onNavigationReady, safeResetToHome } from './navigation/navigationRef';
import { useBootstrap } from './bootstrap/useBootstrap';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { colors } from '../ui/theme/colors';
import { SplashScreen } from './screens/SplashScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

export function Root() {
  const { ready } = useBootstrap();
  const mode = useThemeStore((s) => s.mode);
  const [showSplash, setShowSplash] = React.useState(true);
  const splashStartMs = React.useRef(Date.now()).current;

 React.useEffect(() => {
  if (!ready) return;
  const minSplashMs = 3000;
  const elapsed = Date.now() - splashStartMs;
  const remaining = Math.max(0, minSplashMs - elapsed);
  const t = setTimeout(() => setShowSplash(false), remaining);
  return () => clearTimeout(t);
 }, [ready, splashStartMs]);

  React.useEffect(() => {
    // Guests should see the Welcome screen every time they open/resume the app
    // until they authenticate (login/signup).
    let prevState: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener('change', (nextState) => {
      const becameActive = (prevState === 'inactive' || prevState === 'background') && nextState === 'active';
      prevState = nextState;
      if (!becameActive) return;
      if (useAuthStore.getState().status !== 'guest') return;
      safeResetToHome();
    });
    return () => sub.remove();
  }, []);

  const handleNavigationReady = React.useCallback(() => {
    onNavigationReady();

    // Cold start: if we are a guest (no login/signup), always land on Welcome
    // even if linking/initial nav state would otherwise open Tabs.
    if (useAuthStore.getState().status === 'guest') safeResetToHome();
  }, []);


  if (!ready || showSplash)
    return (
      <SafeAreaProvider>
        <SplashScreen />
      </SafeAreaProvider>
    );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} backgroundColor={colors.surface} />
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          onReady={handleNavigationReady}
          theme={{
            ...DefaultTheme,
            dark: useThemeStore.getState().mode === 'dark',
            colors: {
              ...DefaultTheme.colors,
              primary: colors.primary,
              background: colors.background,
              card: colors.surface,
              text: colors.text,
              border: colors.border,
              notification: colors.primary,
            },
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
