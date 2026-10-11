import React from 'react';
import { Volume2, VolumeX, Smartphone, ArrowRight, Sparkles } from 'lucide-react';
import { AppSettings, UserStats } from '../types';
import { sound } from '../services/sound';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  stats: UserStats;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenApkGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  stats,
  settings,
  onUpdateSettings,
  onOpenApkGuide,
}) => {
  const toggleSound = () => {
    const nextState = !settings.soundEnabled;
    sound.setEnabled(nextState);
    if (nextState) sound.playClick();
    onUpdateSettings({ ...settings, soundEnabled: nextState });
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left / Back / Brand */}
        <div className="flex items-center gap-2">
          {currentScreen !== 'home' ? (
            <button
              onClick={() => {
                sound.playClick();
                onNavigate('home');
              }}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
              title="العودة للرئيسية"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div
              onClick={() => {
                sound.playClick();
                onNavigate('home');
              }}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-lg">🧠</span>
                </div>
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-white leading-tight">
                  تحدي المعرفة
                </h1>
                <span className="text-[10px] text-indigo-400 font-medium block">
                  مسابقات وألغاز ذكية
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right tools: Points, Sound, APK guide */}
        <div className="flex items-center gap-2">
          {/* Points badge */}
          <div
            onClick={() => {
              sound.playClick();
              onNavigate('leaderboard');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold cursor-pointer hover:bg-indigo-500/20 transition active:scale-95"
            title="مجموع نقاطك"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{stats.totalPoints.toLocaleString('en-US')}</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition active:scale-95 ${
              settings.soundEnabled
                ? 'bg-slate-900 border-slate-800 text-indigo-400 hover:bg-slate-800'
                : 'bg-slate-900/60 border-slate-800/60 text-slate-500 hover:text-slate-400'
            }`}
            title={settings.soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* APK Guide button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenApkGuide();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition active:scale-95"
            title="تحويل التطبيق إلى ملف APK لأندرويد"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تحميل APK</span>
            <span className="sm:hidden">APK</span>
          </button>
        </div>
      </div>
    </header>
  );
};
