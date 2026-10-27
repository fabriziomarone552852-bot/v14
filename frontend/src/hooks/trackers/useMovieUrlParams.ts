import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Movie, MovieDetailTarget } from '@/types/movies';

export type MovieDetailTabType = 'overview' | 'saga' | 'review' | 'friends' | 'lists';

export const useMovieUrlParams = (
  movies: Movie[] | undefined,
  detailModalOpen: boolean,
  openMovieDetail: (movie: MovieDetailTarget, tab?: MovieDetailTabType, reviewLogId?: number) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tmdbIdParam = searchParams.get('tmdb_id');
    if (!tmdbIdParam) return;

    const targetMovie =
      movies?.find((m) => String(m.tmdb_id) === tmdbIdParam) ||
      ({ tmdb_id: Number(tmdbIdParam) } as MovieDetailTarget);

    if (targetMovie) {
      const openReview = searchParams.get('open_review') === 'true';
      const openReviewLogId = searchParams.get('open_review_log_id');

      if (!detailModalOpen) {
        if (openReview) {
          openMovieDetail(
            targetMovie,
            'review',
            openReviewLogId ? Number(openReviewLogId) : undefined
          );
        } else {
          openMovieDetail(targetMovie);
        }
      }
      setSearchParams({}, { replace: true });
    }
  }, [movies, searchParams, detailModalOpen, openMovieDetail, setSearchParams]);
};
