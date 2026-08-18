// src/components/habits/HabitFilterModal.tsx
import React, { useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { SearchIcon, UndoIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type { HabitFilterState } from '@/hooks/useHabitArchiveData';
import type { HabitTabType } from '@/components/habits/ArchiveTabs';

interface HabitFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: HabitFilterState;
  onFilterChange: (newFilters: HabitFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  activeTab: HabitTabType;
}

export const HabitFilterModal: React.FC<HabitFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  activeTab,
}) => {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof HabitFilterState>(
    field: K,
    value: HabitFilterState[K]
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

  const titleSuffix = activeTab === 'routines' ? 'Routines' : 'Habits';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Filtri & Ricerca ${titleSuffix}`}
      maxWidthClass="max-w-md"
      footer={modalFooter}
      overflowVisible={true}
    >
      <div className="space-y-4">
        {/* 1. RICERCA PER PAROLA CHIAVE NEL NOME */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Nome {activeTab === 'routines' ? 'Routine' : 'Habit'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Cerca per nome..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. STATO (TUTTI / SOLO ATTIVI / SOLO IN PAUSA) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Stato
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'all', label: 'Tutti' },
              { id: 'active', label: 'Solo Attivi' },
              { id: 'paused', label: 'Solo in Pausa' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleFieldChange('status', item.id as HabitFilterState['status'])
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

        {/* 3. PERIODO DI SCADENZA / INIZIO CON DATEPICKER */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Data Da
            </label>
            <DatePicker
              value={filters.dateFrom}
              onChange={(d) => handleFieldChange('dateFrom', d)}
              isOpen={isDateFromOpen}
              onToggle={() => {
                setIsDateFromOpen(!isDateFromOpen);
                setIsDateToOpen(false);
              }}
              onClose={() => setIsDateFromOpen(false)}
              placeholder="Da data..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Data A
            </label>
            <DatePicker
              value={filters.dateTo}
              onChange={(d) => handleFieldChange('dateTo', d)}
              isOpen={isDateToOpen}
              onToggle={() => {
                setIsDateToOpen(!isDateToOpen);
                setIsDateFromOpen(false);
              }}
              onClose={() => setIsDateToOpen(false)}
              placeholder="A data..."
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default HabitFilterModal;
