export type GameMode = 'daily' | 'campaign';

export type BoardTheme = 'lagoon' | 'arcade' | 'kids' | 'night';

export type GameScreen = 'TITLE_MENU' | 'PLAYING';

export type ActiveModal = 'NONE' | 'PAUSED' | 'ROUND_SUMMARY' | 'LEADERBOARD' | 'STATS' | 'PACK_SELECT';

export interface LexiconWord {
  word: string; // Full Dhivehi string, e.g. 'ސަޖުރުބި' or 'ދިވެހިރާއްޖެ'
  syllables: string[]; // Atomic Akuru + Fili units, e.g. ['ސަ', 'ޖު', 'ރު', 'ބި']
  meaningEn: string;
  transliteration: string;
  category: string;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface GridCell {
  row: number;
  col: number;
  syllable: string; // One Akuru + Fili unit, e.g., 'ރި'
}

export type WordDirection =
  | 'RTL_HORIZONTAL' // Right to Left (Standard Dhivehi reading order: col decreases or increases depending on grid indexing)
  | 'LTR_HORIZONTAL'
  | 'DOWN_VERTICAL'
  | 'UP_VERTICAL'
  | 'DIAG_DOWN_LEFT'
  | 'DIAG_DOWN_RIGHT'
  | 'DIAG_UP_LEFT'
  | 'DIAG_UP_RIGHT';

export interface PlacedWord {
  id: string;
  word: string;
  syllables: string[];
  meaningEn: string;
  transliteration: string;
  cells: CellCoord[];
  direction: WordDirection;
  found: boolean;
  colorIndex: number;
  hintTierRevealed: number; // 0 = none, 1 = first syllable, 2 = direction, 3 = row/col, 4 = full path
}

export interface LevelConfig {
  id: string;
  titleDv: string;
  titleEn: string;
  subtitleDv: string;
  category: string;
  mode: GameMode;
  gridSize: number; // 8 or 9
  words: LexiconWord[];
  seedKey: string;
  fixedGrid?: string[][]; // Optional exact grid layout (e.g., for the reference image classic level)
}

export interface PlayerProfile {
  nameEn: string;
  nameDv: string;
  atollTag: string;
}

export interface ScoreSubmission {
  id: string;
  playerName: string;
  playerNameDv: string;
  atollTag: string;
  mode: GameMode;
  levelId: string;
  dateKey: string;
  score: number;
  timeSeconds: number;
  wordsFound: number;
  hintsUsed: number;
  streak: number;
  timestamp: number;
}

export interface LevelCompletionRecord {
  levelId: string;
  bestScore: number;
  fastestTimeSeconds: number;
  completedAt: number;
  hintsUsed: number;
}

export interface DailySolveRecord {
  dateKey: string;
  score: number;
  timeSeconds: number;
  hintsUsed: number;
  completedAt: number;
}

export interface PlayerProgress {
  profile: PlayerProfile;
  currentStreak: number;
  bestStreak: number;
  lastDailyDateKey: string | null;
  totalGamesWon: number;
  totalWordsFound: number;
  totalTimePlayedSeconds: number;
  completedLevels: Record<string, LevelCompletionRecord>;
  dailyHistory: Record<string, DailySolveRecord>;
  discoveredWords: Record<string, number>; // word -> count found
  pendingSyncQueue: ScoreSubmission[];
  preferredTheme: BoardTheme;
  showTransliteration: boolean;
  soundMuted: boolean;
}
