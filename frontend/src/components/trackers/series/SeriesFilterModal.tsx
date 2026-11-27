import React from 'react';
import { RotateCcw } from 'lucide-react';
import { ArchiveFilterSearchInput } from '@/components/archive/common';
import { PeopleAutocompleteInput } from '@/components/trackers/shared/PeopleAutocompleteInput';
import type { TVSeries, MediaList } from '@/types/trackers';
import { CheckCircleIcon } from '@/components/shared/utils/Icons';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { CustomSelect } from '../shared/TrackerFilterCustomSelect';
import { DesktopMultiSelect } from '../shared/DesktopMultiSelect';
import { DesktopGenreTriStateSelect } from '../shared/DesktopGenreTriStateSelect';
import { TrackerMultiYearSelect } from '../shared/TrackerMultiYearSelect';
import { MobileMyPlatformsQuickChip } from '@/mobile/components/trackers/shared/MobileMyPlatformsQuickChip';
import { useAuth } from '@/context/AuthContext';
import { getPlatformMultiDisplayLabel } from '@/utils/platformFilterUtils';
import { toggleMultiOrValue } from '@/utils/trackerFilterUtils';
import {
  useMediaFilterOptions,
  type MediaFilterState,
} from '@/hooks/trackers/useMediaFilterOptions';

export type { MediaFilterState };

interface SeriesFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MediaFilterState;
  onFilterChange: (newFilters: MediaFilterState) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  series: TVSeries[];
  myLists?: MediaList[];
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
  const { user } = useAuth();
  const userProviders = user?.streaming_providers ?? [];

  const {
    availableGenres,
    availableNetworks,
    ratingOptions,
    tmdbStatusOptions,
    sortOptions,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
  } = useMediaFilterOptions({ series, filters, onFilterChange });

  const platformDisplayOverride = getPlatformMultiDisplayLabel(
    filters.networks,
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
              <span>Tutte le Serie</span>
              {selectedListIds.length === 0 && (
                <CheckCircleIcon className="w-4 h-4 text-blue-600 shrink-0" />
              )}
            </button>
            {myLists.map((list) => {
              const isSelected = selectedListIds.includes(list.id);
              const tvCount =
                list.items?.filter(
                  (item) => !item.media_type || item.media_type === 'tv' || Boolean(item.series_tmdb_id)
                ).length ?? 0;
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
                      {tvCount}
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
      title="Ricerca & Filtri Serie TV"
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
            <span className="text-xs text-blue-700/80">Cerca anche tra le serie non in lista</span>
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
          label="Cerca per Nome"
          value={filters.keyword || ''}
          onChange={(val) => handleFieldChange('keyword', val)}
          placeholder="Es. Breaking Bad..."
        />

        <PeopleAutocompleteInput
          label="Attori / Creatori / Registi"
          value={filters.people || ''}
          mode={filters.peopleMode || 'AND'}
          onChange={(val) => handleFieldChange('people', val)}
          onModeChange={(nextMode) => handleFieldChange('peopleMode', nextMode)}
          showLocalHint={!filters.globalSearch}
          placeholder="Es. Vince Gilligan, Bryan Cranston..."
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
            label="Piattaforme"
            values={filters.networks || []}
            options={availableNetworks}
            onChange={(vals) => handleFieldChange('networks', vals)}
            allLabel="Tutte le piattaforme"
            displayValueOverride={platformDisplayOverride}
            headerAction={
              <MobileMyPlatformsQuickChip
                currentValues={filters.networks || []}
                availableOptions={availableNetworks}
                onSelectValues={(vals) => handleFieldChange('networks', vals)}
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
            label="Stato Produzione"
            values={filters.tmdbStatuses || []}
            options={tmdbStatusOptions}
            onChange={(vals) => handleFieldChange('tmdbStatuses', vals)}
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

        <div className="pt-2 border-t border-gray-100">
          <CustomSelect
            label="Ordina per"
            value={filters.sortBy || 'date_added_desc'}
            options={sortOptions}
            onChange={(val: string) => handleFieldChange('sortBy', val)}
            allLabel="Aggiunte di recente"
          />
        </div>
      </div>
    </BaseModal>
  );
};

export default SeriesFilterModal;
