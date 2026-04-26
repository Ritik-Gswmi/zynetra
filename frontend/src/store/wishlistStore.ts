import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { api } from '../api/api';
import { useAuthStore } from './authStore';

type WishlistState = {
  courseIds: string[];
  hydrate: () => Promise<void>;
  toggle: (courseId: string) => Promise<void>;
  has: (courseId: string) => boolean;
  clear: () => Promise<void>;
};

// Store wishlist per user (or guest) so one account doesn't see another's courses.
const STORAGE_KEY = 'wishlist.v3';

function currentUserKey() {
  const s = useAuthStore.getState();
  if (s.status !== 'authenticated' || !s.user) return 'guest';
  return s.user.id || s.user.email || 'guest';
}

type StoredWishlistV3Legacy = { userKey?: unknown; courseIds?: unknown };
type StoredWishlistV3 = { byUserKey?: Record<string, unknown> };

function normalizeIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((x) => typeof x === 'string') as string[];
}

function readIdsForUser(raw: string | null, userKey: string): { ids: string[]; nextRaw: string | null } {
  if (!raw) return { ids: [], nextRaw: null };
  try {
    const parsed = JSON.parse(raw) as StoredWishlistV3 | StoredWishlistV3Legacy;

    // New format: { byUserKey: { [userKey]: string[] } }
    if ('byUserKey' in parsed && parsed.byUserKey && typeof parsed.byUserKey === 'object') {
      const byUserKey = parsed.byUserKey as Record<string, unknown>;
      return { ids: normalizeIds(byUserKey[userKey]), nextRaw: null };
    }

    // Legacy format: { userKey: string, courseIds: string[] }
    const legacy = parsed as StoredWishlistV3Legacy;
    const legacyUserKey = typeof legacy.userKey === 'string' ? legacy.userKey : null;
    const legacyIds = normalizeIds(legacy.courseIds);
    if (!legacyUserKey) return { ids: [], nextRaw: null };

    // Migrate legacy -> new (keep other users empty; legacy only stored one user anyway).
    const migrated = JSON.stringify({ byUserKey: { [legacyUserKey]: legacyIds } satisfies Record<string, string[]> });
    const ids = legacyUserKey === userKey ? legacyIds : [];
    return { ids, nextRaw: migrated };
  } catch {
    return { ids: [], nextRaw: null };
  }
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  courseIds: [],

  hydrate: async () => {
    const auth = useAuthStore.getState();
    // For authenticated users, wishlist should persist across reinstalls/builds,
    // so we source truth from the backend (with local fallback if offline).
    if (auth.status === 'authenticated' && auth.token) {
      const userKey = currentUserKey();
      const localIds = await (async () => {
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          return readIdsForUser(raw, userKey).ids;
        } catch {
          return [];
        }
      })();

      try {
        const res = await api.getWishlist({ token: auth.token });
        const remoteIds = normalizeIds(res?.courseIds);
        const merged = Array.from(new Set([...remoteIds, ...localIds]));
        set({ courseIds: merged });

        // If local has data but server doesn't (common on first upgrade),
        // push the merged list so it survives reinstall.
        if (merged.length !== remoteIds.length) {
          try {
            await api.setWishlist({ token: auth.token, courseIds: merged });
          } catch {
            // Ignore.
          }
        }

        // Keep a local cache as a best-effort fallback.
        try {
          const raw = await AsyncStorage.getItem(STORAGE_KEY);
          const { nextRaw } = readIdsForUser(raw, userKey);
          const base = nextRaw ?? raw;
          const parsed = base ? (JSON.parse(base) as StoredWishlistV3) : ({} as StoredWishlistV3);
          const byUserKey: Record<string, string[]> = {};
          if (parsed.byUserKey && typeof parsed.byUserKey === 'object') {
            for (const [k, v] of Object.entries(parsed.byUserKey)) byUserKey[k] = normalizeIds(v);
          }
          byUserKey[userKey] = merged;
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ byUserKey } satisfies StoredWishlistV3));
        } catch {
          // Ignore.
        }
        return;
      } catch {
        // Fall back to local cache below.
      }
    }
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const userKey = currentUserKey();
      const { ids, nextRaw } = readIdsForUser(raw, userKey);
      set({ courseIds: ids });
      if (nextRaw) await AsyncStorage.setItem(STORAGE_KEY, nextRaw);
    } catch {
      // Ignore.
    }
  },

  has: (courseId) => get().courseIds.includes(courseId),

  toggle: async (courseId) => {
    const current = get().courseIds;
    const next = current.includes(courseId) ? current.filter((id) => id !== courseId) : [...current, courseId];
    set({ courseIds: next });

    const auth = useAuthStore.getState();
    if (auth.status === 'authenticated' && auth.token) {
      try {
        await api.setWishlist({ token: auth.token, courseIds: next });
      } catch {
        // Ignore (local cache below keeps UI stable; will resync on next successful hydrate/toggle).
      }
    }

    try {
      const userKey = currentUserKey();
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const { nextRaw } = readIdsForUser(raw, userKey);
      const base = nextRaw ?? raw;
      const parsed = base ? (JSON.parse(base) as StoredWishlistV3) : ({} as StoredWishlistV3);
      const byUserKey: Record<string, string[]> = {};
      if (parsed.byUserKey && typeof parsed.byUserKey === 'object') {
        for (const [k, v] of Object.entries(parsed.byUserKey)) byUserKey[k] = normalizeIds(v);
      }
      byUserKey[userKey] = next;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ byUserKey } satisfies StoredWishlistV3));
    } catch {
      // Ignore.
    }
  },

  clear: async () => {
    set({ courseIds: [] });

    const auth = useAuthStore.getState();
    if (auth.status === 'authenticated' && auth.token) {
      try {
        await api.setWishlist({ token: auth.token, courseIds: [] });
      } catch {
        // Ignore.
      }
    }

    try {
      const userKey = currentUserKey();
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const { nextRaw } = readIdsForUser(raw, userKey);
      const base = nextRaw ?? raw;
      const parsed = base ? (JSON.parse(base) as StoredWishlistV3) : ({} as StoredWishlistV3);
      const byUserKey: Record<string, string[]> = {};
      if (parsed.byUserKey && typeof parsed.byUserKey === 'object') {
        for (const [k, v] of Object.entries(parsed.byUserKey)) byUserKey[k] = normalizeIds(v);
      }
      delete byUserKey[userKey];
      if (!Object.keys(byUserKey).length) await AsyncStorage.removeItem(STORAGE_KEY);
      else await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ byUserKey } satisfies StoredWishlistV3));
    } catch {
      // Ignore.
    }
  },
}));
