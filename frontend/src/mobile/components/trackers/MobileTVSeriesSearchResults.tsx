// src/mobile/components/trackers/MobileTVSeriesSearchResults.tsx
import React from 'react';
import type { TVSeries, TMDBSeriesSearchResult } from '@/types/trackers';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileTVSeriesHorizontalCard } from './MobileTVSeriesHorizontalCard';

export interface MobileTVSeriesSearchResultsProps {
  isSearching: boolean;
  results?: TMDBSeriesSearchResult[];
  series?: TVSeries[];
  onCardClick: (mockSeries: Partial<TVSeries>) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
  emptyMessage?: string;
}

export const MobileTVSeriesSearchResults: React.FC<MobileTVSeriesSearchResultsProps> = ({
  isSearching,
  results,
  series,
  onCardClick,
  onAddClick,
  onToggleTrack,
  emptyMessage = 'Nessuna serie trovata su TMDB con questi criteri.',
}) => {
  return (
    <div className="space-y-3 pb-6 animate-fadeIn">
      {/* Stato Caricamento */}
      {isSearching ? (
        <div className="h-64 flex flex-col items-center justify-center gap-2 text-blue-600">
          <LoadingIcon className="w-8 h-8 animate-spin" />
          <span className="text-xs font-bold text-gray-600">Ricerca in corso...</span>
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
            const existing = series?.find((s) => s.tmdb_id === item.id);
            return (
              <MobileTVSeriesHorizontalCard
                key={item.id}
                result={item}
                existingSeries={existing}
                onCardClick={onCardClick}
                onAddClick={onAddClick}
                onToggleTrack={onToggleTrack}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MobileTVSeriesSearchResults;
