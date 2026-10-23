import React, { useMemo } from 'react';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TVSeries, MediaList } from '@/types/trackers';
import { ListCollagePoster } from './ListCollagePoster';

export interface MobileSeriesDashboardBannersProps {
  series: TVSeries[] | undefined;
  myLists: MediaList[] | undefined;
  onOpenSeriesDetail?: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenCatalog: () => void;
  onOpenPersonalLists: (list?: MediaList) => void;
}

export const MobileSeriesDashboardBanners: React.FC<MobileSeriesDashboardBannersProps> = ({
  series,
  myLists,
  onOpenCatalog,
  onOpenPersonalLists,
}) => {
  // 1. Ultime serie aggiunte nel catalogo in ordine cronologico decrescente (a prescindere dallo status)
  const latestAddedSeries = useMemo(() => {
    if (!series || series.length === 0) return [];
    return [...series].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [series]);

  const displaySeries = latestAddedSeries.slice(0, 4);

  // 2. Ultime liste personali
  const displayLists = (myLists || []).slice(0, 4);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 pt-0.5">
      {/* BANNER 1: LE TUE SERIE */}
      <div
        onClick={onOpenCatalog}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-all hover:bg-gray-50/60 select-none"
      >
        {/* Header con titolo in alto a sinistra */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
            LE TUE SERIE
          </span>
        </div>

        {/* Sotto: Locandine ultime serie aggiunte al catalogo in ordine cronologico */}
        <div className="grid grid-cols-4 gap-2 w-full pt-1 flex-1 min-h-0 items-center">
          {displaySeries.length > 0 ? (
            displaySeries.map((s) => {
              const rawPoster = s.custom_poster_path
                ? resolveImageUrl(s.custom_poster_path)
                : s.poster_path || s.tmdb_series?.poster_path;
              const poster = rawPoster
                ? rawPoster.startsWith('http') || rawPoster.startsWith('data:')
                  ? rawPoster
                  : rawPoster.startsWith('/uploads')
                  ? resolveImageUrl(rawPoster)
                  : `https://image.tmdb.org/t/p/w200${rawPoster}`
                : null;

              return (
                <div
                  key={s.tmdb_id}
                  className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs pointer-events-none shrink-0"
                  title={s.title}
                >
                  {poster ? (
                    <img
                      src={poster}
                      alt={s.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-gray-400">
                      <TvIcon className="w-4 h-4 opacity-40" />
                      <span className="text-[8px] font-bold text-gray-400 truncate w-full mt-0.5">
                        {s.title}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-4 flex items-center justify-center text-center text-xs text-gray-400 italic py-2">
              Nessuna serie ancora a catalogo
            </div>
          )}
        </div>
      </div>

      {/* BANNER 2: LE TUE LISTE */}
      <div
        onClick={() => onOpenPersonalLists()}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-all hover:bg-gray-50/60 select-none"
      >
        {/* Header con titolo in alto a sinistra */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
            LE TUE LISTE
          </span>
        </div>

        {/* Sotto: Collage delle ultime serie aggiunte (fino a 4) con nome lista in overlay stile highlight */}
        <div className="grid grid-cols-4 gap-2 w-full pt-1 flex-1 min-h-0 items-center">
          {displayLists.length > 0 ? (
            displayLists.map((list) => (
              <ListCollagePoster
                key={list.id}
                list={list}
                series={series}
              />
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center text-center text-xs text-gray-400 italic py-2">
              Nessuna lista creata
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSeriesDashboardBanners;
