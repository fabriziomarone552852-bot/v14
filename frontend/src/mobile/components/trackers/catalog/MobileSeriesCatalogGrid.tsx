import React, { useMemo } from 'react';
import type { TVSeries } from '@/types/trackers';
import { TvIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  normalizeMediaStatus,
  getMediaBorderClass,
} from '@/utils/mediaStatusTheme';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface MobileSeriesCatalogGridProps {
  series: TVSeries[];
  onSelectSeries: (series: TVSeries) => void;
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
  emptyMessage?: string;
  resetFiltersLabel?: string;
  selectedSeriesTmdbIds?: number[];
  onToggleSelectSeries?: (tmdbId: number) => void;
}

interface CatalogSection {
  id: string;
  title: string;
  items: TVSeries[];
}

interface CatalogGridItemProps {
  item: TVSeries;
  onSelectSeries: (series: TVSeries) => void;
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onToggleSelectSeries?: (tmdbId: number) => void;
}

const CatalogGridItem: React.FC<CatalogGridItemProps> = ({
  item,
  onSelectSeries,
  isSelected = false,
  isSelectionActive = false,
  onToggleSelectSeries,
}) => {
  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: () => {
      onToggleSelectSeries?.(item.tmdb_id);
    },
    onClick: () => {
      if (isSelectionActive && onToggleSelectSeries) {
        onToggleSelectSeries(item.tmdb_id);
      } else {
        onSelectSeries(item);
      }
    },
  });

  const poster = item.custom_poster_path
    ? resolveImageUrl(item.custom_poster_path)
    : item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : null;

  const borderClass = getMediaBorderClass(item.status, item.tmdb_status, {
    isThick: true,
  });

  return (
    <div
      {...longPressHandlers}
      className={`relative aspect-[2/3] rounded-xl overflow-hidden shadow-xs bg-gray-900 ${borderClass} active:scale-[0.96] transition-all duration-150 cursor-pointer group flex items-center justify-center select-none ${
        isSelected ? 'ring-3 ring-blue-500 shadow-blue-500/30' : ''
      }`}
      title={item.title}
    >
      {poster ? (
        <img
          src={poster}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        /* Fallback sobrio per serie prive di locandina */
        <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
          <TvIcon className="w-6 h-6 text-gray-500 mb-1" />
          <span className="text-[11px] font-black line-clamp-2 leading-tight text-white/90">
            {item.title}
          </span>
          {item.first_air_date && (
            <span className="text-[9px] font-semibold text-gray-400 mt-1">
              {item.first_air_date.substring(0, 4)}
            </span>
          )}
        </div>
      )}

      {/* Alone blu e spunta di selezione */}
      {isSelected && (
        <>
          <div className="absolute inset-0 bg-blue-600/30 pointer-events-none transition-opacity" />
          <div className="absolute bottom-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
            <CheckCircleIcon className="w-4 h-4" />
          </div>
        </>
      )}
    </div>
  );
};

export const MobileSeriesCatalogGrid: React.FC<MobileSeriesCatalogGridProps> = ({
  series,
  onSelectSeries,
  hasActiveFilters,
  onResetFilters,
  emptyMessage = 'Nessuna serie presente nel catalogo',
  resetFiltersLabel = 'Azzera tutti i filtri',
  selectedSeriesTmdbIds = [],
  onToggleSelectSeries,
}) => {
  const { handleScroll, scrollbarClass } = useFadeScrollbar();
  // Raggruppamento delle serie nelle 4 aree canoniche richieste:
  // 1. In visione (gialli)
  // 2. In lista (grigi)
  // 3. In attesa (viola)
  // 4. Completate (verdi)
  const sections: CatalogSection[] = useMemo(() => {
    const inVisione: TVSeries[] = [];
    const inLista: TVSeries[] = [];
    const inAttesa: TVSeries[] = [];
    const completate: TVSeries[] = [];

    series.forEach((item) => {
      const st = normalizeMediaStatus(item.status, item.tmdb_status);
      if (st === 'watching') {
        inVisione.push(item);
      } else if (st === 'waiting') {
        inAttesa.push(item);
      } else if (st === 'completed') {
        completate.push(item);
      } else {
        // 'to_watch', 'dropped', 'on_hold', 'untracked' confluiscono in lista
        inLista.push(item);
      }
    });

    return [
      { id: 'in_visione', title: 'In visione', items: inVisione },
      { id: 'in_lista', title: 'In lista', items: inLista },
      { id: 'in_attesa', title: 'In attesa', items: inAttesa },
      { id: 'completate', title: 'Completate', items: completate },
    ];
  }, [series]);

  // Se non ci sono serie in nessuna sezione
  const totalCount = series.length;
  if (totalCount === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <EmptyState
          message={
            hasActiveFilters
              ? 'Nessuna serie corrisponde ai filtri selezionati'
              : emptyMessage
          }
          icon={<TvIcon className="w-12 h-12 text-gray-300 mb-2" />}
        />
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
          >
            {resetFiltersLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onScroll={handleScroll}
      className={`flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-3 pt-1 pb-16 animate-fadeIn ${scrollbarClass}`}
    >
      {sections.map((sec) => {
        if (sec.items.length === 0) return null;

        return (
          <div key={sec.id} className="mb-6 last:mb-2">
            {/* PILLOLA CENTRALE GRIGIA CON NOME SEZIONE */}
            <div className="flex items-center justify-center my-3.5">
              <span className="px-4 py-1 rounded-full text-[11px] font-black tracking-wide text-gray-700 bg-gray-200 border border-gray-300/70 shadow-2xs uppercase select-none">
                {sec.title}
              </span>
            </div>

            {/* GRIGLIA A 3 COLONNE DEDICATA A QUESTA SEZIONE */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 content-start">
              {sec.items.map((item) => {
                const isSelected = selectedSeriesTmdbIds.includes(item.tmdb_id);
                const isSelectionActive = selectedSeriesTmdbIds.length > 0;
                return (
                  <CatalogGridItem
                    key={item.id || item.tmdb_id}
                    item={item}
                    onSelectSeries={onSelectSeries}
                    isSelected={isSelected}
                    isSelectionActive={isSelectionActive}
                    onToggleSelectSeries={onToggleSelectSeries}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileSeriesCatalogGrid;
