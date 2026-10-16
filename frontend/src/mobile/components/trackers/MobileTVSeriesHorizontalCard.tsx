// src/mobile/components/trackers/MobileTVSeriesHorizontalCard.tsx
import React from 'react';
import type { TVSeries, TMDBSeriesSearchResult } from '@/types/trackers';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

export interface MobileTVSeriesHorizontalCardProps {
  result: TMDBSeriesSearchResult;
  existingSeries?: TVSeries;
  onCardClick: (mockSeries: Partial<TVSeries>) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
}

export const MobileTVSeriesHorizontalCard: React.FC<MobileTVSeriesHorizontalCardProps> = ({
  result,
  existingSeries,
  onCardClick,
  onAddClick,
  onToggleTrack,
}) => {
  const year = result.first_air_date ? result.first_air_date.substring(0, 4) : null;

  // Backdrop dinamico per effetto smerigliato (da serie esistente o risultato TMDB)
  const rawBackdrop = existingSeries?.backdrop_path || existingSeries?.tmdb_series?.backdrop_path || result.backdrop_path;
  const backdropUrl = rawBackdrop
    ? rawBackdrop.startsWith('http') || rawBackdrop.startsWith('data:')
      ? rawBackdrop
      : rawBackdrop.startsWith('/uploads')
      ? resolveImageUrl(rawBackdrop)
      : `https://image.tmdb.org/t/p/w780${rawBackdrop}`
    : null;

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

  const posterBorderClass = getMediaBorderClass(
    existingSeries?.status,
    existingSeries?.tmdb_status,
    { isThick: true, fallback: 'border border-gray-200' }
  );

  return (
    <div
      onClick={handleClick}
      className="relative overflow-hidden rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-xs hover:border-blue-200 active:scale-[0.99] transition-all cursor-pointer select-none group bg-white"
    >
      {/* SFONDO DINAMICO CON IMMAGINE BACKDROP NITIDA E GRADIENTE DI CONTRASTO */}
      {backdropUrl && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/70" />
        </div>
      )}

      {/* CONTENUTO DELLA CARD (Z-10 PER ESSERE SOPRA IL BACKDROP) */}
      <div className="relative z-10 flex items-center gap-3 p-2">
        {/* 1. LOCANDINA PICCOLA A SINISTRA CON BORDO COLORATO SPESSO PER STATO */}
        <div
          className={`w-14 h-[84px] rounded-xl overflow-hidden bg-gray-100 shrink-0 relative ${posterBorderClass} shadow-2xs`}
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
            <span className="text-xs font-semibold text-gray-600 leading-none">
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

        {/* 3. TASTO AZIONE A DESTRA: AGGIUNGI (+) O SPUNTA BLU SE GIA IN CATALOGO */}
        <div className="shrink-0 pl-1 pr-1">
          {existingSeries ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleTrack) {
                  onToggleTrack(result.id, true, e);
                }
              }}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-90 text-white shadow-xs transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Presente nel catalogo (tocca per rimuovere)"
              aria-label="Presente nel catalogo"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleTrack) {
                  onToggleTrack(result.id, false, e);
                } else {
                  onAddClick(result.id, e);
                }
              }}
              className="w-8 h-8 rounded-xl bg-white/90 backdrop-blur-xs border border-gray-200/80 text-gray-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 active:scale-90 transition-all flex items-center justify-center cursor-pointer shadow-2xs shrink-0"
              title="Aggiungi al catalogo"
              aria-label="Aggiungi al catalogo"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileTVSeriesHorizontalCard;
