// src/mobile/components/trackers/shared/MobileMediaHorizontalCard.tsx
import React from 'react';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

export interface MobileMediaHorizontalCardProps {
  id: number;
  title: string;
  originalTitle?: string | null;
  overview?: string | null;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string | null;
  isExisting: boolean;
  status?: string | null;
  tmdbStatus?: string | null;
  placeholderIcon?: React.ReactNode;
  onCardClick: () => void;
  onAddClick: (e: React.MouseEvent) => void;
  onToggleTrack?: (isTracked: boolean, e: React.MouseEvent) => void;
}

export const MobileMediaHorizontalCard: React.FC<MobileMediaHorizontalCardProps> = ({
  title,
  posterPath,
  backdropPath,
  releaseDate,
  isExisting,
  status,
  tmdbStatus,
  placeholderIcon,
  onCardClick,
  onAddClick,
  onToggleTrack,
}) => {
  const year = releaseDate ? releaseDate.substring(0, 4) : null;

  // Backdrop dinamico per effetto smerigliato
  const backdropUrl = backdropPath
    ? backdropPath.startsWith('http') || backdropPath.startsWith('data:')
      ? backdropPath
      : backdropPath.startsWith('/uploads')
      ? resolveImageUrl(backdropPath)
      : `https://image.tmdb.org/t/p/w780${backdropPath}`
    : null;

  const posterBorderClass = getMediaBorderClass(status, tmdbStatus, {
    isThick: true,
    fallback: 'border border-gray-200',
  });

  return (
    <div
      onClick={onCardClick}
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

      {/* CONTENUTO DELLA CARD */}
      <div className="relative z-10 flex items-center gap-3 p-2">
        {/* 1. LOCANDINA CON BORDO COLORATO SPESSO PER STATO */}
        <div
          className={`w-14 h-[84px] rounded-xl overflow-hidden bg-gray-100 shrink-0 relative ${posterBorderClass} shadow-2xs`}
        >
          {posterPath ? (
            <img
              src={
                posterPath.startsWith('http') || posterPath.startsWith('data:')
                  ? posterPath
                  : posterPath.startsWith('/uploads')
                  ? resolveImageUrl(posterPath)
                  : `https://image.tmdb.org/t/p/w200${posterPath}`
              }
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              {placeholderIcon || (
                <svg className="w-6 h-6 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* 2. INFORMAZIONI AL CENTRO */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          {year ? (
            <span className="text-xs font-semibold text-gray-600 leading-none">
              {year}
            </span>
          ) : (
            <span className="text-xs font-normal text-gray-400 leading-none">
              Anno n.d.
            </span>
          )}

          <h4
            className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 break-words"
            title={title}
          >
            {title}
          </h4>
        </div>

        {/* 3. TASTO AZIONE RAPIDA A DESTRA */}
        <div className="shrink-0 pl-1 pr-1">
          {isExisting ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleTrack) {
                  onToggleTrack(true, e);
                }
              }}
              className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-90 text-white shadow-xs transition-all flex items-center justify-center cursor-pointer shrink-0"
              title="Presente nel catalogo (tocca per gestire)"
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
                  onToggleTrack(false, e);
                } else {
                  onAddClick(e);
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

export default MobileMediaHorizontalCard;
