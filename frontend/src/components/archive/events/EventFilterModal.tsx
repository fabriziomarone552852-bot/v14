// src/components/events/EventFilterModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { SearchIcon, DropdownIcon, UndoIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { CategoryGenre, type Category } from '@/types';
import { formatName } from '@/utils/uiUtils';

export interface EventFilterState {
  keyword: string;
  categoryId: string;
  timeframe: 'all' | 'upcoming' | 'past';
  durationType: 'all' | 'timed' | 'allDay';
  startDate: string;
  endDate: string;
}

interface EventFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: EventFilterState;
  onFilterChange: (newFilters: EventFilterState) => void;
  onReset: () => void;
  categories: Category[];
  hasActiveFilters: boolean;
}

export const EventFilterModal: React.FC<EventFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  categories,
  hasActiveFilters,
}) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [openCategoryUpwards, setOpenCategoryUpwards] = useState(false);
  const [activeDatePicker, setActiveDatePicker] = useState<'start' | 'end' | null>(null);

  const categoryRef = useOutsideClick<HTMLDivElement>(() => setIsCategoryOpen(false));

  // Mostra SOLO categorie con genre 2 (EVENTS) e genre 3 (COMMON)
  const eventCategories = useMemo(
    () =>
      categories.filter(
        (c: Category) =>
          c.genre === CategoryGenre.EVENTS ||
          c.genre === CategoryGenre.COMMON ||
          c.genre === 2 ||
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

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof EventFilterState>(
    field: K,
    value: EventFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const selectedCategory = eventCategories.find((c) => String(c.id) === filters.categoryId);
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
      title="Filtri & Ricerca Eventi"
      maxWidthClass="max-w-md"
      footer={modalFooter}
      overflowVisible={true}
    >
      <div className="space-y-4">
        {/* 1. CAMPO UNICO PAROLE CHIAVE (Titolo, Descrizione o Luogo) */}
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

        {/* 2. CATEGORIA (Solo genre 2 e 3) */}
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
              {eventCategories.map((cat) => (
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

        {/* 3. PERIODO (Tutti / In programma / Passati) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Periodo
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'all', label: 'Tutti' },
                { id: 'upcoming', label: 'In Programma' },
                { id: 'past', label: 'Passati' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                type="button"
                onClick={() => handleFieldChange('timeframe', tf.id)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filters.timeframe === tf.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. TIPOLOGIA DURATA (Tutti / Con orario / Tutto il giorno) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Tipologia Orario
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'all', label: 'Tutti' },
                { id: 'timed', label: 'Con Orario' },
                { id: 'allDay', label: 'Tutto il Giorno' },
              ] as const
            ).map((dt) => (
              <button
                key={dt.id}
                type="button"
                onClick={() => handleFieldChange('durationType', dt.id)}
                className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  filters.durationType === dt.id
                    ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {dt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. INTERVALLO DATE (Con DatePicker personalizzati) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Da Data
            </label>
            <DatePicker
              value={filters.startDate}
              onChange={(date) => handleFieldChange('startDate', date)}
              isOpen={activeDatePicker === 'start'}
              onToggle={() => setActiveDatePicker(activeDatePicker === 'start' ? null : 'start')}
              onClose={() => setActiveDatePicker(null)}
              placeholder="Data inizio..."
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              A Data
            </label>
            <DatePicker
              value={filters.endDate}
              onChange={(date) => handleFieldChange('endDate', date)}
              isOpen={activeDatePicker === 'end'}
              onToggle={() => setActiveDatePicker(activeDatePicker === 'end' ? null : 'end')}
              onClose={() => setActiveDatePicker(null)}
              placeholder="Data fine..."
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default EventFilterModal;
