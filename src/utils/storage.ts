import { MALDIVIAN_ATOLLS } from '../data/lexicon';
import { PlayerProgress, ScoreSubmission } from '../types/game';

const STORAGE_KEY = 'bashoadha_player_progress_v1';

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDefaultProgress(): PlayerProgress {
  return {
    profile: {
      nameEn: 'Dhivehi Explorer',
      nameDv: 'ދިވެހި ކުޅުންތެރިޔާ',
      atollTag: MALDIVIAN_ATOLLS[0],
    },
    currentStreak: 1,
    bestStreak: 1,
    lastDailyDateKey: null,
    totalGamesWon: 0,
    totalWordsFound: 0,
    totalTimePlayedSeconds: 0,
    completedLevels: {},
    dailyHistory: {},
    discoveredWords: {},
    pendingSyncQueue: [],
    preferredTheme: 'kids',
    showTransliteration: true,
    soundMuted: false,
  };
}

export function loadPlayerProgress(): PlayerProgress {
  if (typeof window === 'undefined') return getDefaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const parsed = JSON.parse(raw) as Partial<PlayerProgress>;
    const defaults = getDefaultProgress();
    return {
      ...defaults,
      ...parsed,
      profile: {
        ...defaults.profile,
        ...(parsed.profile || {}),
      },
      completedLevels: parsed.completedLevels || {},
      dailyHistory: parsed.dailyHistory || {},
      discoveredWords: parsed.discoveredWords || {},
      pendingSyncQueue: Array.isArray(parsed.pendingSyncQueue)
        ? parsed.pendingSyncQueue
        : [],
    };
  } catch {
    return getDefaultProgress();
  }
}

export function savePlayerProgress(progress: PlayerProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save player progress:', err);
  }
}

export async function flushOfflineScoreQueue(
  progress: PlayerProgress
): Promise<{ updatedProgress: PlayerProgress; syncedCount: number }> {
  if (progress.pendingSyncQueue.length === 0) {
    return { updatedProgress: progress, syncedCount: 0 };
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { updatedProgress: progress, syncedCount: 0 };
  }

  try {
    const response = await fetch('/api/leaderboard/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: progress.pendingSyncQueue }),
    });

    if (!response.ok) {
      return { updatedProgress: progress, syncedCount: 0 };
    }

    const data = (await response.json()) as { ok: boolean; syncedIds: string[] };
    const syncedSet = new Set(data.syncedIds || []);
    const remaining = progress.pendingSyncQueue.filter((item) => !syncedSet.has(item.id));
    const updatedProgress: PlayerProgress = {
      ...progress,
      pendingSyncQueue: remaining,
    };
    savePlayerProgress(updatedProgress);
    return { updatedProgress, syncedCount: syncedSet.size };
  } catch {
    return { updatedProgress: progress, syncedCount: 0 };
  }
}

export function createScoreSubmission(
  progress: PlayerProgress,
  params: {
    mode: 'daily' | 'campaign';
    levelId: string;
    dateKey: string;
    score: number;
    timeSeconds: number;
    wordsFound: number;
    hintsUsed: number;
    streak: number;
  }
): ScoreSubmission {
  return {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    playerName: progress.profile.nameEn || 'Dhivehi Explorer',
    playerNameDv: progress.profile.nameDv || 'ދިވެހި ކުޅުންތެރިޔާ',
    atollTag: progress.profile.atollTag,
    mode: params.mode,
    levelId: params.levelId,
    dateKey: params.dateKey,
    score: params.score,
    timeSeconds: params.timeSeconds,
    wordsFound: params.wordsFound,
    hintsUsed: params.hintsUsed,
    streak: params.streak,
    timestamp: Date.now(),
  };
}
