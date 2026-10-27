// src/mobile/components/trackers/movies/MobileMovieFilterOptions.tsx
import React, { useState } from 'react';
import type { MediaList } from '@/types/trackers';
import type { MovieFilters } from '@/types/movies';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import {
  SearchIcon,
  DropdownIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { MobileModalSelect } from '@/mobile/components/common/MobileModalSelect';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

const BookmarkIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
    />
  </svg>
);

export interface MobileMovieFilterOptionsProps {
  filters: MovieFilters;
  hasActiveFilters: boolean;
  myLists?: MediaList[];
  availableGenres: Array<{ value: string; label: string }>;
  availablePlatforms: Array<{ value: string; label: string }>;
  availableSagas?: Array<{ value: string; label: string }>;
  ratingOptions: Array<{ value: string; label: string }>;
  obtainedOptions?: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  handleFieldChange: <K extends keyof MovieFilters>(field: K, value: MovieFilters[K]) => void;
  toggleRating: (rating: string) => void;
  handleYearChange: (dateStr: string | null) => void;
  onExecuteSearch: () => void;
}

export const MobileMovieFilterOptions: React.FC<MobileMovieFilterOptionsProps> = ({
  filters,
  myLists,
  availableGenres,
  availablePlatforms,
  availableSagas,
  ratingOptions,
  obtainedOptions,
  sortOptions,
  isDatePickerOpen,
  setIsDatePickerOpen,
  handleFieldChange,
  toggleRating,
  handleYearChange,
  onExecuteSearch,
}) => {
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const { handleScroll, scrollbarClass } = useFadeScrollbar();

  const selectedList = myLists?.find((l) => l.id === filters.listId);
  const selectedListName = selectedList ? selectedList.name : 'Tutti i Film';
  const selectedListCount = selectedList
    ? (selectedList.items?.filter((i) => i.media_type === 'movie' || Boolean(i.movie_tmdb_id))?.length ?? selectedList.items?.length ?? 0)
    : null;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      {/* Area filtri scrollabile */}
      <div
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto p-3 space-y-3.5 ${scrollbarClass}`}
      >
        {/* 1. SELETTORE LISTA PERSONALE */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsListModalOpen(true)}
            className="w-full p-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-gray-50/80 active:bg-gray-100/70 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                <BookmarkIcon className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <span className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 leading-tight">
                  Liste
                </span>
                <div className="flex items-center gap-2 mt-0.5 min-w-0">
                  <span className="text-sm font-extrabold text-gray-900 truncate">
                    {selectedListName}
                  </span>
                  {selectedListCount !== null && (
                    <span className="text-[10px] font-bold bg-blue-100/80 text-blue-700 px-1.5 py-0.5 rounded-full shrink-0">
                      {selectedListCount} film
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center shrink-0 text-gray-400">
              <DropdownIcon className="w-4 h-4 text-gray-400" isDropdownOpen={false} />
            </div>
          </button>
        </div>

        {/* MODALE CENTRALE PER LA SCELTA DELLA LISTA */}
        <SelectModalDialog
          isOpen={isListModalOpen}
          onClose={() => setIsListModalOpen(false)}
          title="Liste"
          maxWidthClass="max-w-sm"
          zIndex={10040}
        >
          <div className="space-y-1.5 py-1">
            <button
              type="button"
              onClick={() => {
                handleFieldChange('listId', null);
                setIsListModalOpen(false);
              }}
              className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                filters.listId === null
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
              }`}
            >
              <span className="truncate">Tutti i Film</span>
              {filters.listId === null && (
                <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
              )}
            </button>

            {myLists && myLists.length > 0 ? (
              myLists.map((list) => {
                const isSelected = filters.listId === list.id;
                const count = list.items?.filter((i) => i.media_type === 'movie' || Boolean(i.movie_tmdb_id))?.length ?? list.items?.length ?? 0;
                return (
                  <button
                    key={list.id}
                    type="button"
                    onClick={() => {
                      handleFieldChange('listId', list.id);
                      setIsListModalOpen(false);
                    }}
                    className={`w-full py-3 px-3.5 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]'
                    }`}
                  >
                    <span className="truncate mr-2">{list.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                      >
                        {count} film
                      </span>
                      {isSelected && (
                        <CheckCircleIcon className="w-4 h-4 shrink-0 text-white" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-gray-400">
                Nessuna lista creata.
              </div>
            )}
          </div>
        </SelectModalDialog>

        {/* 2. CARD FILTRI APPROFONDITI */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-3.5 space-y-3.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            Filtri di Catalogo TMDB
          </h4>

          {/* Griglia Genere & Piattaforma */}
          <div className="grid grid-cols-2 gap-3">
            <MobileModalSelect
              label="Genere"
              title="Scegli Genere"
              value={filters.genre || 'all'}
              options={availableGenres}
              onChange={(val: string) => handleFieldChange('genre', val)}
              allLabel="Tutti i generi"
            />

            <MobileModalSelect
              label="Piattaforma"
              title="Scegli Piattaforma"
              value={filters.platform || 'all'}
              options={availablePlatforms}
              onChange={(val: string) => handleFieldChange('platform', val)}
              allLabel="Tutte le piattaforme"
            />
          </div>

          {/* Griglia Anno & Saga */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Anno di Uscita
              </label>
              <div className="relative">
                <DatePicker
                  value={filters.year && filters.year !== 'all' ? `${filters.year}-01-01` : ''}
                  onChange={handleYearChange}
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  selectionMode="year"
                  overlay={true}
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
                      <span className="truncate">
                        {filters.year && filters.year !== 'all' ? filters.year : 'Tutti gli anni'}
                      </span>
                      <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                    </button>
                  }
                />
              </div>
            </div>

            {availableSagas && availableSagas.length > 0 ? (
              <MobileModalSelect
                label="Saga / Franchise"
                title="Scegli Saga"
                value={filters.saga || 'all'}
                options={availableSagas}
                onChange={(val: string) => handleFieldChange('saga', val)}
                allLabel="Tutte le saghe"
              />
            ) : (
              obtainedOptions && obtainedOptions.length > 0 && (
                <MobileModalSelect
                  label="Disponibilità"
                  title="Stato Possesso"
                  value={filters.obtainedFilter || 'all'}
                  options={obtainedOptions}
                  onChange={(val: string) => handleFieldChange('obtainedFilter', val as any)}
                  allLabel="Tutti i film"
                />
              )
            )}
          </div>

          {/* Voto Minimo */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Voto Personale Minimo
            </label>
            <div className="flex gap-2">
              {ratingOptions.map((opt) => {
                const isSelected = (filters.ratings || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRating(opt.value)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordinamento */}
          <div>
            <MobileModalSelect
              label="Criterio di Ordinamento"
              title="Ordina Risultati"
              value={filters.sortBy || 'date_added_desc'}
              options={sortOptions}
              onChange={(val: string) => handleFieldChange('sortBy', val as any)}
            />
          </div>
        </div>
      </div>

      {/* 3. TASTO FISSO IN BASSO PER APPLICARE E CERCARE */}
      <div className="p-3 bg-white border-t border-gray-200/80 shrink-0">
        <button
          type="button"
          onClick={onExecuteSearch}
          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <SearchIcon className="w-4 h-4 text-white" />
          <span>Applica Filtri e Cerca su TMDB</span>
        </button>
      </div>
    </div>
  );
};

export default MobileMovieFilterOptions;
