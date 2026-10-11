import React, { useState, useEffect } from 'react';
import {
  Achievement,
  AppSettings,
  Category,
  Difficulty,
  HighScoreRecord,
  QuizAnswer,
  QuizRound,
  UserStats,
} from './types';
import { CATEGORIES, DIFFICULTIES } from './data/categories';
import {
  generateRoundQuestions,
  generateRoundQuestionsSync,
  randomizeQuestionOptions,
} from './services/questionEngine';
import {
  checkAndUnlockAchievements,
  getDailyChallengeQuestions,
  loadAchievements,
  loadHighScores,
  loadSettings,
  loadUserStats,
  resetAllData,
  saveHighScore,
  saveSettings,
  saveUserStats,
} from './services/storage';
import { sound } from './services/sound';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { CategoryScreen } from './components/CategoryScreen';
import { DifficultyScreen } from './components/DifficultyScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { AchievementsScreen } from './components/AchievementsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { ApkGuideModal } from './components/ApkGuideModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { Award, Sparkles } from 'lucide-react';

export default function App() {
  // Screens: 'home' | 'categories' | 'difficulty' | 'quiz' | 'result' | 'leaderboard' | 'achievements' | 'settings'
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [activeRound, setActiveRound] = useState<QuizRound | null>(null);

  // Storage states
  const [stats, setStats] = useState<UserStats>(loadUserStats);
  const [highScores, setHighScores] = useState<HighScoreRecord[]>(loadHighScores);
  const [achievements, setAchievements] = useState<Achievement[]>(loadAchievements);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Modals & notifications
  const [isApkGuideOpen, setIsApkGuideOpen] = useState(false);
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);
  const [isGeneratingRound, setIsGeneratingRound] = useState(false);
  const [toastNotification, setToastNotification] = useState<{
    message: string;
    type?: 'ai' | 'smart';
  } | null>(null);

  // Sync sound service on startup
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleResetData = () => {
    resetAllData();
    setStats(loadUserStats());
    setHighScores([]);
    setAchievements(loadAchievements());
    setSettings(loadSettings());
  };

  // Start a standard 10-question round using intelligent question engine (anti-repetition + dynamic options)
  const startQuizRound = async (category: Category, difficulty: Difficulty) => {
    setIsGeneratingRound(true);

    try {
      const result = await generateRoundQuestions(
        category.id,
        category.name,
        difficulty,
        10,
        { allowAi: settings.aiGenerationEnabled }
      );

      const newRound: QuizRound = {
        id: 'round_' + Date.now(),
        categoryId: category.id,
        categoryName: category.name,
        difficulty,
        questions: result.questions,
        currentIndex: 0,
        answers: [],
        currentStreak: 0,
        maxStreak: 0,
        totalScore: 0,
        isFinished: false,
      };

      setActiveRound(newRound);
      setCurrentScreen('quiz');
      setToastNotification({
        message: result.message || 'تم تجهيز أسئلة جديدة لك! 🔄',
        type: result.source === 'ai' ? 'ai' : 'smart',
      });
      setTimeout(() => setToastNotification(null), 3800);
    } catch {
      // Offline fallback
      const fallbackQuestions = generateRoundQuestionsSync(category.id, difficulty, 10);
      const newRound: QuizRound = {
        id: 'round_' + Date.now(),
        categoryId: category.id,
        categoryName: category.name,
        difficulty,
        questions: fallbackQuestions,
        currentIndex: 0,
        answers: [],
        currentStreak: 0,
        maxStreak: 0,
        totalScore: 0,
        isFinished: false,
      };

      setActiveRound(newRound);
      setCurrentScreen('quiz');
      setToastNotification({
        message: 'تم تجهيز أسئلة جديدة لك! 🔄',
        type: 'smart',
      });
      setTimeout(() => setToastNotification(null), 3800);
    } finally {
      setIsGeneratingRound(false);
    }
  };

  // Start Daily Challenge
  const startDailyChallenge = () => {
    const { questions } = getDailyChallengeQuestions();
    const roundQuestions = questions.map((q) => randomizeQuestionOptions(q));
    const newRound: QuizRound = {
      id: 'daily_' + Date.now(),
      categoryId: 'daily',
      categoryName: 'التحدي اليومي',
      difficulty: 'medium',
      questions: roundQuestions,
      currentIndex: 0,
      answers: [],
      currentStreak: 0,
      maxStreak: 0,
      totalScore: 0,
      isFinished: false,
    };

    setActiveRound(newRound);
    setCurrentScreen('quiz');
  };

  // Quick Play (Random Category & Medium Difficulty)
  const startQuickPlay = () => {
    const randomCat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setSelectedCategory(randomCat);
    startQuizRound(randomCat, 'medium');
  };

  // Handle submitting an answer
  const handleAnswerQuestion = (answer: QuizAnswer) => {
    if (!activeRound) return;

    const nextStreak = answer.isCorrect ? activeRound.currentStreak + 1 : 0;
    const nextMaxStreak = Math.max(activeRound.maxStreak, nextStreak);
    const nextScore = activeRound.totalScore + answer.pointsEarned;

    const updatedRound: QuizRound = {
      ...activeRound,
      answers: [...activeRound.answers, answer],
      currentStreak: nextStreak,
      maxStreak: nextMaxStreak,
      totalScore: nextScore,
    };

    setActiveRound(updatedRound);
  };

  // Advance to next question in the round
  const handleNextQuestion = () => {
    if (!activeRound) return;
    setActiveRound((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentIndex: prev.currentIndex + 1,
      };
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Advance to next question or trigger completion
  const handleFinishRound = () => {
    if (!activeRound) return;

    const totalQuestions = activeRound.questions.length;
    const correctCount = activeRound.answers.filter((a) => a.isCorrect).length;
    const wrongCount = totalQuestions - correctCount;
    const accuracy = Math.round((correctCount / totalQuestions) * 100);

    // Update user stats
    const newStats: UserStats = {
      ...stats,
      totalPoints: stats.totalPoints + activeRound.totalScore,
      gamesPlayed: stats.gamesPlayed + 1,
      totalCorrect: stats.totalCorrect + correctCount,
      totalWrong: stats.totalWrong + wrongCount,
      bestStreak: Math.max(stats.bestStreak, activeRound.maxStreak),
      categoryWins: {
        ...stats.categoryWins,
        [activeRound.categoryId]:
          (stats.categoryWins[activeRound.categoryId] || 0) + (accuracy >= 70 ? 1 : 0),
      },
    };
    setStats(newStats);
    saveUserStats(newStats);

    // Record high score
    const diffInfo = DIFFICULTIES[activeRound.difficulty] || DIFFICULTIES.medium;
    saveHighScore({
      categoryId: activeRound.categoryId,
      categoryName: activeRound.categoryName,
      difficulty: activeRound.difficulty,
      difficultyName: diffInfo.name,
      score: activeRound.totalScore,
      correctAnswers: correctCount,
      totalQuestions,
      accuracy,
    });
    setHighScores(loadHighScores());

    // Check achievements
    const { newlyUnlocked, allAchievements } = checkAndUnlockAchievements(newStats, {
      difficulty: activeRound.difficulty,
      correctCount,
      totalCount: totalQuestions,
      maxStreak: activeRound.maxStreak,
      isDaily: activeRound.categoryId === 'daily',
      categoryId: activeRound.categoryId,
    });

    if (newlyUnlocked.length > 0) {
      setAchievements(allAchievements);
      setUnlockedToast(newlyUnlocked[0]);
      setTimeout(() => setUnlockedToast(null), 4000);
    }

    setCurrentScreen('result');
  };

  // Replay with identical setup
  const handleReplay = () => {
    if (!activeRound) return;
    if (activeRound.categoryId === 'daily') {
      startDailyChallenge();
    } else {
      const cat =
        CATEGORIES.find((c) => c.id === activeRound.categoryId) ||
        selectedCategory ||
        CATEGORIES[0];
      startQuizRound(cat, activeRound.difficulty);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        stats={stats}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenApkGuide={() => setIsApkGuideOpen(true)}
      />

      {/* PWA Install Banner */}
      {currentScreen !== 'quiz' && <PWAInstallBanner />}

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {currentScreen === 'home' && (
          <HomeScreen
            stats={stats}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onStartDailyChallenge={startDailyChallenge}
            onStartQuickPlay={startQuickPlay}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
          />
        )}

        {currentScreen === 'categories' && (
          <CategoryScreen
            onSelectCategory={(category) => {
              setSelectedCategory(category);
              setCurrentScreen('difficulty');
            }}
            onSelectRandom={() => {
              const rand = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
              setSelectedCategory(rand);
              setCurrentScreen('difficulty');
            }}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'difficulty' && selectedCategory && (
          <DifficultyScreen
            category={selectedCategory}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onStartQuiz={(difficulty) => startQuizRound(selectedCategory, difficulty)}
            onBack={() => setCurrentScreen('categories')}
          />
        )}

        {currentScreen === 'quiz' && activeRound && (
          <QuizScreen
            round={activeRound}
            settings={settings}
            onAnswerQuestion={handleAnswerQuestion}
            onNextQuestion={handleNextQuestion}
            onFinishRound={handleFinishRound}
            onQuit={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'result' && activeRound && (
          <ResultScreen
            round={activeRound}
            onReplay={handleReplay}
            onChooseCategory={() => setCurrentScreen('categories')}
            onGoHome={() => setCurrentScreen('home')}
            isGeneratingNew={isGeneratingRound}
          />
        )}

        {currentScreen === 'leaderboard' && (
          <LeaderboardScreen
            highScores={highScores}
            onPlayNow={() => setCurrentScreen('categories')}
          />
        )}

        {currentScreen === 'achievements' && (
          <AchievementsScreen achievements={achievements} />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetData={handleResetData}
            onOpenApkGuide={() => setIsApkGuideOpen(true)}
          />
        )}
      </main>

      {/* Achievement Unlocked Toast Notification */}
      {unlockedToast && (
        <div className="fixed top-16 inset-x-4 max-w-sm mx-auto z-50 p-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-2xl flex items-center gap-3 border border-amber-400 animate-bounce">
          <div className="p-2 rounded-xl bg-amber-950/40 text-amber-300">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-amber-200">
              🎉 تم فتح إنجاز جديد!
            </div>
            <div className="text-sm font-black">{unlockedToast.title}</div>
            <div className="text-[11px] text-amber-100">{unlockedToast.description}</div>
          </div>
        </div>
      )}

      {/* Dynamic Questions Generated Notification Toast */}
      {toastNotification && (
        <div className="fixed top-16 inset-x-4 max-w-sm mx-auto z-50 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white shadow-2xl flex items-center gap-3 border border-indigo-500/50 backdrop-blur-md">
          <div className="p-2 rounded-xl bg-indigo-500/30 text-indigo-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs font-bold text-slate-100 flex-1">
            {toastNotification.message}
          </div>
        </div>
      )}

      {/* APK Conversion Guide Modal */}
      <ApkGuideModal
        isOpen={isApkGuideOpen}
        onClose={() => setIsApkGuideOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
      />
    </div>
  );
}
