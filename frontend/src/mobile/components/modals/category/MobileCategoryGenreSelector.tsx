// src/mobile/components/modals/category/MobileCategoryGenreSelector.tsx
import React from 'react';
import { CategoryGenre } from '@/types/categories';
import {
  CategoryIcon,
  CalendarIcon,
  TaskListIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';

export interface GenreOptionItem {
  id: number;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const GENRE_OPTIONS: GenreOptionItem[] = [
  { id: CategoryGenre.TASKS, label: 'Tasks', desc: 'Per le attività', icon: TaskListIcon },
  { id: CategoryGenre.EVENTS, label: 'Eventi', desc: 'Per il calendario', icon: CalendarIcon },
  { id: CategoryGenre.COMMON, label: 'Comune', desc: 'Tasks & Eventi', icon: CategoryIcon },
  { id: CategoryGenre.MOOD, label: 'Mood', desc: "Stati d'animo", icon: CheckCircleIcon },
];

interface MobileCategoryGenreSelectorProps {
  selectedGenre: number;
  onSelectGenre: (genre: number) => void;
}

export const MobileCategoryGenreSelector: React.FC<MobileCategoryGenreSelectorProps> = ({
  selectedGenre,
  onSelectGenre,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        Destinazione d'Uso
      </label>
      <div className="grid grid-cols-2 gap-2">
        {GENRE_OPTIONS.map((item) => {
          const IconComponent = item.icon;
          const isSelected = selectedGenre === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectGenre(item.id)}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-2xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-[0.99]'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                <div className="text-[10px] text-gray-400 truncate leading-tight">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileCategoryGenreSelector;
