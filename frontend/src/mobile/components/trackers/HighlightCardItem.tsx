// src/mobile/components/trackers/HighlightCardItem.tsx
import React from 'react';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TVSeries } from '@/types/trackers';

export interface HighlightCardItemProps {
  type: 'watching' | 'added' | 'completed';
  seriesItem: TVSeries | null;
  onClick: () => void;
}

export const HighlightCardItem: React.FC<HighlightCardItemProps> = ({
  type,
  seriesItem,
  onClick,
}) => {
  const rawPoster = seriesItem?.custom_poster_path
    ? resolveImageUrl(seriesItem.custom_poster_path)
    : seriesItem?.poster_path || seriesItem?.tmdb_series?.poster_path;

  const poster = rawPoster
    ? rawPoster.startsWith('http') || rawPoster.startsWith('data:')
      ? rawPoster
      : rawPoster.startsWith('/uploads')
      ? resolveImageUrl(rawPoster)
      : `https://image.tmdb.org/t/p/w300${rawPoster}`
    : null;

  const renderIcon = () => {
    if (type === 'watching') {
      return (
        <svg className="w-3 h-3 fill-current translate-x-[0.5px]" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      );
    }
    if (type === 'added') {
      return (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    }
    // completed
    return (
      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-2xs border border-gray-200/80 cursor-pointer select-none active:scale-[0.97] transition-all bg-gray-100 shrink-0"
    >
      {/* Immagine Poster */}
      {poster ? (
        <img
          src={poster}
          alt={seriesItem?.title || ''}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-1.5 text-center text-gray-400">
          <TvIcon className="w-5 h-5 opacity-30" />
        </div>
      )}

      {/* Titolo serie SOPRA la card con gradiente nero sfumato (max 2 righe) */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent pt-1 pb-3.5 px-1 z-10 flex items-center justify-center pointer-events-none">
        <span className="text-[9.5px] font-black text-white line-clamp-2 w-full text-center leading-tight drop-shadow-sm">
          {seriesItem?.title || 'Nessuna'}
        </span>
      </div>

      {/* Icona con sfondo blu in basso a destra */}
      <div className="absolute bottom-1 right-1 z-10 w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shadow-md border border-white/30">
        {renderIcon()}
      </div>
    </div>
  );
};

export default HighlightCardItem;
