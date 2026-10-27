import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ArchiveFilterSearchInput } from '@/components/archive/common';
import type { Movie, MovieFilters } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { DropdownIcon } from '@/components/shared/utils/Icons';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CustomSelect } from '@/components/trackers/MediaFilterCustomSelect';
import { useMovieFilterOptions } from '@/hooks/trackers/useMovieFilterOptions';

interface MovieFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MovieFilters;
  onFilterChange: (newFilters: MovieFilters) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  movies: Movie[];
  myLists?: MediaList[];
}

export const MovieFilterModal: React.FC<MovieFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  hasActiveFilters,
  movies,
  myLists,
}) => {
  const {
    availableGenres,
    availablePlatforms,
    availableSagas,
    ratingOptions,
    sortOptions,
    obtainedOptions,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
    handleYearChange,
  } = useMovieFilterOptions({ movies, filters, onFilterChange });

  const SidePanel = (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">Le Mie Liste</h4>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 max-h-[60vh]">
        {!myLists || myLists.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400">Nessuna lista creata.</div>
        ) : (
          <>
            <button
              onClick={() => handleFieldChange('listId', null)}
              className={`text-left px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                filters.listId === null ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Tutti i Film
            </button>
            {myLists.map((list) => {
              const movieItemsCount = list.items?.filter((item) => item.movie_tmdb_id != null).length ?? 0;
              return (
                <button
                  key={list.id}
                  onClick={() => handleFieldChange('listId', list.id)}
                  className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    filters.listId === list.id
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                  }`}
                >
                  <span className="truncate">{list.name}</span>
                  <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full ml-2 shrink-0 shadow-sm">
                    {movieItemsCount}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  const headerActions = hasActiveFilters ? (
    <button
      type="button"
      onClick={onReset}
      title="Ripristina tutti i filtri"
      aria-label="Ripristina filtri"
      className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all active:scale-90 cursor-pointer"
    >
      <RotateCcw className="w-4 h-4" />
    </button>
  ) : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ricerca & Filtri Film"
      maxWidthClass="max-w-md"
      sidePanel={SidePanel}
      headerActions={headerActions}
      footer={null}
      overflowVisible={true}
    >
      <div className="space-y-4">
        {/* Toggle Ricerca Globale TMDB */}
        <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-xl mb-4">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-blue-900">🌐 Cerca in tutto TMDB</span>
            <span className="text-xs text-blue-700/80">Cerca anche tra i film non in lista</span>
          </div>
          <button
            type="button"
            onClick={handleToggleGlobalSearch}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              filters.globalSearch ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                filters.globalSearch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <ArchiveFilterSearchInput
          label="Cerca per Titolo"
          value={filters.keyword || ''}
          onChange={(val) => handleFieldChange('keyword', val)}
          placeholder="Es. Inception, Interstellar..."
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
            label="Piattaforma"
            value={filters.platform || 'all'}
            options={availablePlatforms}
            onChange={(val: string) => handleFieldChange('platform', val)}
            allLabel="Tutte le piattaforme"
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
                onChange={handleYearChange}
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
                    <span className="truncate">
                      {filters.year && filters.year !== 'all' ? filters.year : 'Tutti gli anni'}
                    </span>
                    <DropdownIcon className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </button>
                }
              />
            </div>
          </div>

          <CustomSelect
            label="Saga / Collezione"
            value={filters.saga || 'all'}
            options={availableSagas}
            onChange={(val: string) => handleFieldChange('saga', val)}
            allLabel="Tutte le saghe"
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
                  className={`flex items-center justify-center min-w-[3rem] h-10 px-3 rounded-full text-base font-bold transition-all border-2 shrink-0 cursor-pointer ${
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

        <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CustomSelect
            label="Disponibilità"
            value={filters.obtainedFilter || 'all'}
            options={obtainedOptions}
            onChange={(val: string) =>
              handleFieldChange('obtainedFilter', val as 'all' | 'obtained' | 'not_obtained')
            }
            allLabel="Tutti i film"
          />

          <CustomSelect
            label="Ordina per"
            value={filters.sortBy || 'date_added_desc'}
            options={sortOptions}
            onChange={(val: string) => handleFieldChange('sortBy', val)}
            allLabel="Aggiunti di recente"
          />
        </div>
      </div>
    </BaseModal>
  );
};
