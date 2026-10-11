import React from 'react';
import { GlassCardWidget } from './GlassCardWidget';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { TVSeries } from '@/types/trackers';

interface TopSeriesCardsProps {
  series: TVSeries[] | undefined;
  openSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
}

export const TopSeriesCards: React.FC<TopSeriesCardsProps> = ({ series, openSeriesDetail }) => {
  const watchingSeries = series?.filter(s => s.status === 'watching') || [];
  const watchedSeries = series?.filter(s => s.status === 'watched' || s.status === 'completed') || [];

  const lastAdded = series && series.length > 0 
    ? [...series].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] 
    : null;
  const lastWatched = watchingSeries.length > 0 ? watchingSeries[0] : null;
  const lastCompleted = watchedSeries.length > 0 ? watchedSeries[0] : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 shrink-0">
      <GlassCardWidget 
        label="Ultima aggiunta" 
        title={lastAdded?.title || "Nessuno"} 
        subtitle={""}
        posterPath={lastAdded?.custom_poster_path ? resolveImageUrl(lastAdded.custom_poster_path) : lastAdded?.poster_path || null} 
        onClick={() => lastAdded && openSeriesDetail(lastAdded)} 
      />
      <GlassCardWidget 
        label="Continua a guardare" 
        title={lastWatched?.title || "Nessuno"} 
        subtitle={lastWatched ? "S02E04" : ""}
        posterPath={lastWatched?.custom_poster_path ? resolveImageUrl(lastWatched.custom_poster_path) : lastWatched?.poster_path || null} 
        onClick={() => lastWatched && openSeriesDetail(lastWatched)} 
      />
      <GlassCardWidget 
        label="Completata!" 
        title={lastCompleted?.title || "Nessuno"} 
        subtitle={""}
        posterPath={lastCompleted?.custom_poster_path ? resolveImageUrl(lastCompleted.custom_poster_path) : lastCompleted?.poster_path || null} 
        onClick={() => lastCompleted && openSeriesDetail(lastCompleted)} 
      />
    </div>
  );
};
