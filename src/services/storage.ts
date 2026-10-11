import {
  Achievement,
  AppSettings,
  Difficulty,
  HighScoreRecord,
  Question,
  UserStats,
} from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { QUESTIONS } from '../data/questions';

const STATS_KEY = 'tahaddi_user_stats';
const HIGHSCORES_KEY = 'tahaddi_high_scores';
const ACHIEVEMENTS_KEY = 'tahaddi_achievements';
const SETTINGS_KEY = 'tahaddi_settings';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  timerEnabled: true,
  timerDurationSeconds: 20,
  darkMode: true,
  vibrateEnabled: true,
  aiGenerationEnabled: true,
};

const DEFAULT_STATS: UserStats = {
  totalPoints: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  totalWrong: 0,
  bestStreak: 0,
  categoryWins: {},
  unlockedAchievements: [],
  dailyStreak: 0,
};

/**
 * Normalizes Arabic text for lenient matching (e.g., handles alif variants, taa marbuta, diacritics)
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove Tashkeel (diacritics)
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize Alif
    .replace(/[أإآ]/g, 'ا')
    // Normalize Taa Marbuta
    .replace(/ة/g, 'ه')
    // Normalize Yaa / Alif Maqsura
    .replace(/ى/g, 'ي')
    // Remove punctuation & symbols
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟?]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ');
}

export function checkAnswerMatch(userInput: string, question: Question): boolean {
  const normInput = normalizeArabicText(userInput);
  const normCorrect = normalizeArabicText(question.correctAnswer);

  if (normInput === normCorrect) return true;

  if (question.acceptableAnswers && question.acceptableAnswers.length > 0) {
    return question.acceptableAnswers.some((ans) => normalizeArabicText(ans) === normInput);
  }

  return false;
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore localStorage write error
  }
}

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore localStorage write error
  }
}

export function normalizeNumerals(str: string): string {
  const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return str.replace(/[٠-٩]/g, (w) => `${easternDigits.indexOf(w)}`);
}

export function formatDateWithLatinNumerals(date: Date = new Date()): string {
  return date.toLocaleDateString('ar-EG-u-nu-latn', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function loadHighScores(): HighScoreRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HIGHSCORES_KEY);
    if (!raw) return [];
    const list: HighScoreRecord[] = JSON.parse(raw);
    return list.map((item) => ({
      ...item,
      date: normalizeNumerals(item.date || ''),
    }));
  } catch {
    return [];
  }
}

export function saveHighScore(record: Omit<HighScoreRecord, 'id' | 'date'>): HighScoreRecord {
  const current = loadHighScores();
  const newRecord: HighScoreRecord = {
    ...record,
    id: 'hs_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    date: formatDateWithLatinNumerals(),
  };

  // Keep top 50 scores sorted descending
  const updated = [newRecord, ...current].sort((a, b) => b.score - a.score).slice(0, 50);
  try {
    localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore error
  }

  return newRecord;
}

export function loadAchievements(): Achievement[] {
  if (typeof window === 'undefined') return INITIAL_ACHIEVEMENTS;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!raw) return INITIAL_ACHIEVEMENTS;
    const saved = JSON.parse(raw) as Record<string, { isUnlocked: boolean; unlockedAt?: string }>;
    return INITIAL_ACHIEVEMENTS.map((ach) => {
      const state = saved[ach.id];
      if (state) {
        return {
          ...ach,
          isUnlocked: state.isUnlocked,
          unlockedAt: state.unlockedAt ? normalizeNumerals(state.unlockedAt) : undefined,
        };
      }
      return ach;
    });
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]): void {
  if (typeof window === 'undefined') return;
  try {
    const state: Record<string, { isUnlocked: boolean; unlockedAt?: string }> = {};
    achievements.forEach((a) => {
      state[a.id] = { isUnlocked: a.isUnlocked, unlockedAt: a.unlockedAt };
    });
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(state));
  } catch {
    // Ignore error
  }
}

export function checkAndUnlockAchievements(
  stats: UserStats,
  currentRoundStats?: {
    difficulty: Difficulty;
    correctCount: number;
    totalCount: number;
    maxStreak: number;
    isDaily?: boolean;
    categoryId: string;
  }
): { newlyUnlocked: Achievement[]; allAchievements: Achievement[] } {
  const allAchievements = loadAchievements();
  const newlyUnlocked: Achievement[] = [];
  const nowStr = formatDateWithLatinNumerals();

  allAchievements.forEach((ach) => {
    if (ach.isUnlocked) return;

    let shouldUnlock = false;

    switch (ach.id) {
      case 'first_quiz':
        if (stats.gamesPlayed >= 1) shouldUnlock = true;
        break;
      case 'perfect_score':
        if (currentRoundStats && currentRoundStats.correctCount === 10 && currentRoundStats.totalCount === 10) {
          shouldUnlock = true;
        }
        break;
      case 'streak_5':
        if (stats.bestStreak >= 5 || (currentRoundStats && currentRoundStats.maxStreak >= 5)) {
          shouldUnlock = true;
        }
        break;
      case 'expert_conqueror':
        if (currentRoundStats && currentRoundStats.difficulty === 'expert' && currentRoundStats.correctCount >= 7) {
          shouldUnlock = true;
        }
        break;
      case 'daily_champ':
        if (currentRoundStats && currentRoundStats.isDaily && currentRoundStats.correctCount >= 5) {
          shouldUnlock = true;
        }
        break;
      case 'points_500':
        if (stats.totalPoints >= 500) shouldUnlock = true;
        break;
      case 'points_1500':
        if (stats.totalPoints >= 1500) shouldUnlock = true;
        break;
      case 'logic_solver':
        if (stats.categoryWins['logic'] && stats.categoryWins['logic'] >= 5) {
          shouldUnlock = true;
        }
        break;
      case 'all_rounder':
        if (Object.keys(stats.categoryWins).length >= 5) {
          shouldUnlock = true;
        }
        break;
    }

    if (shouldUnlock) {
      ach.isUnlocked = true;
      ach.unlockedAt = nowStr;
      newlyUnlocked.push(ach);
    }
  });

  if (newlyUnlocked.length > 0) {
    saveAchievements(allAchievements);
  }

  return { newlyUnlocked, allAchievements };
}

/**
 * Deterministic Daily Challenge generator
 * Creates a unique 10-question set for each date
 */
export function getDailyChallengeQuestions(): { dateStr: string; questions: Question[] } {
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // Simple seed hash from date string
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed << 5) - seed + dateStr.charCodeAt(i);
    seed |= 0;
  }
  const absSeed = Math.abs(seed);

  // Shuffle questions pseudorandomly using the seed
  const shuffled = [...QUESTIONS].sort((a, b) => {
    const hashA = (a.id.charCodeAt(0) * 31 + absSeed) % 100;
    const hashB = (b.id.charCodeAt(0) * 31 + absSeed) % 100;
    return hashA - hashB;
  });

  return {
    dateStr,
    questions: shuffled.slice(0, 10),
  };
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STATS_KEY);
  localStorage.removeItem(HIGHSCORES_KEY);
  localStorage.removeItem(ACHIEVEMENTS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
  localStorage.removeItem('tahaddi_seen_question_ids');
}
