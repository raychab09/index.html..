import React, { useState } from 'react';
import {
  CheckCircle2,
  Zap,
  Flame,
  ShieldAlert,
  Clock,
  Play,
  ArrowRight,
} from 'lucide-react';
import { CATEGORIES, DIFFICULTIES } from '../data/categories';
import { AppSettings, Category, Difficulty } from '../types';
import { sound } from '../services/sound';

interface DifficultyScreenProps {
  category: Category;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onStartQuiz: (difficulty: Difficulty) => void;
  onBack: () => void;
}

const ICON_MAP = {
  CheckCircle2,
  Zap,
  Flame,
  ShieldAlert,
};

export const DifficultyScreen: React.FC<DifficultyScreenProps> = ({
  category,
  settings,
  onUpdateSettings,
  onStartQuiz,
  onBack,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const difficultiesList: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  const toggleTimer = () => {
    sound.playClick();
    onUpdateSettings({
      ...settings,
      timerEnabled: !settings.timerEnabled,
    });
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-5">
      {/* Category header indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] text-indigo-400 font-bold block">
              المجال المختار
            </span>
            <h2 className="text-lg font-bold text-white leading-tight">
              {category.name}
            </h2>
          </div>
        </div>

        {/* Timer toggle chip */}
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 ${
            settings.timerEnabled
              ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title="تشغيل أو إيقاف المؤقت"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{settings.timerEnabled ? `مؤقت (20 ث)` : 'بدون مؤقت'}</span>
        </button>
      </div>

      <div className="text-sm text-slate-400">
        اختر مستوى التحدي للجولة (10 أسئلة):
      </div>

      {/* 4 Difficulty Cards */}
      <div className="space-y-3">
        {difficultiesList.map((diffKey) => {
          const diff = DIFFICULTIES[diffKey];
          const Icon = ICON_MAP[diff.icon as keyof typeof ICON_MAP] || Zap;
          const isSelected = selectedDifficulty === diffKey;

          return (
            <div
              key={diffKey}
              onClick={() => {
                sound.playClick();
                setSelectedDifficulty(diffKey);
              }}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-[0.98] relative overflow-hidden ${
                isSelected
                  ? `bg-slate-900/95 ${diff.borderColor} ring-2 ring-offset-2 ring-offset-slate-950 ring-indigo-500/50 shadow-lg`
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl bg-slate-800/80 ${diff.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{diff.name}</span>
                    </h3>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-xs font-black text-amber-400">
                  +{diff.points} نقطة
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed pr-10">
                {diff.description}
              </p>

              {/* Selection indicator pill */}
              <div className="absolute top-4 left-4">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-800/50'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Button */}
      <div className="pt-2">
        <button
          onClick={() => {
            sound.playClick();
            onStartQuiz(selectedDifficulty);
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>ابدأ جولة الـ 10 أسئلة</span>
        </button>
      </div>
    </div>
  );
};
