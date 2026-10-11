import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TVSeries, TMDBEpisode } from '@/types/trackers';
import type { TabType } from '@/components/trackers/SeriesDetailModal';

export const useSeriesUrlParams = (
  series: TVSeries[] | undefined,
  detailModalOpen: boolean,
  openSeriesDetail: (series: TVSeries | Partial<TVSeries>, tab?: TabType, episode?: TMDBEpisode, reviewLogId?: number) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (series && series.length > 0 && !detailModalOpen) {
      const tmdbIdParam = searchParams.get('tmdb_id');
      const openReview = searchParams.get('open_review') === 'true';
      const openEpisode = searchParams.get('open_episode');
      const openReviewLogId = searchParams.get('open_review_log_id');
      
      if (tmdbIdParam) {
        const targetSeries = series.find(s => String(s.tmdb_id) === tmdbIdParam);
        if (targetSeries) {
          if (openEpisode) {
            // Seleziona episodio
            const epId = Number(openEpisode);
            const foundEp = targetSeries.episodes?.find(e => e.id === epId);
            openSeriesDetail(targetSeries, 'seasons', foundEp, openReviewLogId ? Number(openReviewLogId) : undefined);
          } else if (openReview) {
            openSeriesDetail(targetSeries, 'review', undefined, openReviewLogId ? Number(openReviewLogId) : undefined);
          } else {
            openSeriesDetail(targetSeries);
          }
          // Clean up URL params after opening
          setSearchParams({});
        }
      }
    }
  }, [series, searchParams, detailModalOpen, openSeriesDetail, setSearchParams]);
};
