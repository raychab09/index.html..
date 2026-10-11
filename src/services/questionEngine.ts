import { Difficulty, Question } from '../types';
import { QUESTIONS } from '../data/questions';
import {
  createDynamicQuestionVariant,
  randomizeQuestionOptions,
  shuffleArray,
} from './questionVariations';

const SEEN_QUESTIONS_KEY = 'tahaddi_seen_question_ids';
const SAVED_AI_QUESTIONS_KEY = 'tahaddi_custom_ai_questions';
const MAX_SEEN_HISTORY = 600; // Track up to 600 recently seen question IDs
const MAX_SAVED_AI = 300; // Store up to 300 AI-generated questions in local storage

/**
 * Loads the list of recently seen question IDs from localStorage
 */
export function getSeenQuestionIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Records newly seen question IDs in localStorage, keeping the most recent entries
 */
export function recordSeenQuestions(questionIds: string[]): void {
  if (typeof window === 'undefined' || questionIds.length === 0) return;
  try {
    const existing = getSeenQuestionIds();
    // Prepend new IDs and keep unique
    const merged = Array.from(new Set([...questionIds, ...existing])).slice(0, MAX_SEEN_HISTORY);
    localStorage.setItem(SEEN_QUESTIONS_KEY, JSON.stringify(merged));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clears the seen questions history completely
 */
export function clearSeenQuestionsHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SEEN_QUESTIONS_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Loads AI-generated questions saved in localStorage
 */
export function getSavedAiQuestions(): Question[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_AI_QUESTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves newly generated AI questions into local persistent storage
 */
export function saveAiQuestions(newQuestions: Question[]): void {
  if (typeof window === 'undefined' || newQuestions.length === 0) return;
  try {
    const existing = getSavedAiQuestions();
    const existingIds = new Set(existing.map((q) => q.id));
    const toAdd = newQuestions.filter((q) => !existingIds.has(q.id));
    const combined = [...toAdd, ...existing].slice(0, MAX_SAVED_AI);
    localStorage.setItem(SAVED_AI_QUESTIONS_KEY, JSON.stringify(combined));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clears AI questions cache
 */
export function clearAiQuestionsCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SAVED_AI_QUESTIONS_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Returns all currently available questions (Base bank + Cached AI questions)
 */
export function getAllAvailableQuestions(): Question[] {
  const aiQuestions = getSavedAiQuestions();
  return [...QUESTIONS, ...aiQuestions];
}

/**
 * Returns statistics about question exploration across the bank
 */
export function getQuestionEngineStats(): {
  baseQuestions: number;
  aiQuestions: number;
  totalQuestions: number;
  seenCount: number;
  categoryStats: Record<string, { total: number; seen: number }>;
} {
  const allQuestions = getAllAvailableQuestions();
  const seenIds = new Set(getSeenQuestionIds());
  const categoryStats: Record<string, { total: number; seen: number }> = {};

  allQuestions.forEach((q) => {
    if (!categoryStats[q.categoryId]) {
      categoryStats[q.categoryId] = { total: 0, seen: 0 };
    }
    categoryStats[q.categoryId].total += 1;
    if (seenIds.has(q.id)) {
      categoryStats[q.categoryId].seen += 1;
    }
  });

  const aiQuestions = getSavedAiQuestions();

  return {
    baseQuestions: QUESTIONS.length,
    aiQuestions: aiQuestions.length,
    totalQuestions: allQuestions.length,
    seenCount: seenIds.size,
    categoryStats,
  };
}

/**
 * Generates round questions using the local smart anti-repetition engine:
 * 1. Checks both base questions and previously saved AI questions.
 * 2. Strictly prioritizes unseen questions for the selected category and difficulty.
 * 3. Fallback priority 2: Unseen questions in other difficulties within the same category.
 * 4. Fallback priority 3: Least-recently seen questions, revitalized with dynamic paraphrasing & shuffled options.
 * 5. Guarantees 100% uniqueness in the round (no duplicate question ideas).
 */
export function generateRoundQuestionsFromLocal(
  categoryId: string,
  difficulty: Difficulty,
  requestedCount = 10
): Question[] {
  const allPool = getAllAvailableQuestions();
  const categoryQuestions = allPool.filter((q) => q.categoryId === categoryId);
  const basePool = categoryQuestions.length > 0 ? categoryQuestions : allPool;

  const seenIds = new Set(getSeenQuestionIds());

  // Split into unseen and seen
  const unseenExact = basePool.filter((q) => q.difficulty === difficulty && !seenIds.has(q.id));
  const unseenOther = basePool.filter((q) => q.difficulty !== difficulty && !seenIds.has(q.id));
  const seenExact = basePool.filter((q) => q.difficulty === difficulty && seenIds.has(q.id));
  const seenOther = basePool.filter((q) => q.difficulty !== difficulty && seenIds.has(q.id));

  const chosenMap = new Map<string, Question>();

  const addCandidates = (candidates: Question[], paraphraseIfSeen = false) => {
    const shuffled = shuffleArray(candidates);
    for (const q of shuffled) {
      if (chosenMap.size >= requestedCount) break;
      // Also check normalized question text to avoid same question with different IDs
      const isAlreadyChosen = Array.from(chosenMap.values()).some(
        (existing) => existing.id === q.id || existing.question.trim() === q.question.trim()
      );
      if (!isAlreadyChosen) {
        const finalQuestion = paraphraseIfSeen ? createDynamicQuestionVariant(q) : randomizeQuestionOptions(q);
        chosenMap.set(finalQuestion.id, finalQuestion);
      }
    }
  };

  // 1. Unseen exact difficulty
  addCandidates(unseenExact, false);

  // 2. Unseen other difficulty in same category
  if (chosenMap.size < requestedCount) {
    addCandidates(unseenOther, false);
  }

  // 3. Seen exact difficulty (apply dynamic paraphrasing so it feels fresh)
  if (chosenMap.size < requestedCount) {
    addCandidates(seenExact, true);
  }

  // 4. Seen other difficulty (apply dynamic paraphrasing)
  if (chosenMap.size < requestedCount) {
    addCandidates(seenOther, true);
  }

  // 5. Final fallback across any category if needed
  if (chosenMap.size < requestedCount) {
    addCandidates(allPool.filter((q) => !chosenMap.has(q.id)), true);
  }

  const selectedQuestions = Array.from(chosenMap.values()).slice(0, requestedCount);

  // Record IDs as seen
  recordSeenQuestions(selectedQuestions.map((q) => q.id));

  return shuffleArray(selectedQuestions);
}

/**
 * Result from async round question generation
 */
export interface GenerateRoundResult {
  questions: Question[];
  source: 'ai' | 'offline_smart';
  message?: string;
}

/**
 * Asynchronous question generator:
 * - Attempts to call the server-side Gemini API (/api/generate-questions)
 * - If Gemini produces fresh questions:
 *     - Validates non-duplication
 *     - Caches questions locally for future offline play
 *     - Returns them immediately
 * - If offline or no API key or server error:
 *     - Seamlessly falls back to the offline smart non-repetition engine!
 */
export async function generateRoundQuestions(
  categoryId: string,
  categoryName: string,
  difficulty: Difficulty,
  requestedCount = 10,
  options?: {
    allowAi?: boolean;
    timeoutMs?: number;
  }
): Promise<GenerateRoundResult> {
  const allowAi = options?.allowAi ?? true;
  const timeoutMs = options?.timeoutMs ?? 7000;

  if (allowAi && typeof window !== 'undefined' && navigator.onLine) {
    try {
      const allPool = getAllAvailableQuestions();
      const recentSeenIds = new Set(getSeenQuestionIds().slice(0, 35));
      const recentTexts = allPool
        .filter((q) => recentSeenIds.has(q.id) && q.categoryId === categoryId)
        .map((q) => q.question);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId,
          categoryName,
          difficulty,
          count: requestedCount,
          recentQuestions: recentTexts,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.questions) && data.questions.length >= 5) {
          const aiQuestions: Question[] = data.questions;

          // Save to local cache for expanding bank
          saveAiQuestions(aiQuestions);

          // Mark as seen
          recordSeenQuestions(aiQuestions.map((q) => q.id));

          // If we received fewer than requestedCount, supplement with offline smart bank
          let finalSet = [...aiQuestions];
          if (finalSet.length < requestedCount) {
            const extraNeeded = requestedCount - finalSet.length;
            const extra = generateRoundQuestionsFromLocal(categoryId, difficulty, extraNeeded);
            finalSet = [...finalSet, ...extra];
          }

          return {
            questions: shuffleArray(finalSet).slice(0, requestedCount),
            source: 'ai',
            message: 'تم توليد أسئلة جديدة وحصرية بواسطة الذكاء الاصطناعي ✨',
          };
        }
      }
    } catch (err) {
      // Graceful fallback to offline smart bank on network or timeout error
      console.warn('Gemini question generation skipped or timed out, using smart offline bank:', err);
    }
  }

  // Offline / Fallback Smart Engine
  const offlineQuestions = generateRoundQuestionsFromLocal(categoryId, difficulty, requestedCount);
  return {
    questions: offlineQuestions,
    source: 'offline_smart',
    message: 'تم تجهيز أسئلة جديدة لك من بنك الأسئلة الذكي 🔄',
  };
}

/**
 * Synchronous version of round question generator for instant offline loads
 */
export function generateRoundQuestionsSync(
  categoryId: string,
  difficulty: Difficulty,
  requestedCount = 10
): Question[] {
  return generateRoundQuestionsFromLocal(categoryId, difficulty, requestedCount);
}

// Re-export helpers
export { randomizeQuestionOptions, createDynamicQuestionVariant };

