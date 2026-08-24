// src/components/reviews/ReviewFilterModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { SearchIcon, TagIcon, UndoIcon } from '@/components/shared/utils/Icons';
import type { ReviewFilterState, ReviewTabType } from '@/hooks/useReviewArchiveData';

interface ReviewFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ReviewFilterState;
  onFilterChange: (newFilters: ReviewFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  availableTags: string[];
  activeTab: ReviewTabType;
}

export const ReviewFilterModal: React.FC<ReviewFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  availableTags,
  activeTab,
}) => {
  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof ReviewFilterState>(
    field: K,
    value: ReviewFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const modalFooter = (
    <div className="flex items-center justify-between gap-3 w-full">
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 py-2.5 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <UndoIcon className="w-4 h-4" />
          <span>Reset filtri</span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onClose}
        className="py-2.5 px-6 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer ml-auto"
      >
        {hasActiveFilters ? 'Applica Filtri' : 'Chiudi'}
      </button>
    </div>
  );

  const titleSuffix = activeTab === 'months' ? 'Mesi' : 'Anni';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Filtri & Ricerca Review ${titleSuffix}`}
      maxWidthClass="max-w-md"
      footer={modalFooter}
    >
      <div className="space-y-4">
        {/* 1. RICERCA PER PAROLA CHIAVE NELLE RISPOSTE O TITOLO */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Parola Chiave nelle Risposte
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Cerca nelle risposte alle domande..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. RICERCA PER TAG CON SUGGERIMENTI */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Filtra per Tag
          </label>
          <div className="relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <TagIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.tag}
              onChange={(e) => handleFieldChange('tag', e.target.value)}
              placeholder="Digita un tag..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {/* Suggerimenti Tag Salvati */}
          {availableTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[11px] font-bold text-slate-400">Suggeriti:</span>
              {availableTags.slice(0, 8).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleFieldChange('tag', t)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                    filters.tag.toLowerCase() === t.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. STATO COMPILAZIONE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Stato Compilazione
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'Tutte' },
              { id: 'completed', label: 'Completate' },
              { id: 'pending', label: 'Da Completare' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleFieldChange('status', item.id as ReviewFilterState['status'])
                }
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filters.status === item.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ReviewFilterModal;
