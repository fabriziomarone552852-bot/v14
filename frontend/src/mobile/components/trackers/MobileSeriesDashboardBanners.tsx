import React, { useMemo } from 'react';
import { TvIcon } from '@/components/shared/utils/Icons';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TVSeries, MediaList } from '@/types/trackers';
import { MobileTrackerDashboardBanners } from './shared/MobileTrackerDashboardBanners';

export interface MobileSeriesDashboardBannersProps {
  series: TVSeries[] | undefined;
  myLists: MediaList[] | undefined;
  onOpenSeriesDetail?: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenCatalog: () => void;
  onOpenPersonalLists: (list?: MediaList) => void;
}

export const MobileSeriesDashboardBanners: React.FC<MobileSeriesDashboardBannersProps> = ({
  series,
  myLists,
  onOpenCatalog,
  onOpenPersonalLists,
}) => {
  const latestAddedSeries = useMemo(() => {
    if (!series || series.length === 0) return [];
    return [...series].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }, [series]);

  const catalogItems = useMemo(() => {
    return latestAddedSeries.map((s) => {
      const rawPoster = s.custom_poster_path
        ? resolveImageUrl(s.custom_poster_path)
        : s.poster_path || s.tmdb_series?.poster_path;
      const poster = rawPoster
        ? rawPoster.startsWith('http') || rawPoster.startsWith('data:')
          ? rawPoster
          : rawPoster.startsWith('/uploads')
          ? resolveImageUrl(rawPoster)
          : `https://image.tmdb.org/t/p/w200${rawPoster}`
        : null;

      return {
        id: s.tmdb_id,
        title: s.title,
        posterUrl: poster,
      };
    });
  }, [latestAddedSeries]);

  return (
    <MobileTrackerDashboardBanners
      catalogTitle="LE TUE SERIE"
      catalogItems={catalogItems}
      myLists={myLists}
      seriesForLists={series}
      emptyCatalogMessage="Nessuna serie ancora a catalogo"
      emptyListsMessage="Nessuna lista creata"
      onOpenCatalog={onOpenCatalog}
      onOpenPersonalLists={onOpenPersonalLists}
      placeholderIcon={<TvIcon className="w-4 h-4 opacity-40" />}
    />
  );
};

export default MobileSeriesDashboardBanners;

