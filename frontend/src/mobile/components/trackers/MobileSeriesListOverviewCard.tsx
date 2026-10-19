import React, { useMemo } from 'react';
import type { MediaList, TVSeries } from '@/types/trackers';
import type { CatalogStatusTab } from './catalog/MobileSeriesCatalogHeader';
import { TvIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import {
  normalizeMediaStatus,
  getMediaBorderClass,
} from '@/utils/mediaStatusTheme';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface MobileSeriesListOverviewCardProps {
  list: MediaList;
  series: TVSeries[];
  activeTab: CatalogStatusTab;
  onSelectList: (list: MediaList) => void;
  onSelectSeries?: (series: TVSeries | Partial<TVSeries>) => void;
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onToggleSelect?: (listId: number) => void;
}

export const MobileSeriesListOverviewCard: React.FC<MobileSeriesListOverviewCardProps> = ({
  list,
  series,
  activeTab,
  onSelectList,
  onSelectSeries: _onSelectSeries,
  isSelected = false,
  isSelectionActive = false,
  onToggleSelect,
}) => {
  // 1. Serie ordinate dall'ultima aggiunta a sinistra e a seguire in senso cronologico
  const sortedItems = useMemo(() => {
    if (!list.items || list.items.length === 0) return [];
    return [...list.items].sort((a, b) => {
      const timeA = a.added_at ? new Date(a.added_at).getTime() : a.id || 0;
      const timeB = b.added_at ? new Date(b.added_at).getTime() : b.id || 0;
      return timeB - timeA;
    });
  }, [list.items]);

  // 2. Filtro attivo dell'occhio (Tutte, In corso, Serie viste, Non viste)
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return sortedItems;

    return sortedItems.filter((item) => {
      const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
      const status = existing?.status || item.series?.status;
      const tmdbStatus = existing?.tmdb_status;
      const normalized = normalizeMediaStatus(status, tmdbStatus);

      if (activeTab === 'watching') {
        return normalized === 'watching';
      }
      if (activeTab === 'waiting') {
        return normalized === 'waiting';
      }
      if (activeTab === 'completed') {
        return normalized === 'completed';
      }
      if (activeTab === 'to_watch') {
        return (
          normalized === 'to_watch' ||
          normalized === 'dropped' ||
          normalized === 'on_hold' ||
          normalized === 'untracked'
        );
      }
      return true;
    });
  }, [sortedItems, activeTab, series]);

  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: () => {
      onToggleSelect?.(list.id);
    },
    onClick: () => {
      if (isSelectionActive) {
        onToggleSelect?.(list.id);
      } else {
        onSelectList(list);
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`w-full bg-white rounded-2xl border shadow-2xs p-3 sm:p-3.5 flex flex-col gap-2 cursor-pointer transition-all select-none group relative ${
        isSelected
          ? 'ring-2 ring-blue-500 border-blue-400 bg-blue-50/30'
          : 'border-gray-200/90 hover:bg-gray-50/70 active:scale-[0.99]'
      }`}
    >
      {/* IN ALTO: TITOLO DELLA LISTA ALLINEATO A SINISTRA & INDICATORE SELEZIONE */}
      <div className="flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-black text-gray-900 truncate">
            {list.name}
          </h3>
          <span className="text-[10px] font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200/60 shrink-0">
            {filteredItems.length}
          </span>
        </div>

        {isSelectionActive && (
          <div className="shrink-0 flex items-center justify-center">
            {isSelected ? (
              <CheckCircleIcon className="w-5 h-5 text-blue-600" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
          </div>
        )}
      </div>

      {/* SOTTO: LE SERIE DALL'ULTIMA AGGIUNTA A SINISTRA (NON CLICCABILI SINGOLARMENTE) */}
      <div className="w-full min-h-[96px] sm:min-h-[112px] flex items-center">
        {filteredItems.length === 0 ? (
          <div className="w-full py-5 text-center text-xs text-gray-400 italic">
            {list.items && list.items.length > 0
              ? 'Nessuna serie corrispondente al filtro'
              : 'Nessuna serie salvata in questa lista'}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 w-full pointer-events-none">
            {filteredItems.map((item) => {
              const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
              const title = existing?.title || item.series?.title || 'Serie TV';
              const rawPoster = existing?.custom_poster_path
                ? resolveImageUrl(existing.custom_poster_path)
                : existing?.poster_path
                ? `https://image.tmdb.org/t/p/w200${existing.poster_path}`
                : item.series?.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.series.poster_path}`
                : null;

              const borderClass = getMediaBorderClass(
                existing?.status || item.series?.status,
                existing?.tmdb_status,
                { isThick: true }
              );

              return (
                <div
                  key={item.id}
                  className={`w-16 h-24 sm:w-20 sm:h-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden bg-gray-900 shadow-2xs ${borderClass} relative flex items-center justify-center`}
                  title={title}
                >
                  {rawPoster ? (
                    <img
                      src={rawPoster}
                      alt={title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full p-1 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
                      <TvIcon className="w-4 h-4 text-gray-500 mb-0.5" />
                      <span className="text-[9px] font-black line-clamp-2 leading-tight text-white/90">
                        {title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSeriesListOverviewCard;
