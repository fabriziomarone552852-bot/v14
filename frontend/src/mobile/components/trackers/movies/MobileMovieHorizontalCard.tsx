// src/mobile/components/trackers/movies/MobileMovieHorizontalCard.tsx
import React from 'react';
import type { Movie, TMDBMovieSearchResult, MovieDetailTarget } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import { MobileMediaHorizontalCard } from '../shared/MobileMediaHorizontalCard';

export interface MobileMovieHorizontalCardProps {
  result: TMDBMovieSearchResult;
  existingMovie?: Movie;
  onCardClick: (movie: MovieDetailTarget) => void;
  onAddClick: (tmdbId: number, e: React.MouseEvent) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean, e: React.MouseEvent) => void;
}

export const MobileMovieHorizontalCard: React.FC<MobileMovieHorizontalCardProps> = ({
  result,
  existingMovie,
  onCardClick,
  onAddClick,
  onToggleTrack,
}) => {
  const rawBackdrop = existingMovie?.backdrop_path || result.backdrop_path;

  const handleClick = () => {
    const movieTarget: MovieDetailTarget = existingMovie || {
      tmdb_id: result.id,
      title: result.title,
      poster_path: result.poster_path,
      backdrop_path: result.backdrop_path,
    };
    onCardClick(movieTarget);
  };

  const posterPath = existingMovie?.custom_poster_path
    ? resolveImageUrl(existingMovie.custom_poster_path)
    : result.poster_path || existingMovie?.poster_path;

  return (
    <MobileMediaHorizontalCard
      id={result.id}
      title={result.title}
      originalTitle={result.original_title}
      overview={result.overview}
      posterPath={posterPath}
      backdropPath={rawBackdrop}
      releaseDate={result.release_date || result.italy_release_date}
      isExisting={Boolean(existingMovie)}
      status={existingMovie?.status}
      placeholderIcon={<FilmIcon className="w-6 h-6 opacity-40" />}
      onCardClick={handleClick}
      onAddClick={(e) => onAddClick(result.id, e)}
      onToggleTrack={onToggleTrack ? (isTracked, e) => onToggleTrack(result.id, isTracked, e) : undefined}
    />
  );
};

export default MobileMovieHorizontalCard;
