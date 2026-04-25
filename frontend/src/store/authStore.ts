import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { create } from 'zustand';

import { api } from '../api/api';
import type { User } from '../api/types';
import { safeNavigate, safeResetToHome } from '../app/navigation/navigationRef';
import { useWishlistStore } from './wishlistStore';

type AuthStatus = 'loading' | 'guest' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  token: string | null;
  user: User | null;
  error: string | null;
  clearError: () => void;
  hydrate: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  login: (params: { email: string; password: string }) => Promise<void>;
  signup: (params: { name: string; email: string; password: string }) => Promise<void>;
  updateProfile: (params: { name: string; email: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const STORAGE_KEY = 'auth.v1';

function normalizeAuthErrorMessage(msg: string, kind: 'login' | 'signup') {
  const m = String(msg ?? '').trim();
  if (!m) return kind === 'login' ? 'Invalid username or password' : 'Signup failed';

  if (kind === 'login') {
    if (/invalid email or password/i.test(m) || /unauthorized/i.test(m)) return 'Invalid username or password';
    return m;
  }

  if (/email already registered/i.test(m)) return 'Email already registered';
  return m;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  token: null,
  user: null,
  error: null,

  clearError: () => set({ error: null }),

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return set({ status: 'guest' });
      const parsed = JSON.parse(raw) as { token?: string; user?: User };
      if (parsed.token && parsed.user) set({ status: 'authenticated', token: parsed.token, user: parsed.user });
      else set({ status: 'guest' });
    } catch {
      set({ status: 'guest' });
    }
  },

  continueAsGuest: async () => {
    set({ status: 'guest', token: null, user: null, error: null });
    await useWishlistStore.getState().hydrate();
  },

  login: async ({ email, password }) => {
    set({ status: 'loading', error: null });
    try {
      const result = await api.login({ email, password });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      set({ status: 'authenticated', token: result.token, user: result.user, error: null });
      await useWishlistStore.getState().hydrate();
      safeResetToHome();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed';
      set({ status: 'guest', error: normalizeAuthErrorMessage(msg, 'login') });
    }
  },

  signup: async ({ name, email, password }) => {
    set({ status: 'loading', error: null });
    try {
      await api.signup({ name, email, password });
      await AsyncStorage.removeItem(STORAGE_KEY);
      set({ status: 'guest', token: null, user: null, error: null });
      await useWishlistStore.getState().hydrate();
      Alert.alert('Account created successfully', 'Login to continue...');
      safeNavigate('Login');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Signup failed';
      set({ status: 'guest', error: normalizeAuthErrorMessage(msg, 'signup') });
    }
  },

  updateProfile: async ({ name, email }) => {
    const token = get().token;
    if (!token) throw new Error('Login required');
    set({ status: 'loading', error: null });
    try {
      const user = await api.updateProfile({ token, name, email });
      const next = { token, user };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      set({ status: 'authenticated', token, user, error: null });
      safeResetToHome();
    } catch (e) {
      set({ status: 'authenticated', error: e instanceof Error ? e.message : 'Failed to update profile' });
      throw e instanceof Error ? e : new Error('Failed to update profile');
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    set({ status: 'guest', token: null, user: null, error: null });
    await useWishlistStore.getState().hydrate();
    safeResetToHome();
  },
}));
