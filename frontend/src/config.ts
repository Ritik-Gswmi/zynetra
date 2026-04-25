import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getDevServerHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (typeof hostUri === 'string' && hostUri.length) return hostUri.split(':')[0];

  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    // Older manifests / different runtimes can surface this in different shapes.
    (Constants as any).manifest?.debuggerHost ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any).manifest?.extra?.expoGo?.debuggerHost;

  if (typeof debuggerHost === 'string' && debuggerHost.length) return debuggerHost.split(':')[0];
  return null;
}

export const API_BASE_URL = (() => {
  const explicit = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim();
  if (explicit) return explicit;

  // Web runs on the same machine as the backend, so localhost is correct.
  if (Platform.OS === 'web') return 'http://localhost:3000';

  // On device, "localhost" points to the phone; derive the dev machine IP from Expo dev server.
  const host = getDevServerHost();
  return host ? `http://${host}:3000` : 'http://localhost:3000';
})(); // set to e.g. 'https://your-api.example.com'

export const APP_SCHEME = 'aimicro';
