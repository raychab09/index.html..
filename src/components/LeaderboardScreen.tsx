import React, { useState } from 'react';
import { Trophy, Calendar, Sparkles, Filter } from 'lucide-react';
import { Difficulty, HighScoreRecord } from '../types';
import { sound } from '../services/sound';

interface LeaderboardScreenProps {
  highScores: HighScoreRecord[];
  onPlayNow: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  highScores,
  onPlayNow,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredScores =
    filterDifficulty === 'all'
      ? highScores
      : highScores.filter((s) => s.difficulty === filterDifficulty);

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'easy', label: 'سهل' },
    { id: 'medium', label: 'متوسط' },
    { id: 'hard', label: 'صعب' },
    { id: 'expert', label: 'صعب جدًا' },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>أفضل النتائج</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            سجل إنجازاتك وأعلى النقاط المحققة
          </p>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => {
              sound.playClick();
              setFilterDifficulty(f.id);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterDifficulty === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      {filteredScores.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-2xl">
            🏆
          </div>
          <h3 className="text-base font-bold text-white">لا توجد نتائج مسجلة بعد</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            أكمل جولتك الأولى في أحد المجالات ليتم حفظ وتخليد نتيجتك القياسية هنا!
          </p>
          <button
            onClick={() => {
              sound.playClick();
              onPlayNow();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition"
          >
            العب أول جولة الآن
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredScores.map((record, index) => {
            const rank = index + 1;
            let rankBadge = (
              <span className="w-7 h-7 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center justify-center">
                {rank}
              </span>
            );

            if (rank === 1) {
              rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-bold flex items-center justify-center">
                  🥇
                </span>
              );
            } else if (rank === 2) {
              rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-slate-300/20 border border-slate-400/40 text-slate-200 text-sm font-bold flex items-center justify-center">
                  🥈
                </span>
              );
            } else if (rank === 3) {
              rankBadge = (
                <span className="w-7 h-7 rounded-xl bg-amber-700/20 border border-amber-700/40 text-amber-600 text-sm font-bold flex items-center justify-center">
                  🥉
                </span>
              );
            }

            return (
              <div
                key={record.id}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/90 flex items-center justify-between hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  {rankBadge}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">
                        {record.categoryName}
                      </h4>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {record.difficultyName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>دقة: %{record.accuracy}</span>
                      <span>•</span>
                      <span>{record.date}</span>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-base font-black text-amber-400 flex items-center gap-1 justify-end">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{record.score}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
