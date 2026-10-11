import React from 'react';
import {
  Play,
  Layers,
  Trophy,
  Award,
  Settings,
  Calendar,
  Flame,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Smartphone,
} from 'lucide-react';
import { UserStats } from '../types';
import { sound } from '../services/sound';

interface HomeScreenProps {
  stats: UserStats;
  onNavigate: (screen: string) => void;
  onStartDailyChallenge: () => void;
  onStartQuickPlay: () => void;
  onOpenApkGuide: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  onNavigate,
  onStartDailyChallenge,
  onStartQuickPlay,
  onOpenApkGuide,
}) => {
  const accuracy =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100)
      : 0;

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-6">
      {/* Hero Badge & Emblem */}
      <div className="text-center pt-2 pb-1 space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-1 shadow-2xl shadow-indigo-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <span className="text-4xl animate-bounce">🧠</span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            تحدي المعرفة
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">
            اختبر ثقافتك وألغازك في 15 مجالاً و 4 مستويات صعوبة
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-lg backdrop-blur-sm">
        <div className="text-center p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center justify-center text-amber-400 mb-1">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-white">
            {stats.totalPoints.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">النقاط الكلية</div>
        </div>

        <div className="text-center p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center justify-center text-orange-400 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-white">
            {stats.bestStreak}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">أفضل سلسلة</div>
        </div>

        <div className="text-center p-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="flex items-center justify-center text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-lg font-black text-white">
            %{accuracy}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">نسبة الدقة</div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <div
        onClick={() => {
          sound.playClick();
          onStartDailyChallenge();
        }}
        className="relative overflow-hidden group cursor-pointer p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/30 hover:border-amber-500/60 transition shadow-lg active:scale-[0.98]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  متجدد يومياً
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">التحدي اليومي</h3>
              <p className="text-xs text-slate-400">10 أسئلة مختارة + نقاط مضاعفة</p>
            </div>
          </div>
          <ChevronLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="space-y-3">
        {/* ابدأ اللعب */}
        <button
          onClick={() => {
            sound.playClick();
            onNavigate('categories');
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-current" />
          <span>ابدأ اللعب الآن</span>
        </button>

        {/* Secondary Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* المجالات */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('categories');
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition active:scale-[0.98] text-right flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">المجالات</div>
              <div className="text-[11px] text-slate-400">15 مجالاً متنوعاً</div>
            </div>
          </button>

          {/* أفضل النتائج */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('leaderboard');
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition active:scale-[0.98] text-right flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">أفضل النتائج</div>
              <div className="text-[11px] text-slate-400">سجل الأرقام القياسية</div>
            </div>
          </button>

          {/* الإنجازات */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('achievements');
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition active:scale-[0.98] text-right flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">الإنجازات</div>
              <div className="text-[11px] text-slate-400">أوسمة وتحديات</div>
            </div>
          </button>

          {/* الإعدادات */}
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('settings');
            }}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition active:scale-[0.98] text-right flex items-center gap-3"
          >
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">الإعدادات</div>
              <div className="text-[11px] text-slate-400">الصوت والمؤقت</div>
            </div>
          </button>
        </div>

        {/* زر تحويل التطبيق لـ APK */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenApkGuide();
          }}
          className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500/50 transition cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300">
                كيف تحوله إلى ملف APK لأندرويد؟
              </div>
              <div className="text-[11px] text-slate-400">
                طريقة إرسال التطبيق لصديقك وتثبيته مباشرة
              </div>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
