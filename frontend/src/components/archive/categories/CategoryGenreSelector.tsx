// src/components/archive/categories/CategoryGenreSelector.tsx
import React from 'react';
import { CategoryGenre } from '@/types/categories';

interface CategoryGenreSelectorProps {
  genre: number;
  onGenreChange: (genre: number) => void;
}

const GENRE_OPTIONS = [
  { id: CategoryGenre.TASKS, label: 'Tasks' },
  { id: CategoryGenre.EVENTS, label: 'Eventi' },
  { id: CategoryGenre.COMMON, label: 'Comune (Tasks & Eventi)' },
  { id: CategoryGenre.MOOD, label: "Stati d'animo" },
];

export const CategoryGenreSelector: React.FC<CategoryGenreSelectorProps> = ({
  genre,
  onGenreChange,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        Tipologia / Destinazione d'Uso
      </label>
      <div className="grid grid-cols-2 gap-2">
        {GENRE_OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onGenreChange(item.id)}
            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
              genre === item.id
                ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-2xs font-extrabold'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
