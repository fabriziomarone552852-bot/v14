// src/mobile/components/trackers/movies/MobileMovieSearchResults.tsx
import React from 'react';
import type { Movie, TMDBMovieSearchResult, MovieDetailTarget } from '@/types/movies';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileMovieHorizontalCard } from './MobileMovieHorizontalCard';
import { LoadMoreButton } from '@/components/trackers/shared/LoadMoreButton';

export interface MobileMovieSearchResultsProps {
  isSearching: boolean;
  results?: TMDBMovieSearchResult[];
  movies?: Movie[];
  onCardClick: (movie: MovieDetailTarget) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
  emptyMessage?: string;
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;
}

export const MobileMovieSearchResults: React.FC<MobileMovieSearchResultsProps> = ({
  isSearching,
  results,
  movies,
  onCardClick,
  onAddClick,
  onToggleTrack,
  emptyMessage = 'Nessun film trovato su TMDB con questi criteri.',
  hasMoreResults = false,
  isFetchingMore = false,
  onFetchMore,
}) => {
  return (
    <div className="space-y-3 pb-6 animate-fadeIn">
      {/* Stato Caricamento */}
      {isSearching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-blue-600">
          <LoadingIcon className="w-8 h-8 animate-spin" />
          <span className="text-xs font-bold text-gray-600">Ricerca film in corso...</span>
        </div>
      ) : !results || results.length === 0 ? (
        /* Stato Vuoto */
        <div className="h-64 flex flex-col items-center justify-center">
          <EmptyState message={emptyMessage} />
        </div>
      ) : (
        /* Elenco Card Orizzontali */
        <div className="flex flex-col gap-2.5">
          {results.map((item) => {
            const existing = movies?.find((m) => m.tmdb_id === item.id);
            return (
              <MobileMovieHorizontalCard
                key={item.id}
                result={item}
                existingMovie={existing}
                onCardClick={onCardClick}
                onAddClick={onAddClick}
                onToggleTrack={onToggleTrack}
              />
            );
          })}
          {onFetchMore && (
            <LoadMoreButton
              hasMore={Boolean(hasMoreResults)}
              isLoading={Boolean(isFetchingMore)}
              onLoadMore={onFetchMore}
              size="sm"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MobileMovieSearchResults;
