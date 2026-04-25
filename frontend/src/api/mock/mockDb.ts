import AsyncStorage from '@react-native-async-storage/async-storage';

type MockUser = { id: string; name: string; email: string; password: string };
type TokenMap = Record<string, string>; // token -> userId
type UserProgress = {
  enrolledCourseIds: string[];
  completedLessonIdsByCourseId: Record<string, string[]>;
  lastQuizScoreByLessonId: Record<string, number | undefined>;
};

type MockDb = {
  users: MockUser[];
  tokens: TokenMap;
  progressByUserId: Record<string, UserProgress>;
};

const DB_KEY = 'mockdb.v1';

function defaultDb(): MockDb {
  return { users: [], tokens: {}, progressByUserId: {} };
}

export async function loadDb(): Promise<MockDb> {
  const raw = await AsyncStorage.getItem(DB_KEY);
  if (!raw) return defaultDb();
  try {
    return JSON.parse(raw) as MockDb;
  } catch {
    return defaultDb();
  }
}

export async function saveDb(db: MockDb) {
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function ensureUserProgress(db: MockDb, userId: string): UserProgress {
  db.progressByUserId[userId] ??= {
    enrolledCourseIds: [],
    completedLessonIdsByCourseId: {},
    lastQuizScoreByLessonId: {},
  };
  return db.progressByUserId[userId]!;
}

