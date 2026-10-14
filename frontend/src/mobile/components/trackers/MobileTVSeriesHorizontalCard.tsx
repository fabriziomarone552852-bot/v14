// src/mobile/components/trackers/MobileTVSeriesHorizontalCard.tsx
import React from 'react';
import type { TVSeries, TMDBSeriesSearchResult } from '@/types/trackers';
import { TvIcon } from '@/components/shared/utils/Icons';

export interface MobileTVSeriesHorizontalCardProps {
  result: TMDBSeriesSearchResult;
  existingSeries?: TVSeries;
  onCardClick: (mockSeries: Partial<TVSeries>) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
}

export const MobileTVSeriesHorizontalCard: React.FC<MobileTVSeriesHorizontalCardProps> = ({
  result,
  existingSeries,
  onCardClick,
  onAddClick,
}) => {
  const year = result.first_air_date ? result.first_air_date.substring(0, 4) : null;

  const handleClick = () => {
    const mockSeries = {
      tmdb_series: {
        tmdb_id: result.id,
        title: result.name,
        original_title: result.original_name,
        overview: result.overview,
        poster_path: result.poster_path,
        backdrop_path: result.backdrop_path,
        first_air_date: result.first_air_date,
      },
    };
    onCardClick((existingSeries || mockSeries) as Partial<TVSeries>);
  };

  const getPosterBorderClass = () => {
    if (!existingSeries) return 'border border-gray-200';
    if (existingSeries.status === 'watching') return 'border-[2.5px] border-yellow-400';
    if (existingSeries.status === 'watched' || existingSeries.status === 'completed') {
      return existingSeries.tmdb_status === 'Returning Series'
        ? 'border-[2.5px] border-purple-500'
        : 'border-[2.5px] border-green-500';
    }
    return 'border-[2.5px] border-blue-400';
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-3 p-2 bg-white border border-gray-200/90 rounded-2xl shadow-2xs hover:shadow-xs hover:border-blue-200 active:bg-gray-50/80 transition-all cursor-pointer select-none group"
    >
      {/* 1. LOCANDINA PICCOLA A SINISTRA CON BORDO COLORATO SPESSO PER STATO */}
      <div
        className={`w-14 h-[84px] rounded-xl overflow-hidden bg-gray-100 shrink-0 relative ${getPosterBorderClass()} shadow-2xs`}
      >
        {result.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w200${result.poster_path}`}
            alt={result.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <TvIcon className="w-6 h-6 opacity-40" />
          </div>
        )}
      </div>

      {/* 2. INFORMAZIONI AL CENTRO: ANNO SEMPLICE SOPRA, NOME SOTTO (MAX 2 RIGHE) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        {/* Anno di rilascio semplice senza badge né contorno */}
        {year ? (
          <span className="text-xs font-semibold text-gray-500 leading-none">
            {year}
          </span>
        ) : (
          <span className="text-xs font-normal text-gray-400 leading-none">
            Anno n.d.
          </span>
        )}

        {/* Nome della serie (massimo 2 righe, troncato oltre) */}
        <h4
          className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 break-words"
          title={result.name}
        >
          {result.name}
        </h4>
      </div>

      {/* 3. TASTO AZIONE A DESTRA: AGGIUNGI (+) O SPUNTA SE GIA IN LIBRERIA */}
      <div className="shrink-0 pl-1 pr-1">
        {existingSeries ? (
          <div
            className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-2xs"
            title="Già nella tua libreria"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddClick(result.id, e);
            }}
            className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
            title="Aggiungi alla libreria"
            aria-label="Aggiungi serie"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileTVSeriesHorizontalCard;
