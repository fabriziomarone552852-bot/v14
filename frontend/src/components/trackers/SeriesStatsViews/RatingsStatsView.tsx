import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import {
  CriticRatingDistributionChart,
  TopMediaRankingList,
  GenreRatingsGrid,
} from '@/components/trackers/shared/stats';

interface Props {
  stats: TVFullStats;
}

export const RatingsStatsView: React.FC<Props> = ({ stats }) => {
  const [ratingsType, setRatingsType] = useState<'series' | 'episodes'>('series');

  const distribution =
    ratingsType === 'series'
      ? stats.series_ratings_distribution || []
      : stats.episode_ratings_distribution || [];

  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      {/* Distribuzione Voti & Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <CriticRatingDistributionChart
          distribution={distribution}
          title="Il Profilo del Critico"
          headerRight={
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button
                type="button"
                onClick={() => setRatingsType('series')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  ratingsType === 'series'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Serie
              </button>
              <button
                type="button"
                onClick={() => setRatingsType('episodes')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  ratingsType === 'episodes'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Episodi
              </button>
            </div>
          }
        />

        <TopMediaRankingList
          items={stats.top_10_series || []}
          title="Hall of Fame (Top 10)"
          emptyMessage="Nessun voto assegnato."
        />
      </div>

      {/* Top 5 Generi (Per Voto Medio) */}
      <GenreRatingsGrid
        ratingsByGenre={stats.ratings_by_genre || []}
        title="Top 5 Generi (Per Voto Medio)"
        limit={5}
      />
    </div>
  );
};

export default RatingsStatsView;
