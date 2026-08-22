// src/components/archive/tasks/TaskFilterModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { DropdownIcon, CalendarXIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { CategoryGenre, type Category } from '@/types';
import {
  ArchiveFilterModal,
  ArchiveFilterSearchInput,
  ArchiveFilterSegmentedGroup,
  ArchiveFilterCategorySelect,
} from '@/components/archive/common';

export interface TaskFilterState {
  keyword: string;
  status: 'all' | 'open' | 'completed';
  noDeadlineOnly: boolean;
  categoryId: string;
  priority: string;
  dateDeadline: string;
}

interface TaskFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TaskFilterState;
  onFilterChange: (newFilters: TaskFilterState) => void;
  onReset: () => void;
  categories: Category[];
  hasActiveFilters: boolean;
}

const priorityDots: Record<string, string> = {
  all: 'bg-gray-300',
  Alta: 'bg-red-500',
  Media: 'bg-orange-500',
  Bassa: 'bg-yellow-500',
};

export const TaskFilterModal: React.FC<TaskFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  categories,
  hasActiveFilters,
}) => {
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [openPriorityUpwards, setOpenPriorityUpwards] = useState(false);

  const priorityRef = useOutsideClick<HTMLDivElement>(() => setIsPriorityOpen(false));

  // Mostra SOLO categorie con genre 1 (TASKS) e genre 3 (COMMON)
  const taskCategories = useMemo(
    () =>
      categories.filter(
        (c: Category) =>
          c.genre === CategoryGenre.TASKS ||
          c.genre === CategoryGenre.COMMON ||
          c.genre === 1 ||
          c.genre === 3
      ),
    [categories]
  );

  useEffect(() => {
    if (isPriorityOpen && priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenPriorityUpwards(spaceBelow < 160);
    }
  }, [isPriorityOpen, priorityRef]);

  const handleFieldChange = <K extends keyof TaskFilterState>(
    field: K,
    value: TaskFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <ArchiveFilterModal
      isOpen={isOpen}
      onClose={onClose}
      title="Filtri & Ricerca Task"
      onReset={onReset}
      hasActiveFilters={hasActiveFilters}
      overflowVisible={true}
    >
      {/* 1. CAMPO UNICO PAROLE CHIAVE (Titolo, Note o Luogo) */}
      <ArchiveFilterSearchInput
        label="Parole Chiave (Titolo, Note o Luogo)"
        value={filters.keyword}
        onChange={(val) => handleFieldChange('keyword', val)}
        placeholder="Cerca per titolo, note o luogo..."
      />

      {/* 2. STATO (Tutti / Da fare / Completati) */}
      <ArchiveFilterSegmentedGroup<'all' | 'open' | 'completed'>
        label="Stato"
        value={filters.status}
        onChange={(val) => handleFieldChange('status', val)}
        options={[
          { value: 'all', label: 'Tutti' },
          { value: 'open', label: 'Da Fare' },
          { value: 'completed', label: 'Completati' },
        ]}
      />

      {/* 3. CATEGORIA & PRIORITÀ */}
      <div className="grid grid-cols-2 gap-4 items-end">
        {/* Categoria Select */}
        <ArchiveFilterCategorySelect
          label="Categoria"
          categories={taskCategories}
          selectedCategoryId={filters.categoryId === 'all' ? '' : filters.categoryId}
          onChange={(catId) => handleFieldChange('categoryId', catId || 'all')}
          allLabel="Tutte le categorie"
        />

        {/* Priorità Custom Select */}
        <div className="w-full relative" ref={priorityRef}>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Priorità
          </label>
          <div
            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
            className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-sm font-bold uppercase transition-colors cursor-pointer flex justify-between items-center shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full shrink-0 ${priorityDots[filters.priority] || 'bg-gray-300'}`} />
              <span className="text-gray-700 text-xs">
                {filters.priority === 'all' ? 'Tutte' : filters.priority}
              </span>
            </div>
            <DropdownIcon isDropdownOpen={isPriorityOpen} />
          </div>

          {isPriorityOpen && (
            <div
              className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn ${
                openPriorityUpwards ? 'bottom-full mb-2' : 'top-full mt-1'
              }`}
            >
              {(['all', 'Alta', 'Media', 'Bassa'] as const).map((pri) => (
                <div
                  key={pri}
                  onClick={() => {
                    handleFieldChange('priority', pri);
                    setIsPriorityOpen(false);
                  }}
                  className={`px-3 py-2 text-xs font-bold uppercase cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors ${
                    filters.priority === pri ? 'text-gray-900 bg-gray-50' : 'text-gray-500'
                  }`}
                >
                  <span>{pri === 'all' ? 'Tutte' : pri}</span>
                  <span className={`w-2 h-2 rounded-full shadow-sm ${priorityDots[pri]}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. SCADENZA */}
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
          Scadenza
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <DatePicker
              value={filters.dateDeadline}
              onChange={(date) => {
                onFilterChange({
                  ...filters,
                  dateDeadline: date,
                  noDeadlineOnly: false,
                });
              }}
              isOpen={isDatePickerOpen && !filters.noDeadlineOnly}
              onToggle={() => {
                if (!filters.noDeadlineOnly) {
                  setIsDatePickerOpen(!isDatePickerOpen);
                }
              }}
              onClose={() => setIsDatePickerOpen(false)}
              placeholder={filters.noDeadlineOnly ? 'Solo senza scadenza' : 'Seleziona data limite...'}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              const nextNoDeadline = !filters.noDeadlineOnly;
              onFilterChange({
                ...filters,
                noDeadlineOnly: nextNoDeadline,
                dateDeadline: nextNoDeadline ? '' : filters.dateDeadline,
              });
              setIsDatePickerOpen(false);
            }}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center w-10 h-9.5 shrink-0 cursor-pointer ${
              filters.noDeadlineOnly
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-blue-600'
            }`}
            title={filters.noDeadlineOnly ? 'Disattiva filtro Senza Scadenza' : 'Filtra solo task Senza Scadenza'}
          >
            <CalendarXIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ArchiveFilterModal>
  );
};

export default TaskFilterModal;
