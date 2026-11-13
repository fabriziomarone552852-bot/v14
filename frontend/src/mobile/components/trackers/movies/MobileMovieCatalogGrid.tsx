// src/mobile/components/trackers/movies/MobileMovieCatalogGrid.tsx
import React, { useMemo } from 'react';
import type { Movie } from '@/types/movies';
import { FilmIcon, CheckCircleIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { resolveImageUrl } from '@/utils/imageUtils';
import { getMediaBorderClass } from '@/utils/mediaStatusTheme';
import { useLongPress } from '@/mobile/hooks/useLongPress';

export interface MobileMovieCatalogGridProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  hasActiveFilters: boolean;
  onResetFilters?: () => void;
  emptyMessage?: string;
  resetFiltersLabel?: string;
  selectedMovieTmdbIds?: number[];
  onToggleSelectMovie?: (tmdbId: number) => void;
}

interface MovieCatalogSection {
  id: string;
  title: string;
  items: Movie[];
}

interface MovieCatalogGridItemProps {
  item: Movie;
  onSelectMovie: (movie: Movie) => void;
  isSelected?: boolean;
  isSelectionActive?: boolean;
  onToggleSelectMovie?: (tmdbId: number) => void;
}

const getMoviePoster = (m: Movie): string | null => {
  const raw = m.custom_poster_path || m.poster_path;
  if (!raw) return null;
  return raw.startsWith('http') || raw.startsWith('data:')
    ? raw
    : raw.startsWith('/uploads')
    ? resolveImageUrl(raw)
    : `https://image.tmdb.org/t/p/w300${raw}`;
};

const MovieCatalogGridItem: React.FC<MovieCatalogGridItemProps> = ({
  item,
  onSelectMovie,
  isSelected = false,
  isSelectionActive = false,
  onToggleSelectMovie,
}) => {
  const longPressHandlers = useLongPress({
    delay: 450,
    onLongPress: () => {
      onToggleSelectMovie?.(item.tmdb_id);
    },
    onClick: () => {
      if (isSelectionActive && onToggleSelectMovie) {
        onToggleSelectMovie(item.tmdb_id);
      } else {
        onSelectMovie(item);
      }
    },
  });

  const poster = getMoviePoster(item);
  const borderClass = getMediaBorderClass(item.status, null, {
    isThick: true,
  });

  return (
    <div
      {...longPressHandlers}
      className={`w-full relative aspect-[2/3] rounded-xl overflow-hidden shadow-xs bg-gray-900 ${borderClass} active:scale-[0.96] transition-all duration-150 cursor-pointer group flex items-center justify-center select-none ${
        isSelected ? 'ring-3 ring-blue-500 shadow-blue-500/30' : ''
      }`}
      title={item.title}
    >
      {poster ? (
        <img
          src={poster}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full p-2 flex flex-col items-center justify-center text-center bg-linear-to-b from-gray-800 to-gray-950 text-gray-300">
          <FilmIcon className="w-6 h-6 text-gray-500 mb-1" />
          <span className="text-[11px] font-black line-clamp-2 leading-tight text-white/90">
            {item.title}
          </span>
          {(item.italy_release_date || item.release_date) && (
            <span className="text-[9px] font-semibold text-gray-400 mt-1">
              {(item.italy_release_date || item.release_date || '').substring(0, 4)}
            </span>
          )}
        </div>
      )}

      {isSelected && (
        <>
          <div className="absolute inset-0 bg-blue-600/30 pointer-events-none transition-opacity" />
          <div className="absolute bottom-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
            <CheckCircleIcon className="w-4 h-4" />
          </div>
        </>
      )}
    </div>
  );
};

export const MobileMovieCatalogGrid: React.FC<MobileMovieCatalogGridProps> = ({
  movies,
  onSelectMovie,
  hasActiveFilters,
  onResetFilters,
  emptyMessage = 'Nessun film presente nel catalogo',
  resetFiltersLabel = 'Azzera tutti i filtri',
  selectedMovieTmdbIds = [],
  onToggleSelectMovie,
}) => {
  const sections: MovieCatalogSection[] = useMemo(() => {
    const inLista: Movie[] = [];
    const guardati: Movie[] = [];

    movies.forEach((m) => {
      if (m.status === 'watched') {
        guardati.push(m);
      } else {
        inLista.push(m);
      }
    });

    return [
      { id: 'in_lista', title: 'In lista', items: inLista },
      { id: 'guardati', title: 'Guardati', items: guardati },
    ];
  }, [movies]);

  if (movies.length === 0) {
    return (
      <div className="flex-1 min-h-0 w-full max-w-lg mx-auto flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <EmptyState
          message={
            hasActiveFilters
              ? 'Nessun film corrisponde ai filtri selezionati'
              : emptyMessage
          }
          icon={<FilmIcon className="w-12 h-12 text-gray-300 mb-2" />}
        />
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all cursor-pointer"
          >
            {resetFiltersLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pt-1 pb-16 animate-fadeIn">
      <div className="w-full max-w-lg mx-auto px-3">
        {sections.map((sec) => {
          if (sec.items.length === 0) return null;

          return (
            <div key={sec.id} className="mb-6 last:mb-2 w-full">
              {/* PILLOLA CENTRALE GRIGIA CON NOME SEZIONE */}
              <div className="w-full flex items-center justify-center my-3.5">
                <span className="px-4 py-1 rounded-full text-[11px] font-black tracking-wide text-gray-700 bg-gray-200 border border-gray-300/70 shadow-2xs uppercase text-center select-none">
                  {sec.title}
                </span>
              </div>

              {/* GRIGLIA A 3 COLONNE CENTRATA NELLA PAGINA */}
              <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-3 content-start">
                {sec.items.map((item) => {
                  const isSelected = selectedMovieTmdbIds.includes(item.tmdb_id);
                  const isSelectionActive = selectedMovieTmdbIds.length > 0;
                  return (
                    <MovieCatalogGridItem
                      key={item.id || item.tmdb_id}
                      item={item}
                      onSelectMovie={onSelectMovie}
                      isSelected={isSelected}
                      isSelectionActive={isSelectionActive}
                      onToggleSelectMovie={onToggleSelectMovie}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileMovieCatalogGrid;
