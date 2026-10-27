import React from 'react';
import { TrackerTopCards, type TrackerTopCardItem } from '@/components/trackers/shared/TrackerTopCards';
import type { Movie, MovieDetailTarget } from '@/types/movies';

interface TopMovieCardsProps {
  movies: Movie[] | undefined;
  openMovieDetail: (movie: MovieDetailTarget) => void;
}

export const TopMovieCards: React.FC<TopMovieCardsProps> = ({ movies, openMovieDetail }) => {
  const watchedMovies = movies?.filter((m) => m.status === 'watched') || [];
  const toWatchMovies = movies?.filter((m) => m.status === 'to_watch') || [];
  const obtainedMovies = movies?.filter((m) => Boolean(m.obtained_at)) || [];

  const lastAdded =
    toWatchMovies.length > 0
      ? [...toWatchMovies].sort(
          (a, b) =>
            new Date(b.added_at || b.updated_at || 0).getTime() -
            new Date(a.added_at || a.updated_at || 0).getTime()
        )[0]
      : movies && movies.length > 0
      ? [...movies].sort(
          (a, b) =>
            new Date(b.added_at || b.updated_at || 0).getTime() -
            new Date(a.added_at || a.updated_at || 0).getTime()
        )[0]
      : null;

  const lastObtained =
    obtainedMovies.length > 0
      ? [...obtainedMovies].sort(
          (a, b) =>
            new Date(b.obtained_at || 0).getTime() -
            new Date(a.obtained_at || 0).getTime()
        )[0]
      : null;

  const lastWatched =
    watchedMovies.length > 0
      ? [...watchedMovies].sort(
          (a, b) =>
            new Date(b.my_last_watched_at || b.updated_at || 0).getTime() -
            new Date(a.my_last_watched_at || a.updated_at || 0).getTime()
        )[0]
      : null;

  const formatObtainedSubtitle = (m: Movie | null) => {
    if (!m) return '';
    if (m.obtained_at) {
      try {
        return `Ottenuto il ${new Date(m.obtained_at).toLocaleDateString('it-IT')}`;
      } catch {
        return 'Disponibile';
      }
    }
    return 'Disponibile';
  };

  const cards: TrackerTopCardItem[] = [
    {
      label: 'Ultimo aggiunto',
      title: lastAdded?.title || null,
      posterPath: lastAdded?.custom_poster_path || lastAdded?.poster_path || null,
      emptyTitle: 'Nessun film in lista',
      onClick: () => lastAdded && openMovieDetail(lastAdded),
    },
    {
      label: 'Ultimo ottenuto',
      title: lastObtained?.title || null,
      subtitle: lastObtained ? formatObtainedSubtitle(lastObtained) : 'Non ancora ottenuto',
      posterPath: lastObtained?.custom_poster_path || lastObtained?.poster_path || null,
      emptyTitle: 'Nessun film ottenuto',
      onClick: () => lastObtained && openMovieDetail(lastObtained),
    },
    {
      label: 'Ultimo guardato',
      title: lastWatched?.title || null,
      posterPath: lastWatched?.custom_poster_path || lastWatched?.poster_path || null,
      emptyTitle: 'Nessun film visto',
      onClick: () => lastWatched && openMovieDetail(lastWatched),
    },
  ];

  return <TrackerTopCards cards={cards} />;
};
