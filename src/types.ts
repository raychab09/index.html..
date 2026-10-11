export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type QuestionType = 'multiple_choice' | 'puzzle_text';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  bgGradient: string;
  borderAccent: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  categoryId: string;
  difficulty: Difficulty;
  question: string;
  options?: string[]; // for multiple_choice
  correctAnswer: string;
  acceptableAnswers?: string[]; // for puzzle_text variations
  explanation: string;
  type: QuestionType;
  hint?: string;
  isAiGenerated?: boolean;
  originalId?: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeSpentSeconds: number;
}

export interface QuizRound {
  id: string;
  categoryId: string;
  categoryName: string;
  difficulty: Difficulty;
  questions: Question[];
  currentIndex: number;
  answers: QuizAnswer[];
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  hintsUsed?: number;
  isDailyChallenge?: boolean;
  isFinished?: boolean;
}

export interface UserStats {
  totalPoints: number;
  gamesPlayed: number;
  totalCorrect: number;
  totalWrong: number;
  bestStreak: number;
  categoryWins: Record<string, number>;
  unlockedAchievements: string[];
  lastDailyDate?: string;
  dailyStreak: number;
}

export interface HighScoreRecord {
  id: string;
  date: string;
  score: number;
  categoryName: string;
  categoryId: string;
  difficulty: Difficulty;
  difficultyName: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  timerEnabled: boolean;
  timerDurationSeconds: number; // e.g. 20
  darkMode: boolean;
  vibrateEnabled: boolean;
  aiGenerationEnabled: boolean;
}
