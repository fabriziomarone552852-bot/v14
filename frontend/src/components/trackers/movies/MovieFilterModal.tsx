import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ArchiveFilterSearchInput } from '@/components/archive/common';
import type { Movie, MovieFilters } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { CheckCircleIcon } from '@/components/shared/utils/Icons';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CustomSelect } from '@/components/trackers/shared/TrackerFilterCustomSelect';
import { DesktopMultiSelect } from '@/components/trackers/shared/DesktopMultiSelect';
import { DesktopGenreTriStateSelect } from '@/components/trackers/shared/DesktopGenreTriStateSelect';
import { TrackerMultiYearSelect } from '@/components/trackers/shared/TrackerMultiYearSelect';
import { MobileMyPlatformsQuickChip } from '@/mobile/components/trackers/shared/MobileMyPlatformsQuickChip';
import { useAuth } from '@/context/AuthContext';
import { getPlatformMultiDisplayLabel } from '@/utils/platformFilterUtils';
import { toggleMultiOrValue } from '@/utils/trackerFilterUtils';
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
  const { user } = useAuth();
  const userProviders = user?.streaming_providers ?? [];

  const {
    availableGenres,
    availablePlatforms,
    availableSagas,
    ratingOptions,
    sortOptions,
    obtainedOptions,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
  } = useMovieFilterOptions({ movies, filters, onFilterChange });

  const platformDisplayOverride = getPlatformMultiDisplayLabel(
    filters.platforms,
    userProviders
  );

  const selectedListIds = filters.listIds || [];

  const SidePanel = (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
        <h4 className="text-sm font-extrabold text-gray-800 uppercase tracking-wider">
          Le Mie Liste
        </h4>
        {selectedListIds.length > 0 && (
          <button
            type="button"
            onClick={() => handleFieldChange('listIds', [])}
            className="text-[11px] font-extrabold text-red-500 hover:text-red-700 cursor-pointer"
          >
            Azzera
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2 max-h-[60vh]">
        {!myLists || myLists.length === 0 ? (
          <div className="text-center py-4 text-xs text-gray-400">Nessuna lista creata.</div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => handleFieldChange('listIds', [])}
              className={`text-left px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                selectedListIds.length === 0
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>Tutti i Film</span>
              {selectedListIds.length === 0 && (
                <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </button>
            {myLists.map((list) => {
              const isSelected = selectedListIds.includes(list.id);
              const movieItemsCount =
                list.items?.filter((item) => item.movie_tmdb_id != null).length ?? 0;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() =>
                    handleFieldChange('listIds', toggleMultiOrValue(selectedListIds, list.id))
                  }
                  className={`text-left flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 font-medium border border-transparent'
                  }`}
                >
                  <span className="truncate">{list.name}</span>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full shadow-sm">
                      {movieItemsCount}
                    </span>
                    {isSelected && (
                      <CheckCircleIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    )}
                  </div>
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
          <DesktopGenreTriStateSelect
            label="Genere"
            rule={filters.genres}
            options={availableGenres}
            onChange={(nextRule) => handleFieldChange('genres', nextRule)}
            allLabel="Tutti i generi"
          />

          <DesktopMultiSelect
            label="Piattaforma"
            values={filters.platforms || []}
            options={availablePlatforms}
            onChange={(vals) => handleFieldChange('platforms', vals)}
            allLabel="Tutte le piattaforme"
            displayValueOverride={platformDisplayOverride}
            headerAction={
              <MobileMyPlatformsQuickChip
                currentValues={filters.platforms || []}
                availableOptions={availablePlatforms}
                onSelectValues={(vals) => handleFieldChange('platforms', vals)}
              />
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TrackerMultiYearSelect
            label="Anno di Uscita"
            years={filters.years || []}
            onChange={(vals) => handleFieldChange('years', vals)}
            allLabel="Tutti gli anni"
            asModal={false}
          />

          <DesktopMultiSelect
            label="Saga / Collezione"
            values={filters.sagas || []}
            options={availableSagas}
            onChange={(vals) => handleFieldChange('sagas', vals)}
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
