// src/components/tasks/TaskFilterModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { SearchIcon, DropdownIcon, UndoIcon, CalendarXIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { CategoryGenre, type Category } from '@/types';
import { formatName } from '@/utils/uiUtils';

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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [openCategoryUpwards, setOpenCategoryUpwards] = useState(false);
  const [openPriorityUpwards, setOpenPriorityUpwards] = useState(false);

  const categoryRef = useOutsideClick<HTMLDivElement>(() => setIsCategoryOpen(false));
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
    if (isCategoryOpen && categoryRef.current) {
      const rect = categoryRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenCategoryUpwards(spaceBelow < 200);
    }
  }, [isCategoryOpen, categoryRef]);

  useEffect(() => {
    if (isPriorityOpen && priorityRef.current) {
      const rect = priorityRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenPriorityUpwards(spaceBelow < 160);
    }
  }, [isPriorityOpen, priorityRef]);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof TaskFilterState>(
    field: K,
    value: TaskFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const selectedCategory = taskCategories.find((c) => String(c.id) === filters.categoryId);
  const selectedCategoryColor = selectedCategory?.colore || '#9CA3AF';
  const selectedCategoryName = selectedCategory ? selectedCategory.category_name : 'Tutte le categorie';

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
      title="Filtri & Ricerca Task"
      maxWidthClass="max-w-md"
      footer={modalFooter}
      overflowVisible={true}
    >
      <div className="space-y-4">
        {/* 1. CAMPO UNICO PAROLE CHIAVE (Titolo, Note o Luogo) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Parole Chiave (Titolo, Note o Luogo)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <SearchIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleFieldChange('keyword', e.target.value)}
              placeholder="Cerca per titolo, note o luogo..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. STATO (Tutti / Da fare / Completati) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Stato
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'all', label: 'Tutti' },
                { id: 'open', label: 'Da Fare' },
                { id: 'completed', label: 'Completati' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleFieldChange('status', st.id)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filters.status === st.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. CATEGORIA (Solo genre 1 e 3) & PRIORITÀ */}
        <div className="grid grid-cols-2 gap-4 items-end">
          {/* Categoria Custom Select */}
          <div className="w-full relative" ref={categoryRef}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Categoria
            </label>
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full px-3 py-2 bg-white border border-gray-200 hover:border-blue-500 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex justify-between items-center shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: filters.categoryId === 'all' ? '#9CA3AF' : selectedCategoryColor }}
                />
                <span className="text-gray-700 truncate text-xs">
                  {formatName(selectedCategoryName)}
                </span>
              </div>
              <DropdownIcon isDropdownOpen={isCategoryOpen} />
            </div>

            {isCategoryOpen && (
              <div
                className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 animate-fadeIn max-h-48 overflow-y-auto ${
                  openCategoryUpwards ? 'bottom-full mb-2' : 'top-full mt-1'
                }`}
              >
                <div
                  onClick={() => {
                    handleFieldChange('categoryId', 'all');
                    setIsCategoryOpen(false);
                  }}
                  className={`px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors ${
                    filters.categoryId === 'all' ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-600'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400 shrink-0" />
                  <span>Tutte le categorie</span>
                </div>
                {taskCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      handleFieldChange('categoryId', String(cat.id));
                      setIsCategoryOpen(false);
                    }}
                    className={`px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer flex items-center gap-2 transition-colors ${
                      filters.categoryId === String(cat.id) ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-600'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.colore || '#9CA3AF' }}
                    />
                    <span className="truncate">{formatName(cat.category_name)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

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

        {/* 4. SCADENZA (Con DatePicker e piccolo tasto Senza Scadenza al fianco) */}
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

            {/* Piccolo pulsante con l'icona CalendarXIcon (Senza Scadenza) */}
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
      </div>
    </BaseModal>
  );
};

export default TaskFilterModal;
