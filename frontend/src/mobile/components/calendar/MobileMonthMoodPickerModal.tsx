// src/mobile/components/calendar/MobileMonthMoodPickerModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { CategoryGenre, type Category } from '@/types';
import { getHexColor } from '@/utils/uiUtils';
import { CloseIcon, TrashIcon } from '@/components/shared/utils/Icons';
import { MobileCategoryModal } from '@/mobile/components/modals/MobileCategoryModal';

interface MobileMonthMoodPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  currentMoodId?: number | null;
  allCategories?: Category[];
  onSelectMood: (dateStr: string, categoryId: number | null) => void;
}

export const MobileMonthMoodPickerModal: React.FC<MobileMonthMoodPickerModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  currentMoodId,
  allCategories = [],
  onSelectMood,
}) => {
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);

  // Filtriamo solo le categorie relative allo stato d'animo
  const moodCategories = useMemo(() => {
    return allCategories.filter(
      (c) => c.genre === CategoryGenre.MOOD || Number(c.genre) === 4
    );
  }, [allCategories]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop con Blur a Schermo Intero */}
      <div
        className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        onClick={onClose}
      >
        {/* Contenitore Centrato */}
        <div
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-[300px] overflow-hidden flex flex-col animate-scaleUp select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="flex items-center gap-2">
              <span className="text-base leading-none">😀</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
                Stato d'Animo
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Tasto '+' in alto: grigio come l'header, senza hover */}
              <button
                type="button"
                onClick={() => setIsCreateCategoryModalOpen(true)}
                className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 flex items-center justify-center active:scale-95 transition-transform focus:outline-none cursor-pointer"
                title="Crea nuovo stato d'animo"
                aria-label="Crea nuovo stato d'animo"
              >
                <svg
                  className="w-4 h-4 text-gray-800"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                title="Chiudi"
                aria-label="Chiudi"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista Stati d'Animo */}
          <div className="max-h-[260px] overflow-y-auto custom-scrollbar p-2 space-y-1">
            {moodCategories.map((mood) => {
              const hex = getHexColor(mood.colore || '#9ca3af');
              const isSelected = currentMoodId === mood.id;

              return (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => {
                    onSelectMood(dateStr, mood.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50 border-2 border-blue-500 font-black text-blue-900 shadow-2xs'
                      : 'hover:bg-gray-100 border border-transparent font-medium text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="truncate">{mood.category_name}</span>
                  </div>

                  {isSelected && (
                    <span className="text-xs text-blue-600 font-black shrink-0">✓</span>
                  )}
                </button>
              );
            })}

            {moodCategories.length === 0 && (
              <div className="py-6 text-center text-xs text-gray-400 font-medium">
                Nessuno stato d'animo registrato
              </div>
            )}
          </div>

          {/* Footer: Rimuovi Stato d'Animo se già presente */}
          {currentMoodId && (
            <div className="p-2 border-t border-gray-100 bg-gray-50/50">
              <button
                type="button"
                onClick={() => {
                  onSelectMood(dateStr, null);
                  onClose();
                }}
                className="w-full py-1.5 px-3 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <TrashIcon className="w-3.5 h-3.5" />
                <span>Rimuovi stato d'animo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modale Mobile per Creazione Nuova Categoria */}
      <MobileCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        defaultGenre={CategoryGenre.MOOD}
        onSuccess={(newCat) => {
          setIsCreateCategoryModalOpen(false);
          if (newCat?.id) {
            onSelectMood(dateStr, newCat.id);
          }
          onClose();
        }}
      />
    </>,
    document.body
  );
};

export default MobileMonthMoodPickerModal;
