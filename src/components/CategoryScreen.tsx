import React from 'react';
import {
  Brain,
  Globe2,
  Scroll,
  Trophy,
  Atom,
  Moon,
  Laptop,
  Sparkles,
  Binary,
  Palette,
  Tv,
  Landmark,
  Swords,
  Flame,
  Target,
  Shuffle,
  ChevronLeft,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { Category } from '../types';
import { sound } from '../services/sound';

interface CategoryScreenProps {
  onSelectCategory: (category: Category) => void;
  onSelectRandom: () => void;
  onBack: () => void;
}

// Icon mapper
const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Globe2,
  Scroll,
  Trophy,
  Atom,
  Moon,
  Laptop,
  Sparkles,
  Binary,
  Palette,
  Tv,
  Landmark,
  Swords,
  Flame,
  Target,
};

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  onSelectCategory,
  onSelectRandom,
}) => {
  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">اختر المجال</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            15 مجالاً معرفياً غنياً وممتعاً
          </p>
        </div>

        {/* Random button */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectRandom();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25 active:scale-95 transition"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>عشوائي</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Sparkles;
          return (
            <div
              key={cat.id}
              onClick={() => {
                sound.playClick();
                onSelectCategory(cat);
              }}
              className={`group relative overflow-hidden p-3.5 rounded-2xl bg-slate-900/90 border ${cat.borderAccent} hover:border-white/40 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-between`}
            >
              {/* Left icon and details */}
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
