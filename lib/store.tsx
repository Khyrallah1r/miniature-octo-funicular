import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { adhkarById } from '@/lib/data';

export const FONT_STEPS = [0.85, 1, 1.15, 1.3] as const;
export const FONT_LABELS = ['صغير', 'عادي', 'كبير', 'كبير جدًا'] as const;

export type ReminderTime = { hour: number; minute: number };

export type Preferences = {
  themeMode: 'light' | 'dark' | 'system';
  fontStep: number;
  remindersEnabled: boolean;
  morning: ReminderTime;
  evening: ReminderTime;
};

export type Progress = Record<string, number>;

const DEFAULT_PREFERENCES: Preferences = {
  themeMode: 'light',
  fontStep: 1,
  remindersEnabled: false,
  morning: { hour: 6, minute: 30 },
  evening: { hour: 18, minute: 30 },
};

const STORAGE_KEY = 'hisn-al-muslim:v1';

type StoredState = {
  preferences: Preferences;
  favorites: number[];
  progress: Progress;
  lastCategoryId: number | null;
};

type StoreValue = {
  hydrated: boolean;
  preferences: Preferences;
  favorites: number[];
  progress: Progress;
  lastCategoryId: number | null;
  isFavorite: (zekrId: number) => boolean;
  toggleFavorite: (zekrId: number) => void;
  countOf: (zekrId: number) => number;
  bumpCount: (zekrId: number) => void;
  resetZekr: (zekrId: number) => void;
  resetChapter: (categoryId: number) => void;
  setPreferences: (patch: Partial<Preferences>) => void;
  setLastCategory: (categoryId: number) => void;
  toggleTheme: () => void;
  cycleFontStep: (direction: 1 | -1) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [lastCategoryId, setLastCategoryId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const skipFirstPersist = useRef(true);

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive || !raw) return;
        const parsed = JSON.parse(raw) as Partial<StoredState>;
        if (parsed.preferences) {
          setPreferencesState({ ...DEFAULT_PREFERENCES, ...parsed.preferences });
        }
        if (Array.isArray(parsed.favorites)) setFavorites(parsed.favorites);
        if (parsed.progress && typeof parsed.progress === 'object') setProgress(parsed.progress);
        if (typeof parsed.lastCategoryId === 'number') setLastCategoryId(parsed.lastCategoryId);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    const payload: StoredState = { preferences, favorites, progress, lastCategoryId };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => undefined);
  }, [preferences, favorites, progress, lastCategoryId, hydrated]);

  const isFavorite = useCallback((zekrId: number) => favorites.includes(zekrId), [favorites]);

  const toggleFavorite = useCallback((zekrId: number) => {
    setFavorites((current) =>
      current.includes(zekrId) ? current.filter((id) => id !== zekrId) : [zekrId, ...current]
    );
  }, []);

  const countOf = useCallback((zekrId: number) => progress[String(zekrId)] ?? 0, [progress]);

  const bumpCount = useCallback((zekrId: number) => {
    const target = adhkarById.get(zekrId)?.repeat ?? 1;
    setProgress((current) => {
      const key = String(zekrId);
      const next = Math.min((current[key] ?? 0) + 1, target);
      if (next === (current[key] ?? 0)) return current;
      return { ...current, [key]: next };
    });
  }, []);

  const resetZekr = useCallback((zekrId: number) => {
    setProgress((current) => {
      const key = String(zekrId);
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }, []);

  const resetChapter = useCallback((categoryId: number) => {
    setProgress((current) => {
      const next = { ...current };
      let changed = false;
      for (const zekr of adhkarById.values()) {
        if (zekr.categoryId === categoryId && next[String(zekr.id)]) {
          delete next[String(zekr.id)];
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, []);

  const setPreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferencesState((current) => ({ ...current, ...patch }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferencesState((current) => {
      const resolvedDark =
        current.themeMode === 'dark' ? true : current.themeMode === 'light' ? false : false;
      return { ...current, themeMode: resolvedDark ? 'light' : 'dark' };
    });
  }, []);

  const cycleFontStep = useCallback((direction: 1 | -1) => {
    setPreferencesState((current) => ({
      ...current,
      fontStep: Math.min(FONT_STEPS.length - 1, Math.max(0, current.fontStep + direction)),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      hydrated,
      preferences,
      favorites,
      progress,
      lastCategoryId,
      isFavorite,
      toggleFavorite,
      countOf,
      bumpCount,
      resetZekr,
      resetChapter,
      setPreferences,
      setLastCategory: setLastCategoryId,
      toggleTheme,
      cycleFontStep,
    }),
    [
      hydrated,
      preferences,
      favorites,
      progress,
      lastCategoryId,
      isFavorite,
      toggleFavorite,
      countOf,
      bumpCount,
      resetZekr,
      resetChapter,
      setPreferences,
      toggleTheme,
      cycleFontStep,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}
