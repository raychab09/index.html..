import React from 'react';
import {
  Award,
  Crown,
  Compass,
  Flame,
  ShieldAlert,
  Calendar,
  Sparkles,
  Brain,
  Globe,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { Achievement } from '../types';

interface AchievementsScreenProps {
  achievements: Achievement[];
}

const ICON_MAP: Record<string, React.ElementType> = {
  Compass,
  Crown,
  Flame,
  ShieldAlert,
  Calendar,
  Award,
  Sparkles,
  Brain,
  Globe,
};

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span>لوحة الإنجازات</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          اجمع الأوسمة وحقق التحديات أثناء تقدمك
        </p>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">نسبة إنجاز الأوسمة</span>
          <span className="text-emerald-400">
            {unlockedCount} من {totalCount} ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Achievements Cards */}
      <div className="space-y-2.5">
        {achievements.map((ach) => {
          const Icon = ICON_MAP[ach.icon] || Award;

          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                ach.isUnlocked
                  ? 'bg-slate-900 border-amber-500/40 shadow-md shadow-amber-500/5'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-70'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  ach.isUnlocked
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {ach.isUnlocked ? (
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold truncate ${
                      ach.isUnlocked ? 'text-white' : 'text-slate-400'
                    }`}
                  >
                    {ach.title}
                  </h4>
                  {ach.isUnlocked && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مكتمل</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {ach.description}
                </p>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>المطلوب: {ach.requirement}</span>
                  {ach.unlockedAt && <span>تم الفتح في: {ach.unlockedAt}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
