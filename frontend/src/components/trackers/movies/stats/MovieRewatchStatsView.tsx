import React, { useMemo } from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import {
  ComfortZoneCard,
  GuiltyPleasuresCard,
  ExplorationVsNostalgiaCard,
  type RewatchEntry,
  type GuiltyPleasureItem,
} from '@/components/trackers/shared/stats';

interface MovieRewatchStatsViewProps {
  stats: MovieFullStats;
}

export const MovieRewatchStatsView: React.FC<MovieRewatchStatsViewProps> = ({ stats }) => {
  const { data: myMovies = [] } = useMyMovies();

  // Calcolo locale di fallback resiliente (Regola del "Mazzo di Carte" in RAM)
  const fallbackData = useMemo(() => {
    let firstMins = 0;
    let rewatchMins = 0;
    const rewatchedList: RewatchEntry[] = [];
    const guiltyList: GuiltyPleasureItem[] = [];

    myMovies.forEach((m) => {
      const watchCount =
        m.watch_count || (m.status === 'watched' ? 1 : 0);
      const runtime = m.runtime || 100;

      if (watchCount > 0) {
        firstMins += runtime;
      }

      if (watchCount > 1) {
        rewatchMins += (watchCount - 1) * runtime;
        const rating = m.my_rating ?? null;
        const item: RewatchEntry = {
          title: m.title,
          rewatch_count: watchCount,
          rating,
        };
        rewatchedList.push(item);

        if (rating !== null && rating !== undefined) {
          guiltyList.push({
            title: m.title,
            rewatch_count: watchCount,
            rating,
          });
        }
      }
    });

    rewatchedList.sort((a, b) => b.rewatch_count - a.rewatch_count);
    guiltyList.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));

    return {
      rewatched: rewatchedList.slice(0, 10),
      guilty: guiltyList.slice(0, 5),
      firstWatchHours: Math.round((firstMins / 60) * 10) / 10,
      rewatchHours: Math.round((rewatchMins / 60) * 10) / 10,
    };
  }, [myMovies]);

  const comfortZoneItems: RewatchEntry[] = useMemo(() => {
    if (stats.most_rewatched && stats.most_rewatched.length > 0) {
      return stats.most_rewatched;
    }
    return fallbackData.rewatched;
  }, [stats.most_rewatched, fallbackData.rewatched]);

  const guiltyPleasureItems: GuiltyPleasureItem[] = useMemo(() => {
    if (stats.guilty_pleasures && stats.guilty_pleasures.length > 0) {
      return stats.guilty_pleasures;
    }
    return fallbackData.guilty;
  }, [stats.guilty_pleasures, fallbackData.guilty]);

  const firstWatchHours =
    stats.rewatch_comparison?.first_watch_hours ?? fallbackData.firstWatchHours;
  const rewatchHours =
    stats.rewatch_comparison?.rewatch_hours ?? fallbackData.rewatchHours;

  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Comfort Zone (Film più visti) */}
        <ComfortZoneCard
          title="Comfort Zone"
          items={comfortZoneItems}
          emptyMessage="Nessun rewatch di film registrato."
        />

        {/* Il Test del Tempo (Guilty Pleasures) */}
        <GuiltyPleasuresCard
          title="Il Test del Tempo"
          items={guiltyPleasureItems}
          emptyMessage="Nessun guilty pleasure trovato."
        />

        {/* Esplorazione vs Nostalgia */}
        <ExplorationVsNostalgiaCard
          title="Esplorazione vs Nostalgia"
          firstWatchHours={firstWatchHours}
          rewatchHours={rewatchHours}
          emptyMessage="Non hai ancora registrato tempo."
        />
      </div>
    </div>
  );
};

export default MovieRewatchStatsView;
