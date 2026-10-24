// src/components/trackers/SeriesStatsViews/DayCellPostersGrid.tsx
import React from 'react';
import type { DaySeriesPoster } from '@/hooks/trackers/useSeriesWatchCalendar';

export interface DayCellPostersGridProps {
  seriesList: DaySeriesPoster[];
}

const getPosterUrl = (path: string | null) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w200${path}`;
};

export const DayCellPostersGrid: React.FC<DayCellPostersGridProps> = ({ seriesList }) => {
  const posters = seriesList
    .map((s) => getPosterUrl(s.posterPath))
    .filter(Boolean) as string[];

  if (posters.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden rounded-xl pointer-events-none">
      {/* 1 SERIE: Locandina piena */}
      {posters.length === 1 && (
        <img
          src={posters[0]}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {/* 2 SERIE: 2 a metà (colonne affiancate 50% / 50%) */}
      {posters.length === 2 && (
        <div className="grid grid-cols-2 h-full w-full gap-[1px]">
          <img
            src={posters[0]}
            alt=""
            className="w-full h-full object-cover"
          />
          <img
            src={posters[1]}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 3 SERIE: 3 a 3 spicchi (spicchio a tutta altezza a sinistra, 2 impilati a destra) */}
      {posters.length === 3 && (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-[1px]">
          <div className="col-span-1 row-span-2 overflow-hidden">
            <img
              src={posters[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src={posters[1]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="col-span-1 row-span-1 overflow-hidden">
            <img
              src={posters[2]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* 4 O PIÙ SERIE: 4 a quattro semplice (griglia 2x2) */}
      {posters.length >= 4 && (
        <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-[1px]">
          <div className="overflow-hidden">
            <img
              src={posters[0]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <img
              src={posters[1]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <img
              src={posters[2]}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden relative">
            <img
              src={posters[3]}
              alt=""
              className="w-full h-full object-cover"
            />
            {posters.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[9px] font-black text-white">
                +{posters.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sfumatura scura per garantire leggibilità del numero del giorno */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/35" />
    </div>
  );
};

export default DayCellPostersGrid;
