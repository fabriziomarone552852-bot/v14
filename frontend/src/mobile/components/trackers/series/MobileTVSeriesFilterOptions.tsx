// src/mobile/components/trackers/MobileTVSeriesFilterOptions.tsx
import React from 'react';
import type { MediaList } from '@/types/trackers';
import { SearchIcon } from '@/components/shared/utils/Icons';
import { TrackerMultiYearSelect } from '@/components/trackers/shared/TrackerMultiYearSelect';
import { MobileModalSelect } from '../../common/MobileModalSelect';
import { MobileMultiModalSelect } from '../../common/MobileMultiModalSelect';
import { MobileGenreTriStateModalSelect } from '../../common/MobileGenreTriStateModalSelect';
import { MobileMyPlatformsQuickChip } from '../shared/MobileMyPlatformsQuickChip';
import { MobilePersonalListsSelectCard } from '../shared/MobilePersonalListsSelectCard';
import { useAuth } from '@/context/AuthContext';
import { getPlatformMultiDisplayLabel } from '@/utils/platformFilterUtils';
import type { MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface MobileTVSeriesFilterOptionsProps {
  filters: MediaFilterState;
  hasActiveFilters: boolean;
  myLists?: MediaList[];
  availableGenres: Array<{ value: string; label: string }>;
  availableNetworks: Array<{ value: string; label: string }>;
  ratingOptions: Array<{ value: string; label: string }>;
  tmdbStatusOptions: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  handleFieldChange: <K extends keyof MediaFilterState>(
    field: K,
    value: MediaFilterState[K]
  ) => void;
  toggleRating: (rating: string) => void;
  onExecuteSearch: () => void;
  actionButtonLabel?: string;
  sectionTitle?: string;
  isGlobalSearch?: boolean;
}

export const MobileTVSeriesFilterOptions: React.FC<MobileTVSeriesFilterOptionsProps> = ({
  filters,
  myLists,
  availableGenres,
  availableNetworks,
  ratingOptions,
  tmdbStatusOptions,
  sortOptions,
  handleFieldChange,
  toggleRating,
  onExecuteSearch,
  actionButtonLabel,
  sectionTitle = 'Filtri di Catalogo TMDB',
}) => {
  const { user } = useAuth();
  const { handleScroll, scrollbarClass } = useFadeScrollbar();
  const userProviders = user?.streaming_providers ?? [];
  const platformDisplayOverride = getPlatformMultiDisplayLabel(
    filters.networks,
    userProviders
  );

  const hasSelectedLists = (filters.listIds?.length ?? 0) > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden animate-fadeIn">
      <div
        onScroll={handleScroll}
        className={`flex-1 min-h-0 overflow-y-auto p-3 space-y-3.5 ${scrollbarClass}`}
      >
        {/* 1. SELETTORE LISTE PERSONALI (Multi-selezione O) */}
        <MobilePersonalListsSelectCard
          myLists={myLists}
          selectedListIds={filters.listIds || []}
          onChange={(nextIds) => handleFieldChange('listIds', nextIds)}
          allLabel="Tutte le Serie"
          itemUnitLabel="serie"
          countItemFilter={(list) =>
            list.items?.filter(
              (i) => !i.media_type || i.media_type === 'tv' || Boolean(i.series_tmdb_id)
            ).length ?? 0
          }
        />

        {/* 2. CARD FILTRI APPROFONDITI (TUTTI CON MODALI CENTRALI) */}
        <div className="bg-white border border-gray-200/90 rounded-2xl shadow-2xs p-3.5 space-y-3.5">
          <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
            {sectionTitle}
          </h4>

          {/* Griglia Genere (+ / - + Includi tutti) & Piattaforme (Multi O) */}
          <div className="grid grid-cols-2 gap-3">
            <MobileGenreTriStateModalSelect
              label="Genere"
              title="Genere"
              rule={filters.genres}
              options={availableGenres}
              onChange={(nextRule) => handleFieldChange('genres', nextRule)}
              allLabel="Tutti i generi"
            />

            <MobileMultiModalSelect
              label="Piattaforme"
              title="Scegli Piattaforme"
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

          {/* Griglia Anno di Uscita (Multi O) & Stato Produzione (Multi O) */}
          <div className="grid grid-cols-2 gap-3">
            <TrackerMultiYearSelect
              label="Anno di Uscita"
              years={filters.years || []}
              onChange={(vals) => handleFieldChange('years', vals)}
              allLabel="Tutti gli anni"
              asModal={true}
            />

            <MobileMultiModalSelect
              label="Stato Produzione"
              title="Stato Produzione"
              values={filters.tmdbStatuses || []}
              options={tmdbStatusOptions}
              onChange={(vals) => handleFieldChange('tmdbStatuses', vals)}
              allLabel="Tutti gli stati"
            />
          </div>

          {/* Voto Personale (Multi-selezione O) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
              Voto Personale
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {ratingOptions.map((opt) => {
                const isSelected = (filters.ratings || []).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleRating(opt.value)}
                    className={`flex items-center justify-center min-w-[2.75rem] h-9 px-2.5 rounded-xl text-xs font-extrabold transition-all border shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-2xs font-black'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 active:scale-95'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ordinamento con Modale Centrale */}
          <div className="pt-2 border-t border-gray-100">
            <MobileModalSelect
              label="Ordina per"
              title="Ordina per"
              value={filters.sortBy || 'date_added_desc'}
              options={sortOptions}
              onChange={(val: string) => handleFieldChange('sortBy', val)}
              showAllOption={false}
            />
          </div>
        </div>
      </div>

      {/* 3. PULSANTE AZIONE FISSO IN FONDO */}
      <div className="shrink-0 p-3 pt-2 pb-[max(env(safe-area-inset-bottom,0px),12px)] bg-white/95 backdrop-blur-md border-t border-gray-200 z-20 shadow-xs">
        <button
          type="button"
          onClick={onExecuteSearch}
          className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <SearchIcon className="w-4 h-4 text-white" />
          <span>
            {actionButtonLabel ||
              (hasSelectedLists
                ? filters.keyword?.trim()
                  ? 'Cerca nelle Liste'
                  : 'Mostra Serie delle Liste'
                : 'Cerca su TMDB')}
          </span>
        </button>
      </div>
    </div>
  );
};

export default MobileTVSeriesFilterOptions;
