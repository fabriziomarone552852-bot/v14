import React from 'react';
import { TrackerTopCards, type TrackerTopCardItem } from './shared/TrackerTopCards';
import type { TVSeries } from '@/types/trackers';

interface TopSeriesCardsProps {
  series: TVSeries[] | undefined;
  openSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
}

export const TopSeriesCards: React.FC<TopSeriesCardsProps> = ({ series, openSeriesDetail }) => {
  const watchingSeries = series?.filter((s) => s.status === 'watching') || [];
  const watchedSeries = series?.filter((s) => s.status === 'watched' || s.status === 'completed') || [];

  const lastAdded =
    series && series.length > 0
      ? [...series].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      : null;

  const lastWatched = watchingSeries.length > 0 ? watchingSeries[0] : null;
  const lastCompleted = watchedSeries.length > 0 ? watchedSeries[0] : null;

  const getContinueSubtitle = (s: TVSeries | null) => {
    if (!s) return '';
    if (s.next_episode_to_watch) {
      const ep = s.next_episode_to_watch;
      return `S${String(ep.season_number).padStart(2, '0')}E${String(ep.episode_number).padStart(2, '0')}`;
    }
    return 'In corso';
  };

  const cards: TrackerTopCardItem[] = [
    {
      label: 'Ultima aggiunta',
      title: lastAdded?.title || null,
      posterPath: lastAdded?.custom_poster_path || lastAdded?.poster_path || null,
      emptyTitle: 'Nessuna serie',
      onClick: () => lastAdded && openSeriesDetail(lastAdded),
    },
    {
      label: 'Continua a guardare',
      title: lastWatched?.title || null,
      subtitle: getContinueSubtitle(lastWatched),
      posterPath: lastWatched?.custom_poster_path || lastWatched?.poster_path || null,
      emptyTitle: 'Nessuna serie in visione',
      onClick: () => lastWatched && openSeriesDetail(lastWatched),
    },
    {
      label: 'Completata!',
      title: lastCompleted?.title || null,
      posterPath: lastCompleted?.custom_poster_path || lastCompleted?.poster_path || null,
      emptyTitle: 'Nessuna serie completata',
      onClick: () => lastCompleted && openSeriesDetail(lastCompleted),
    },
  ];

  return <TrackerTopCards cards={cards} />;
};
