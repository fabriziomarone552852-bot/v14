import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TVSeries, TMDBEpisode } from '@/types/trackers';
import type { TabType } from '@/components/trackers/series/detail';

export const useSeriesUrlParams = (
  series: TVSeries[] | undefined,
  detailModalOpen: boolean,
  openSeriesDetail: (series: TVSeries | Partial<TVSeries>, tab?: TabType, episode?: TMDBEpisode, reviewLogId?: number) => void
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const tmdbIdParam = searchParams.get('tmdb_id');
    if (!tmdbIdParam) return;

    if (series === undefined) return;

    const openReview = searchParams.get('open_review') === 'true';
    const openEpisode = searchParams.get('open_episode');
    const openReviewLogId = searchParams.get('open_review_log_id');
    const matchedSeries = series.find((s) => String(s.tmdb_id) === tmdbIdParam);
    const targetSeries: TVSeries | Partial<TVSeries> =
      matchedSeries || ({ tmdb_id: Number(tmdbIdParam) } as Partial<TVSeries>);

    if (!detailModalOpen) {
      if (openEpisode && matchedSeries) {
        const epId = Number(openEpisode);
        const foundEp = matchedSeries.episodes?.find((e) => e.id === epId);
        openSeriesDetail(
          targetSeries,
          'seasons',
          foundEp,
          openReviewLogId ? Number(openReviewLogId) : undefined
        );
      } else if (openReview) {
        openSeriesDetail(
          targetSeries,
          'review',
          undefined,
          openReviewLogId ? Number(openReviewLogId) : undefined
        );
      } else {
        openSeriesDetail(targetSeries);
      }
    }
    // Clean up URL params after consuming
    setSearchParams({}, { replace: true });
  }, [series, searchParams, detailModalOpen, openSeriesDetail, setSearchParams]);
};
