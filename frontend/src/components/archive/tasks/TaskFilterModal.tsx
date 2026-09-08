// src/components/archive/tasks/TaskFilterModal.tsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DropdownIcon, CalendarXIcon, CloseIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
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
        {/* Categoria Select con overlay centrato */}
        <ArchiveFilterCategorySelect
          label="Categoria"
          categories={taskCategories}
          selectedCategoryId={filters.categoryId === 'all' ? '' : filters.categoryId}
          onChange={(catId) => handleFieldChange('categoryId', catId || 'all')}
          allLabel="Tutte le categorie"
          overlay={true}
        />

        {/* Priorità Select con overlay centrato a schermo */}
        <div className="w-full">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Priorità
          </label>
          <div
            onClick={() => setIsPriorityOpen(true)}
            className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer flex justify-between items-center shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${priorityDots[filters.priority] || 'bg-gray-300'}`} />
              <span className="text-gray-700 truncate">
                {filters.priority === 'all' ? 'Tutte' : filters.priority}
              </span>
            </div>
            <DropdownIcon isDropdownOpen={isPriorityOpen} />
          </div>

          {isPriorityOpen &&
            createPortal(
              <div
                className="fixed inset-0 z-[10050] bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-fadeIn select-none pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPriorityOpen(false);
                }}
                aria-hidden="true"
              >
                <div
                  className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 max-w-[90vw] animate-fadeIn max-h-[75vh] flex flex-col pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
                    <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                      Seleziona Priorità
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="py-2 space-y-1">
                    {(['all', 'Alta', 'Media', 'Bassa'] as const).map((pri) => {
                      const isSelected = filters.priority === pri;
                      return (
                        <div
                          key={pri}
                          onClick={() => {
                            handleFieldChange('priority', pri);
                            setIsPriorityOpen(false);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-sm font-bold uppercase cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3.5 h-3.5 rounded-full shadow-2xs ${priorityDots[pri]}`} />
                            <span>{pri === 'all' ? 'Tutte le priorità' : pri}</span>
                          </div>
                          {isSelected && <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* 4. SCADENZA (DatePicker centrato in overlay) */}
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
              overlay={true}
              align="center"
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
