import React from 'react';
import { Home, Layers, Trophy, Award, Settings } from 'lucide-react';
import { sound } from '../services/sound';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  // Hide bottom nav during active quiz
  if (currentScreen === 'quiz') return null;

  const tabs = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'categories', label: 'المجالات', icon: Layers },
    { id: 'leaderboard', label: 'النتائج', icon: Trophy },
    { id: 'achievements', label: 'الإنجازات', icon: Award },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onNavigate(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
