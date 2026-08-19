// src/components/notes/NoteFilterModal.tsx
import React, { useState } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { SearchIcon, UndoIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import type { NoteFilterState } from '@/hooks/useNoteArchiveData';

interface NoteFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: NoteFilterState;
  onFilterChange: (newFilters: NoteFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const NoteFilterModal: React.FC<NoteFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
}) => {
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof NoteFilterState>(
    field: K,
    value: NoteFilterState[K]
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtri & Ricerca Note"
      maxWidthClass="max-w-md"
      footer={modalFooter}
      overflowVisible={true}
    >
      <div className="space-y-4">
        {/* 1. RICERCA PER PAROLA CHIAVE NEL TESTO */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Parola Chiave nel Testo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Cerca negli appunti..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. TIPOLOGIA COLORE / VARIANTE */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Tipologia / Colore Nota
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'all', label: 'Tutte', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
              { id: 'N1', label: 'Giallo', bg: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
              { id: 'N2', label: 'Verde', bg: 'bg-green-100 text-green-900 border-green-300' },
              { id: 'N3', label: 'Blu', bg: 'bg-blue-100 text-blue-900 border-blue-300' },
              { id: 'N4', label: 'Rosa', bg: 'bg-pink-100 text-pink-900 border-pink-300' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  handleFieldChange('variant', item.id as NoteFilterState['variant'])
                }
                className={`py-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  filters.variant === item.id
                    ? 'ring-2 ring-blue-600 font-extrabold shadow-sm'
                    : 'opacity-75 hover:opacity-100'
                } ${item.bg}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. INTERVALLO DI DATE (DA DATA - A DATA CON DATEPICKER) */}
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

export default NoteFilterModal;
