import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  Lightbulb,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Send,
  Info,
} from 'lucide-react';
import { AppSettings, Question, QuizAnswer, QuizRound } from '../types';
import { DIFFICULTIES } from '../data/categories';
import { sound } from '../services/sound';
import { checkAnswerMatch } from '../services/storage';

interface QuizScreenProps {
  round: QuizRound;
  settings: AppSettings;
  onAnswerQuestion: (answer: QuizAnswer) => void;
  onNextQuestion: () => void;
  onFinishRound: () => void;
  onQuit: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  round,
  settings,
  onAnswerQuestion,
  onNextQuestion,
  onFinishRound,
  onQuit,
}) => {
  const currentQuestion: Question | undefined = round.questions[round.currentIndex];

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);

  // Timer state
  const timerSeconds = settings.timerDurationSeconds || 20;
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diffConfig = DIFFICULTIES[round.difficulty] || DIFFICULTIES.medium;
  const totalQuestions = round.questions.length;
  const questionNumber = round.currentIndex + 1;
  const progressPercent = (questionNumber / totalQuestions) * 100;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
    setEliminatedOptions([]);
    setHintUsed(false);
    setHintText(null);
    setTimeLeft(timerSeconds);

    if (settings.timerEnabled) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleTimeExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [round.currentIndex, settings.timerEnabled, timerSeconds]);

  // Handle timeout as wrong answer
  const handleTimeExpired = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setIsCorrect(false);
    setShowExplanation(true);
    sound.playWrong();

    const answerRecord: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: 'انتهى الوقت ⏱️',
      isCorrect: false,
      pointsEarned: 0,
      timeSpentSeconds: timerSeconds,
    };
    onAnswerQuestion(answerRecord);
  };

  // Submit multiple-choice answer
  const handleSelectOption = (option: string) => {
    if (isAnswered) return; // Prevent changing answer once submitted
    if (eliminatedOptions.includes(option)) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const correct = option === currentQuestion.correctAnswer;
    setIsAnswered(true);
    setSelectedOption(option);
    setIsCorrect(correct);
    setShowExplanation(true);

    processAnswerOutcome(correct, option);
  };

  // Submit text input answer (puzzle)
  const handleSubmitText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isAnswered || !textInput.trim()) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const correct = checkAnswerMatch(textInput, currentQuestion);
    setIsAnswered(true);
    setIsCorrect(correct);
    setShowExplanation(true);

    processAnswerOutcome(correct, textInput.trim());
  };

  const processAnswerOutcome = (correct: boolean, answerGiven: string) => {
    let points = 0;
    if (correct) {
      points = diffConfig.points;
      // Streak bonus
      const currentStreak = round.currentStreak + 1;
      if (currentStreak >= 3) {
        points += 5; // Bonus for 3+ in a row
      }
      if (hintUsed) {
        points = Math.max(2, points - 5); // Hint penalty
      }
      sound.playCorrect();
      if (currentStreak >= 3) {
        setTimeout(() => sound.playStreak(), 300);
      }
    } else {
      sound.playWrong();
    }

    const answerRecord: QuizAnswer = {
      questionId: currentQuestion.id,
      userAnswer: answerGiven,
      isCorrect: correct,
      pointsEarned: points,
      timeSpentSeconds: timerSeconds - timeLeft,
    };
    onAnswerQuestion(answerRecord);
  };

  // Hint logic: 50-50 elimination for multiple choice, or clue text for puzzles
  const handleUseHint = () => {
    if (hintUsed || isAnswered) return;
    sound.playHint();
    setHintUsed(true);

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options) {
      const wrongOptions = currentQuestion.options.filter(
        (opt) => opt !== currentQuestion.correctAnswer
      );
      // Pick 2 random wrong options to eliminate
      const toEliminate = wrongOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
      setEliminatedOptions(toEliminate);
    }

    if (currentQuestion.hint) {
      setHintText(currentQuestion.hint);
    } else {
      setHintText('ركز جيداً، الإجابة مرتبطة بالمفهوم الأساسي في السؤال.');
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (round.currentIndex + 1 >= totalQuestions) {
      onFinishRound();
    } else {
      onNextQuestion();
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="pb-16 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between">
        {/* Question Counter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            السؤال {questionNumber} من {totalQuestions}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${diffConfig.bgColor} ${diffConfig.color}`}>
            {diffConfig.name}
          </span>
          {currentQuestion.isAiGenerated ? (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>حصري AI</span>
            </span>
          ) : (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800/80 text-emerald-400 border border-emerald-500/30">
              متجدد 🔄
            </span>
          )}
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-2">
          {round.currentStreak > 1 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{round.currentStreak}x</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{round.totalScore} نقطة</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/80">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Timer Bar (if active) */}
      {settings.timerEnabled && (
        <div className="flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <Clock
            className={`w-4 h-4 ${
              timeLeft <= 5 ? 'text-rose-500 animate-spin' : 'text-indigo-400'
            }`}
          />
          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5
                  ? 'bg-rose-500'
                  : timeLeft <= 10
                  ? 'bg-amber-500'
                  : 'bg-indigo-400'
              }`}
              style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
            />
          </div>
          <span
            className={`text-xs font-mono font-bold ${
              timeLeft <= 5 ? 'text-rose-400 font-black' : 'text-slate-300'
            }`}
          >
            {timeLeft}ث
          </span>
        </div>
      )}

      {/* Question Card */}
      <div className="relative p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        {/* Category & Type badges */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">{round.categoryName}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
            {currentQuestion.type === 'puzzle_text' ? '🧩 لغز كتابي' : '🔘 اختيار من متعدد'}
          </span>
        </div>

        {/* Question Text */}
        <p className="text-lg sm:text-xl font-bold text-white leading-relaxed pt-1">
          {currentQuestion.question}
        </p>

        {/* Hint Trigger Button (if not answered yet) */}
        {!isAnswered && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleUseHint}
              disabled={hintUsed}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition active:scale-95 ${
                hintUsed
                  ? 'bg-slate-800/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{hintUsed ? 'تم استخدام التلميح' : 'تلميح (-5 نقاط)'}</span>
            </button>
          </div>
        )}

        {/* Revealed Hint Box */}
        {hintText && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2 animate-fadeIn">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">تلميح المساعدة:</span>
              <span>{hintText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Answer Options Area */}
      <div className="space-y-2.5">
        {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
          // 4 Multiple Choice Buttons
          currentQuestion.options.map((option, idx) => {
            const isEliminated = eliminatedOptions.includes(option);
            const isChosen = selectedOption === option;
            const isCorrectOption = option === currentQuestion.correctAnswer;

            let buttonStyle =
              'bg-slate-900/80 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800/90 active:scale-[0.99]';

            if (isAnswered) {
              if (isCorrectOption) {
                buttonStyle =
                  'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/20';
              } else if (isChosen && !isCorrectOption) {
                buttonStyle =
                  'bg-rose-500/20 border-rose-500 text-rose-200 ring-2 ring-rose-500/40';
              } else {
                buttonStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-600 opacity-60';
              }
            } else if (isEliminated) {
              buttonStyle =
                'bg-slate-950/40 border-slate-900 text-slate-600 line-through opacity-40 cursor-not-allowed';
            }

            const optionBadges = ['1', '2', '3', '4'];

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                disabled={isAnswered || isEliminated}
                className={`w-full p-4 rounded-2xl border text-right transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isAnswered && isCorrectOption
                        ? 'bg-emerald-500 text-slate-950'
                        : isAnswered && isChosen
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {optionBadges[idx] || idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-bold leading-snug">
                    {option}
                  </span>
                </div>

                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mr-2" />
                )}
                {isAnswered && isChosen && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0 mr-2" />
                )}
              </button>
            );
          })
        ) : (
          // Puzzle Text Input
          <form onSubmit={handleSubmitText} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                disabled={isAnswered}
                placeholder="اكتب إجابتك هنا..."
                className={`w-full p-4 rounded-2xl bg-slate-900 border text-white placeholder-slate-500 text-base font-bold focus:outline-none transition ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-rose-500 bg-rose-500/10'
                    : 'border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                }`}
              />
              {!isAnswered && (
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <Send className="w-4 h-4 rotate-180" />
                </button>
              )}
            </div>

            {/* Answer feedback for text puzzle */}
            {isAnswered && (
              <div
                className={`p-3.5 rounded-2xl border text-sm font-bold flex items-center gap-2 ${
                  isCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  {isCorrect ? (
                    <span>أحسنت! إجابتك صحيحة ودقيقة.</span>
                  ) : (
                    <span>
                      الإجابة الصحيحة هي: <strong>{currentQuestion.correctAnswer}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}
          </form>
        )}
      </div>

      {/* Explanation Box (Revealed after answer) */}
      {showExplanation && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Info className="w-4 h-4" />
            <span>شرح الإجابة والمعلومة:</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentQuestion.explanation}
          </p>
        </div>
      )}

      {/* Action Footer: Next / Results */}
      {isAnswered && (
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <span>
              {round.currentIndex + 1 >= totalQuestions ? 'عرض النتيجة النهائية 🏆' : 'السؤال التالي'}
            </span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Quit link */}
      <div className="text-center pt-1">
        <button
          onClick={() => {
            sound.playClick();
            if (window.confirm('هل أنت متأكد من رغبتك في إنهاء الجولة والعودة للرئيسية؟')) {
              onQuit();
            }
          }}
          className="text-xs text-slate-500 hover:text-slate-300 transition"
        >
          إنهاء الجولة الحالية والعودة
        </button>
      </div>
    </div>
  );
};
