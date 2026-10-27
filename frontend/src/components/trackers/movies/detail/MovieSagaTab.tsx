import React from 'react';
import type {
  MovieCollectionDetail,
  MovieCollectionPart,
  MovieDetailTarget,
} from '@/types/movies';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';

interface MovieSagaTabProps {
  collection?: MovieCollectionDetail | null;
  currentMovieId?: number;
  isLoading?: boolean;
  onSelectMovie: (movie: MovieDetailTarget) => void;
  onQuickAdd: (tmdbId: number) => void;
}

export const MovieSagaTab: React.FC<MovieSagaTabProps> = ({
  collection,
  currentMovieId,
  isLoading = false,
  onSelectMovie,
  onQuickAdd,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        Caricamento collezione...
      </div>
    );
  }

  if (!collection || !collection.parts || collection.parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-8 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h4 className="text-base font-bold text-gray-800">Nessuna Collezione TMDB</h4>
        <p className="text-xs text-gray-500 max-w-sm mt-1">
          Questo film è un'opera singola e non fa parte di una saga o franchise registrato su TMDB.
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
    <div className="flex flex-col gap-6 animate-fadeIn p-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 text-left">
      {/* Banner Saga */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 shadow-md flex flex-col md:flex-row items-center gap-4">
        {collection.poster_path && (
          <img
            src={`https://image.tmdb.org/t/p/w200${collection.poster_path}`}
            alt={collection.name}
            className="w-16 h-24 object-cover rounded-lg shadow-md shrink-0 border border-white/20"
          />
        )}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">
            Saga
          </span>
          <h3 className="text-xl font-black text-white leading-tight drop-shadow-sm truncate">
            {collection.name}
          </h3>
          <p className="text-xs text-blue-100/80">
            {sortedParts.length} film • {watchedCount} completati ({progressPercent}%)
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Griglia Film della Saga in stile Catalogo */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 content-start pb-4">
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
              className="flex flex-col group cursor-pointer w-full relative z-0 hover:z-20 select-none"
            >
              <div
                className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-900 shadow-sm border-[3px] transition-all duration-300 group-hover:scale-105 ${borderClass} ${
                  isCurrent
                    ? 'ring-4 ring-blue-500 ring-offset-2 ring-offset-white shadow-xl shadow-blue-500/40 z-10'
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
                  <img
                    src="/no-poster.png"
                    alt={part.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                )}

                {/* Overlay gradiente inferiore */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />


                {/* Pulsante rapido lista / no lista col quadrato blu */}
                <div
                  className={`absolute top-2 right-2 z-10 transition-opacity duration-200 ${
                    isInList ? 'opacity-100' : 'opacity-75 sm:opacity-0 sm:group-hover:opacity-100'
                  }`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isInList) {
                        onQuickAdd(part.id);
                      }
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 cursor-pointer ${
                      isInList
                        ? 'bg-blue-500 border-2 border-solid border-blue-500 text-white shadow-md'
                        : 'bg-white/40 backdrop-blur-md border-2 border-dashed border-white/80 text-white hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/90 shadow-sm'
                    }`}
                    title={
                      part.is_watched
                        ? 'Già visto'
                        : part.in_watchlist
                        ? 'Già in lista'
                        : 'Aggiungi alla lista'
                    }
                  >
                    {isInList ? (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Anno di uscita in piccolo, sotto il nome del film */}
                <div className="absolute bottom-0 inset-x-0 p-3 pointer-events-none flex flex-col justify-end text-left">
                  {releaseYear && (
                    <span className="text-[11px] font-bold text-gray-300 drop-shadow-sm mb-0.5">
                      {releaseYear}
                    </span>
                  )}
                  <h4 className="font-bold text-white line-clamp-2 text-sm leading-tight drop-shadow-md">
                    {part.title}
                  </h4>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
