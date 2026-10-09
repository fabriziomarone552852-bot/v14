import React, { useMemo, useState } from 'react';
import { ArchiveFilterSearchInput } from '@/components/archive/common';
import type { TVSeries } from '@/types/trackers';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useOutsideClick } from '@/hooks/useOutsideClick';

export interface SeriesFilterState {
  keyword: string;
  genre: string;
  network: string;
  ratings: string[];
  tmdbStatus: string;
  year: string;
  sortBy: string;
  listId: number | null;
}

const CustomSelect = ({ label, value, options, onChange, allLabel = 'Tutti' }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const selectedName = value !== 'all' ? options.find((o:any) => o.value === value)?.label || value : allLabel;
  
  const ref = useOutsideClick<HTMLDivElement>(() => {
    if (isOpen) setIsOpen(false);
  });

  React.useEffect(() => {
    if (isOpen && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 220); 
    }
  }, [isOpen]);

  return (
    <div ref={ref}>
      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer outline-none ${
            value !== 'all'
              ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
              : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
          }`}
        >
          <span className="truncate">{selectedName}</span>
          <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" isDropdownOpen={isOpen} />
        </button>

        {isOpen && (
          <div className={`absolute z-[100] w-full bg-white border border-gray-100 rounded-xl shadow-xl py-1 max-h-60 overflow-y-auto custom-scrollbar animate-fadeIn ${
            openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}>
            <button
              type="button"
              onClick={() => { onChange('all'); setIsOpen(false); }}
              className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                value === 'all' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <span>{allLabel}</span>
            </button>

            {options.map((opt:any) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full px-3 py-2 text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

interface SeriesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SeriesFilterState;
  onFilterChange: (newFilters: SeriesFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  series: TVSeries[];
  myLists?: any[];
}

export const SeriesFilterModal: React.FC<SeriesFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  series,
  myLists,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();
    series.forEach((s) => {
      if (s.genres) {
        s.genres.split(',').forEach((g) => genresSet.add(g.trim()));
      }
    });
    return Array.from(genresSet).filter(Boolean).sort().map(g => ({ value: g, label: g }));
  }, [series]);

  const availableNetworks = useMemo(() => {
    const networksSet = new Set<string>();
    series.forEach((s) => {
      if (s.networks) {
        s.networks.split(',').forEach((n) => networksSet.add(n.trim()));
      }
    });
    return Array.from(networksSet).filter(Boolean).sort().map(n => ({ value: n, label: n }));
  }, [series]);

  const handleFieldChange = <K extends keyof SeriesFilterState>(
    field: K,
    value: SeriesFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const toggleRating = (val: string) => {
    let newRatings = [...(filters.ratings || [])];
    if (newRatings.includes(val)) {
      newRatings = newRatings.filter((r) => r !== val);
    } else {
      newRatings.push(val);
    }
    handleFieldChange('ratings', newRatings);
  };

  const ratingOptions = [
    { value: '5', label: '5⭐' },
    { value: '4', label: '4⭐' },
    { value: '3', label: '3⭐' },
    { value: '2', label: '2⭐' },
    { value: '1', label: '1⭐' },
    { value: 'unrated', label: '🚫' },
  ];

  const tmdbStatusOptions = [
    { value: 'Ended', label: 'Conclusa' },
    { value: 'Returning Series', label: 'In produzione' },
    { value: 'Canceled', label: 'Cancellata' },
    { value: 'Miniseries', label: 'Miniserie' },
  ];

  const SidePanel = (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Le Mie Liste</h4>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 max-h-[60vh]">
        {(!myLists || myLists.length === 0) ? (
          <div className="text-center py-4 text-xs text-gray-400">Nessuna lista creata.</div>
        ) : (
          <>
            <button
              onClick={() => handleFieldChange('listId', null)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                filters.listId === null
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tutte le Serie
            </button>
            {myLists.map((list:any) => (
              <button
                key={list.id}
                onClick={() => handleFieldChange('listId', list.id)}
                className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  filters.listId === list.id
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                }`}
              >
                <span className="truncate">{list.name}</span>
                {list.items && (
                  <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full ml-2 shrink-0 shadow-sm">
                    {list.items.length}
                  </span>
                )}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );

  const headerActions = hasActiveFilters ? (
    <button
      type="button"
      onClick={onReset}
      className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1 transition-colors"
    >
      Reset Filtri
    </button>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ricerca & Filtri Serie TV"
      maxWidthClass="max-w-md"
      sidePanel={SidePanel}
      headerActions={headerActions}
      footer={null}
      overflowVisible={true}
    >
      <div className="space-y-4">
        <ArchiveFilterSearchInput
          label="Cerca per Nome"
          value={filters.keyword || ''}
          onChange={(val) => handleFieldChange('keyword', val)}
          placeholder="Es. Breaking Bad..."
        />

        <div className="grid grid-cols-2 gap-4">
          <CustomSelect 
            label="Genere"
            value={filters.genre || 'all'}
            options={availableGenres}
            onChange={(val: string) => handleFieldChange('genre', val)}
            allLabel="Tutti i generi"
          />

          <CustomSelect 
            label="Network"
            value={filters.network || 'all'}
            options={availableNetworks}
            onChange={(val: string) => handleFieldChange('network', val)}
            allLabel="Tutti i network"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Anno di Uscita
            </label>
            <div className="relative">
              <DatePicker
                 value={filters.year && filters.year !== 'all' ? `${filters.year}-01-01` : ''}
                 onChange={(date) => {
                   const newYear = date ? date.substring(0, 4) : 'all';
                   handleFieldChange('year', newYear);
                   setIsDatePickerOpen(false);
                 }}
                 isOpen={isDatePickerOpen}
                 onClose={() => setIsDatePickerOpen(false)}
                 onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                 selectionMode="year"
                 overlay={false}
                 usePortal={true}
                 align="center"
                 customTrigger={
                    <button
                      type="button"
                      className={`w-full flex items-center justify-between px-3 py-2 border rounded-xl text-xs transition-colors cursor-pointer ${
                        filters.year && filters.year !== 'all'
                          ? 'border-blue-300 bg-blue-50/50 text-blue-900 font-bold'
                          : 'border-gray-200 bg-white text-gray-700 font-normal hover:border-gray-300'
                      }`}
                    >
                      <span className="truncate">{filters.year && filters.year !== 'all' ? filters.year : 'Tutti gli anni'}</span>
                      <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                    </button>
                 }
              />
            </div>
          </div>

          <CustomSelect 
            label="Stato Produzione"
            value={filters.tmdbStatus || 'all'}
            options={tmdbStatusOptions}
            onChange={(val: string) => handleFieldChange('tmdbStatus', val)}
            allLabel="Tutti gli stati"
          />
        </div>

        <div>
           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
             Voto Personale (Multi-selezione)
           </label>
           <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
             {ratingOptions.map((opt) => {
               const isSelected = (filters.ratings || []).includes(opt.value);
               return (
                 <button
                   key={opt.value}
                   type="button"
                   onClick={() => toggleRating(opt.value)}
                   className={`flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-full text-base font-bold transition-all border-2 shrink-0 ${
                     isSelected 
                       ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                       : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200'
                   }`}
                 >
                   {opt.label}
                 </button>
               );
             })}
           </div>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <CustomSelect 
            label="Ordina per"
            value={filters.sortBy || 'date_added_desc'}
            options={[
              { value: 'date_added_desc', label: 'Aggiunte di recente' },
              { value: 'rating_desc', label: 'Voto migliore' },
              { value: 'name_asc', label: 'Nome (A-Z)' },
              { value: 'name_desc', label: 'Nome (Z-A)' },
              { value: 'release_date_desc', label: 'Anno (Più recenti)' },
              { value: 'release_date_asc', label: 'Anno (Più vecchie)' }
            ]}
            onChange={(val: string) => handleFieldChange('sortBy', val)}
            allLabel="Aggiunte di recente"
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default SeriesFilterModal;
