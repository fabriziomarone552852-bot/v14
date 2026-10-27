// src/mobile/components/trackers/shared/MobileTrackerDashboardBanners.tsx
import React from 'react';
import type { MediaList, TVSeries } from '@/types/trackers';
import type { Movie } from '@/types/movies';
import { ListCollagePoster } from '../ListCollagePoster';

export interface DashboardBannerItem {
  id: number | string;
  title: string;
  posterUrl?: string | null;
}

export interface MobileTrackerDashboardBannersProps {
  catalogTitle: string;
  catalogItems: DashboardBannerItem[];
  myLists?: MediaList[];
  seriesForLists?: TVSeries[];
  moviesForLists?: Movie[];
  emptyCatalogMessage?: string;
  emptyListsMessage?: string;
  onOpenCatalog: () => void;
  onOpenPersonalLists: (list?: MediaList) => void;
  placeholderIcon?: React.ReactNode;
}

export const MobileTrackerDashboardBanners: React.FC<MobileTrackerDashboardBannersProps> = ({
  catalogTitle,
  catalogItems,
  myLists,
  seriesForLists,
  moviesForLists,
  emptyCatalogMessage = 'Nessun elemento ancora a catalogo',
  emptyListsMessage = 'Nessuna lista creata',
  onOpenCatalog,
  onOpenPersonalLists,
  placeholderIcon,
}) => {
  const displayItems = catalogItems.slice(0, 4);
  const displayLists = (myLists || []).slice(0, 4);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 pt-0.5">
      {/* BANNER 1: CATALOGO (I TUOI FILM / LE TUE SERIE) */}
      <div
        onClick={onOpenCatalog}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-all hover:bg-gray-50/60 select-none"
      >
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
            {catalogTitle}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full pt-1 flex-1 min-h-0 items-center">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <div
                key={item.id}
                className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-gray-100 border border-gray-200/80 shadow-2xs pointer-events-none shrink-0"
                title={item.title}
              >
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center text-gray-400">
                    {placeholderIcon || (
                      <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span className="text-[8px] font-bold text-gray-400 truncate w-full mt-0.5">
                      {item.title}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center text-center text-xs text-gray-400 italic py-2">
              {emptyCatalogMessage}
            </div>
          )}
        </div>
      </div>

      {/* BANNER 2: LE TUE LISTE */}
      <div
        onClick={() => onOpenPersonalLists()}
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-2.5 sm:p-3 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-all hover:bg-gray-50/60 select-none"
      >
        <div className="flex items-center justify-between shrink-0">
          <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
            LE TUE LISTE
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 w-full pt-1 flex-1 min-h-0 items-center">
          {displayLists.length > 0 ? (
            displayLists.map((list) => (
              <ListCollagePoster
                key={list.id}
                list={list}
                series={seriesForLists}
                movies={moviesForLists}
              />
            ))
          ) : (
            <div className="col-span-4 flex items-center justify-center text-center text-xs text-gray-400 italic py-2">
              {emptyListsMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileTrackerDashboardBanners;
