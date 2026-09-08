// src/components/archive/reviews/ReviewFilterModal.tsx
import React from 'react';
import { TagIcon } from '@/components/shared/utils/Icons';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  type FilterSegmentOption,
} from '@/components/archive/common';
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

const statusOptions: FilterSegmentOption<ReviewFilterState['status']>[] = [
  { value: 'all', label: 'Tutte' },
  { value: 'completed', label: 'Completate' },
  { value: 'pending', label: 'Da fare' },
];

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

  const titleSuffix = activeTab === 'months' ? 'Mesi' : 'Anni';

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Filtri & Ricerca Review ${titleSuffix}`}
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
    >
      <div className="space-y-4">
        {/* 1. RICERCA PER PAROLA CHIAVE NELLE RISPOSTE O TITOLO */}
        <ArchiveFilterSearchInput
          label="Parola Chiave nelle Risposte"
          value={filters.keyword}
          onChange={(val) => handleFieldChange('keyword', val)}
          placeholder="Cerca nelle risposte alle domande..."
        />

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
        <ArchiveFilterSegmentedGroup<ReviewFilterState['status']>
          label="Stato Compilazione"
          options={statusOptions}
          value={filters.status}
          onChange={(val) => handleFieldChange('status', val)}
        />
      </div>
    </ArchiveFilterModal>
  );
};

export default ReviewFilterModal;
