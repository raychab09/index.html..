import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Layers,
  Home,
  CheckCircle2,
  XCircle,
  Sparkles,
  Flame,
  Share2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { QuizRound } from '../types';
import { sound } from '../services/sound';

interface ResultScreenProps {
  round: QuizRound;
  onReplay: () => void;
  onChooseCategory: () => void;
  onGoHome: () => void;
  isGeneratingNew?: boolean;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  round,
  onReplay,
  onChooseCategory,
  onGoHome,
  isGeneratingNew = false,
}) => {
  const [showReview, setShowReview] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalQuestions = round.questions.length;
  const correctCount = round.answers.filter((a) => a.isCorrect).length;
  const wrongCount = totalQuestions - correctCount;
  const accuracyPercent = Math.round((correctCount / totalQuestions) * 100);

  // Trigger celebration on mount
  useEffect(() => {
    sound.playVictory();

    if (accuracyPercent >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#a855f7', '#ec4899', '#eab308'],
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }
  }, [accuracyPercent]);

  // Encouraging message based on score
  let badgeTitle = 'مستوى متواضع';
  let badgeMessage = 'محاولة جيدة، يمكنك دائماً المحاولة مجدداً للتحسن والمعرفة!';
  let medalEmoji = '🥉';

  if (accuracyPercent === 100) {
    badgeTitle = 'العلامة الكاملة! أسطورة حقيقية';
    badgeMessage = 'ما شاء الله! إجابات مثالية بدون أي خطأ، أنت عبقري في هذا المجال!';
    medalEmoji = '👑';
  } else if (accuracyPercent >= 80) {
    badgeTitle = 'ممتاز جداً! خبير متمكن';
    badgeMessage = 'أداء رائع ومبهر يعكس ثقافة واسعة ومعرفة دقيقة!';
    medalEmoji = '🥇';
  } else if (accuracyPercent >= 50) {
    badgeTitle = 'أداء جيد ومبشر';
    badgeMessage = 'نتيجة طيبة! قليل من التركيز وستصل للعلامة الكاملة.';
    medalEmoji = '🥈';
  }

  // Share text
  const handleShare = () => {
    const text = `🏆 حققت ${round.totalScore} نقطة بنسبة دقة ${accuracyPercent}% في تطبيق "تحدي المعرفة" بمجال ${round.categoryName}!\nهل يمكنك التغلب على نتيجتي؟ 🧠`;

    if (navigator.share) {
      navigator
        .share({
          title: 'تحدي المعرفة',
          text: text,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Top Trophy Banner */}
      <div className="text-center p-6 rounded-3xl bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-4xl mb-3 shadow-lg shadow-indigo-500/20 animate-bounce">
          <span>{medalEmoji}</span>
        </div>

        <h2 className="text-xl font-black text-white">{badgeTitle}</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
          {badgeMessage}
        </p>

        {/* Score pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span className="text-2xl font-black">{round.totalScore}</span>
          <span className="text-xs font-bold">نقطة مكتسبة</span>
        </div>
      </div>

      {/* Stats Breakdown Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Correct Answers */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">
              {correctCount} / {totalQuestions}
            </div>
            <div className="text-xs text-slate-400">إجابات صحيحة</div>
          </div>
        </div>

        {/* Incorrect Answers */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">
              {wrongCount} / {totalQuestions}
            </div>
            <div className="text-xs text-slate-400">إجابات خاطئة</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">%{accuracyPercent}</div>
            <div className="text-xs text-slate-400">دقة الإجابة</div>
          </div>
        </div>

        {/* Max Streak */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/15 text-orange-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white">
              {round.maxStreak} إجابات
            </div>
            <div className="text-xs text-slate-400">أطول سلسلة</div>
          </div>
        </div>
      </div>

      {/* Review Answers Toggle Accordion */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full p-4 flex items-center justify-between text-sm font-bold text-white hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>مراجعة إجابات الجولة وشروحها ({totalQuestions})</span>
          </div>
          {showReview ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showReview && (
          <div className="p-4 pt-1 space-y-3 divide-y divide-slate-800">
            {round.questions.map((q, idx) => {
              const ans = round.answers[idx];
              const isCorrect = ans?.isCorrect;

              return (
                <div key={q.id} className="pt-3 first:pt-0 space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      سؤال {idx + 1}
                    </span>
                    <p className="font-bold text-slate-200 text-sm">{q.question}</p>
                  </div>

                  <div className="pr-2 space-y-1">
                    <div className="text-slate-400">
                      إجابتك:{' '}
                      <span className={isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                        {ans?.userAnswer || 'لا توجد إجابة'}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="text-slate-400">
                        الإجابة الصحيحة:{' '}
                        <span className="text-emerald-300 font-bold">
                          {q.correctAnswer}
                        </span>
                      </div>
                    )}

                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-300 leading-relaxed">
                      💡 <strong>الشرح:</strong> {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Buttons */}
      <div className="space-y-2.5 pt-2">
        {/* زر أسئلة جديدة متجددة */}
        <button
          disabled={isGeneratingNew}
          onClick={() => {
            sound.playClick();
            onReplay();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-base shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed group"
        >
          <RotateCcw className={`w-5 h-5 ${isGeneratingNew ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          <span>{isGeneratingNew ? 'جاري تجهيز أسئلة جديدة غير مكررة... ⏳' : 'أسئلة جديدة 🔄 (جولة غير مكررة)'}</span>
        </button>

        {/* زر اختيار مجال آخر */}
        <button
          onClick={() => {
            sound.playClick();
            onChooseCategory();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold text-sm active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          <Layers className="w-5 h-5 text-purple-400" />
          <span>اختيار مجال آخر</span>
        </button>

        {/* Quick action row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onGoHome();
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 text-xs font-bold hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </button>

          <button
            onClick={handleShare}
            className="py-2.5 px-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 text-xs font-bold hover:text-white transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>{copied ? 'تم النسخ بنجاح!' : 'مشاركة النتيجة'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
