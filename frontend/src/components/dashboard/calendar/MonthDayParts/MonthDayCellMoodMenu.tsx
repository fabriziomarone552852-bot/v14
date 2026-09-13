// src/components/dashboard/calendar/MonthDayParts/MonthDayCellMoodMenu.tsx
import React, { useState } from 'react';
import type { Category } from '@/types';
import { CategoryGenre } from '@/types';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';

interface MonthDayCellMoodMenuProps {
  dateKey: string;
  moodCategoryId?: number | null;
  allCategories?: Category[];
  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onCreateNewMood?: (dateStr: string) => void;
}

export const MonthDayCellMoodMenu: React.FC<MonthDayCellMoodMenuProps> = ({
  dateKey,
  moodCategoryId = null,
  allCategories = [],
  onMoodChange,
  onCreateNewMood,
}) => {
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);

  const moodMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (isMoodMenuOpen) setIsMoodMenuOpen(false);
  });

  const { openUpwards: openMoodUpwards } = useDropdownPosition(moodMenuRef, {
    isOpen: isMoodMenuOpen,
    threshold: 250,
  });

  const userMoods: Category[] = allCategories.filter((c: Category) => c.genre === CategoryGenre.MOOD);
  const activeMood: Category | null = userMoods.find((c: Category) => c.id === moodCategoryId) || null;

  const handleMoodSelect = (e: React.MouseEvent, categoryId: number | null) => {
    e.stopPropagation();
    setIsMoodMenuOpen(false);
    if (onMoodChange) onMoodChange(dateKey, categoryId);
  };

  return (
    <div className="relative" ref={moodMenuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsMoodMenuOpen(!isMoodMenuOpen);
        }}
        className="text-base transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-40 hover:!opacity-100 p-1 rounded-md"
        title={activeMood ? activeMood.category_name : 'Aggiungi umore'}
      >
        {activeMood ? (
          <div
            className="w-3.5 h-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: activeMood.colore || '#9CA3AF' }}
          />
        ) : (
          <span className="text-xs leading-none grayscale">😀</span>
        )}
      </button>

      {/* IL MENU A CASCATA GENERATO DAL DATABASE */}
      {isMoodMenuOpen && (
        <div
          className={`absolute z-[100] right-0 ${
            openMoodUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          } w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn cursor-default overflow-hidden flex flex-col`}
        >
          <div className="max-h-40 overflow-y-auto">
            {userMoods.map((mood: Category) => (
              <div
                key={mood.id}
                onClick={(e) => handleMoodSelect(e, mood.id!)}
                className={`px-3 py-2 text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                  moodCategoryId === mood.id ? 'bg-blue-50 font-black' : 'hover:bg-gray-50 font-medium text-gray-700'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: mood.colore || '#9CA3AF' }}
                />
                <span className="truncate">{mood.category_name}</span>
              </div>
            ))}
            {userMoods.length === 0 && (
              <div className="px-3 py-3 text-xs text-center text-gray-400">Nessuna emozione</div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1 mt-1">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setIsMoodMenuOpen(false);
                if (onCreateNewMood) onCreateNewMood(dateKey);
              }}
              className="px-3 py-1.5 text-[11px] hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-colors text-blue-600 font-bold"
            >
              + Nuova Emozione
            </div>
            {activeMood && (
              <div
                onClick={(e) => handleMoodSelect(e, null)}
                className="px-3 py-1.5 text-[11px] hover:bg-red-50 cursor-pointer flex items-center justify-center transition-colors text-red-500 font-bold border-t border-gray-50"
              >
                Rimuovi
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
