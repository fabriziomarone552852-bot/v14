// src/mobile/components/trackers/detail/MobileMovieSagaTab.tsx
import React from 'react';
import type {
  MovieCollectionDetail,
  MovieCollectionPart,
  MovieDetailTarget,
} from '@/types/movies';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import { LoadingIcon } from '@/components/shared/utils/Icons';

export interface MobileMovieSagaTabProps {
  collection?: MovieCollectionDetail | null;
  currentMovieId?: number;
  isLoading?: boolean;
  onSelectMovie: (movie: MovieDetailTarget) => void;
  onQuickAdd: (tmdbId: number) => void;
}

export const MobileMovieSagaTab: React.FC<MobileMovieSagaTabProps> = ({
  collection,
  currentMovieId,
  isLoading = false,
  onSelectMovie,
  onQuickAdd,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
        <LoadingIcon className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-bold">Caricamento saga...</span>
      </div>
    );
  }

  if (!collection || !collection.parts || collection.parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h4 className="text-sm font-bold text-gray-800">Nessuna Collezione</h4>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          Questo film è un&apos;opera singola e non fa parte di una saga.
        </p>
      </div>
    );
  }

  const sortedParts = [...collection.parts].sort((a, b) => {
    return (a.release_date || '').localeCompare(b.release_date || '');
  });

  const watchedCount = sortedParts.filter((p) => p.is_watched).length;
  const progressPercent = Math.round((watchedCount / sortedParts.length) * 100);

  return (
    <div className="flex flex-col gap-4 pb-6 animate-fadeIn select-none">
      {/* 1. BANNER DELLA SAGA */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white p-4 shadow-sm flex items-center gap-3.5">
        {collection.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w200${collection.poster_path}`}
            alt={collection.name}
            className="w-14 h-20 object-cover rounded-xl shadow-md shrink-0 border border-white/20"
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Saga
          </span>
          <h3 className="text-base font-black text-white leading-tight drop-shadow-sm truncate">
            {collection.name}
          </h3>
          <p className="text-[11px] text-blue-100/90 font-medium">
            {sortedParts.length} film • {watchedCount} completati ({progressPercent}%)
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. GRIGLIA FILM DELLA SAGA (3 colonne come nel catalogo) */}
      <div className="grid grid-cols-3 gap-2.5 pb-4">
        {sortedParts.map((part: MovieCollectionPart) => {
          const isCurrent = part.id === currentMovieId;
          const releaseYear = part.release_date ? part.release_date.substring(0, 4) : '';
          const isInList = Boolean(part.is_watched || part.in_watchlist);
          const effectiveStatus = part.is_watched
            ? 'watched'
            : part.in_watchlist
            ? 'to_watch'
            : (part.status || 'untracked');
          const borderClass = getMediaBorderClass(effectiveStatus, 'Movie');

          return (
            <div
              key={part.id}
              onClick={() =>
                onSelectMovie({
                  tmdb_id: part.id,
                  title: part.title,
                  poster_path: part.poster_path,
                  release_date: part.release_date,
                  vote_average: part.vote_average,
                })
              }
              title={part.title}
              className="flex flex-col group cursor-pointer w-full relative select-none active:scale-[0.98] transition-transform"
            >
              <div
                className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-900 shadow-xs border-[2.5px] transition-all ${borderClass} ${
                  isCurrent
                    ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white shadow-md'
                    : ''
                }`}
              >
                {part.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${part.poster_path}`}
                    alt={part.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-gray-800 text-gray-300">
                    <span className="text-[10px] font-black line-clamp-3 leading-tight text-white/90">
                      {part.title}
                    </span>
                  </div>
                )}

                {/* Anno di uscita in alto a sinistra sulla locandina */}
                {releaseYear && (
                  <div className="absolute top-1.5 left-1.5 z-10">
                    <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20 shadow-xs">
                      {releaseYear}
                    </span>
                  </div>
                )}

                {/* Pulsante rapido lista in alto a destra */}
                <div className="absolute top-1.5 right-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isInList) {
                        onQuickAdd(part.id);
                      }
                    }}
                    className={`w-6 h-6 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer ${
                      isInList
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-black/50 text-white/90 border border-white/30 backdrop-blur-xs'
                    }`}
                    title={isInList ? 'In lista' : 'Aggiungi'}
                    aria-label={isInList ? 'In lista' : 'Aggiungi'}
                  >
                    {isInList ? (
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMovieSagaTab;
