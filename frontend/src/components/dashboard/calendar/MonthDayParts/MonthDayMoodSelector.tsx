// frontend/src/components/dashboard/calendar/MonthDayParts/MonthDayMoodSelector.tsx
import React, { useState, useMemo, useEffect } from 'react';
import type { Category } from '@/types';
import { CategoryGenre } from '@/types';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useCategories } from '@/hooks/useCategories';
import { AddButton } from '@/components/shared/utils/AddButton';
import { CreateMoodModal } from '@/components/modals/CreateMoodModal';

interface MonthDayMoodSelectorProps {
  dateKey: string;
  moodCategoryId?: number | null;
  allCategories?: Category[];
  popoverAlignClass: string;
  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
  onToggle?: (isOpen: boolean) => void;
}

export const MonthDayMoodSelector: React.FC<MonthDayMoodSelectorProps> = ({
  dateKey,
  moodCategoryId = null,
  allCategories = [],
  popoverAlignClass,
  onMoodChange,
  onToggle,
}) => {
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState<boolean>(false);
  const [isCreateMoodModalOpen, setIsCreateMoodModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (onToggle) {
      onToggle(isMoodMenuOpen);
    }
  }, [isMoodMenuOpen, onToggle]);

  const moodMenuRef = useOutsideClick<HTMLDivElement>(() => {
    if (isMoodMenuOpen) setIsMoodMenuOpen(false);
  });

  const { openUpwards: openMoodUpwards } = useDropdownPosition(moodMenuRef, {
    isOpen: isMoodMenuOpen,
    threshold: 250,
  });

  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = allCategories && allCategories.length > 0 ? allCategories : dbCategories;

  const filteredMoods: Category[] = categoriesToUse.filter((c: Category) => {
    if (!c) return false;
    const g = c.genre;
    return g === CategoryGenre.MOOD || Number(g) === 4;
  });
  const userMoods: Category[] = filteredMoods;
  const activeMood: Category | null =
    userMoods.find((c: Category) => c.id === moodCategoryId || String(c.id) === String(moodCategoryId)) || null;

  const sortedUserMoods = useMemo(() => {
    if (!moodCategoryId) return userMoods;
    const selected = userMoods.find((m) => m.id === moodCategoryId || String(m.id) === String(moodCategoryId));
    if (!selected) return userMoods;
    const rest = userMoods.filter((m) => m.id !== selected.id);
    return [selected, ...rest];
  }, [userMoods, moodCategoryId]);

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
        title={activeMood ? `Stato d'Animo: ${activeMood.category_name}` : 'Aggiungi umore'}
      >
        {activeMood ? (
          <div
            className="w-3.5 h-3.5 rounded-full shadow-xs border border-white shrink-0"
            style={{ backgroundColor: activeMood.colore || '#9CA3AF' }}
          />
        ) : (
          <span className="text-xs leading-none grayscale">😀</span>
        )}
      </button>

      {isMoodMenuOpen && (
        <div
          className={`absolute z-[1000] ${
            openMoodUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          } w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 animate-fadeIn cursor-default overflow-hidden flex flex-col ${popoverAlignClass}`}
        >
          <div className="max-h-40 overflow-y-auto space-y-1">
            {sortedUserMoods.map((mood: Category) => {
              const isSelected = moodCategoryId === mood.id || String(moodCategoryId) === String(mood.id);
              return (
                <div
                  key={mood.id}
                  onClick={(e) => handleMoodSelect(e, mood.id!)}
                  className={`px-3 py-1.5 text-xs cursor-pointer rounded-lg flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 border-2 border-blue-500 font-extrabold text-blue-900 shadow-2xs'
                      : 'hover:bg-gray-100/70 font-medium text-gray-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs border border-white"
                      style={{ backgroundColor: mood.colore || '#9CA3AF' }}
                    />
                    <span className="truncate">{mood.category_name}</span>
                  </div>
                  {isSelected && <span className="text-[10px] text-blue-600 font-black shrink-0">✓</span>}
                </div>
              );
            })}
            {userMoods.length === 0 && (
              <div className="px-3 py-3 text-xs text-center text-gray-400">Nessuna emozione</div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1.5 mt-1 space-y-1">
            <AddButton
              label="Nuova Emozione"
              compact={true}
              onClick={() => {
                setIsMoodMenuOpen(false);
                setIsCreateMoodModalOpen(true);
              }}
            />
            {activeMood && (
              <div
                onClick={(e) => handleMoodSelect(e, null)}
                className="px-3 py-1 text-[11px] hover:bg-red-50 cursor-pointer flex items-center justify-center transition-colors text-red-500 font-bold border-t border-gray-50 rounded-lg"
              >
                Rimuovi
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALE PER CREARE UN NUOVO STATO D'ANIMO / EMOZIONE */}
      <CreateMoodModal
        isOpen={isCreateMoodModalOpen}
        onClose={() => setIsCreateMoodModalOpen(false)}
        onSuccess={(newId) => {
          if (onMoodChange) {
            onMoodChange(dateKey, newId);
          }
        }}
      />
    </div>
  );
};
