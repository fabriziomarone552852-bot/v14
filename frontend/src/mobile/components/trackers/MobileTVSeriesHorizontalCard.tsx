// src/mobile/components/trackers/MobileTVSeriesHorizontalCard.tsx
import React from 'react';
import type { TVSeries, TMDBSeriesSearchResult } from '@/types/trackers';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import { MobileMediaHorizontalCard } from './shared/MobileMediaHorizontalCard';

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
  const rawBackdrop = existingSeries?.backdrop_path || existingSeries?.tmdb_series?.backdrop_path || result.backdrop_path;

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

  const posterPath = existingSeries?.custom_poster_path
    ? resolveImageUrl(existingSeries.custom_poster_path)
    : result.poster_path || existingSeries?.poster_path;

  return (
    <MobileMediaHorizontalCard
      id={result.id}
      title={result.name}
      originalTitle={result.original_name}
      overview={result.overview}
      posterPath={posterPath}
      backdropPath={rawBackdrop}
      releaseDate={result.first_air_date}
      isExisting={Boolean(existingSeries)}
      status={existingSeries?.status}
      tmdbStatus={existingSeries?.tmdb_status}
      placeholderIcon={<TvIcon className="w-6 h-6 opacity-40" />}
      onCardClick={handleClick}
      onAddClick={(e) => onAddClick(result.id, e)}
      onToggleTrack={onToggleTrack ? (isTracked, e) => onToggleTrack(result.id, isTracked, e) : undefined}
    />
  );
};

export default MobileTVSeriesHorizontalCard;

