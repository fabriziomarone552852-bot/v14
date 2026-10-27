import React from 'react';
import type { MovieFullStats } from '@/types/movies';
import {
  CriticRatingDistributionChart,
  TopMediaRankingList,
  GenreRatingsGrid,
} from '@/components/trackers/shared/stats';

interface MovieRatingsStatsViewProps {
  stats: MovieFullStats;
}

export const MovieRatingsStatsView: React.FC<MovieRatingsStatsViewProps> = ({ stats }) => {
  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Distribuzione Voti Film */}
        <CriticRatingDistributionChart
          distribution={stats.ratings_distribution || []}
          title="Il Profilo del Critico"
          subtitle="Distribuzione Voti Film"
          showStarIcon
        />

        {/* Hall of Fame (Top 10 Film) */}
        <TopMediaRankingList
          items={stats.top_10_movies || []}
          title="Hall of Fame (Top 10 Film)"
          emptyMessage="Nessun film con voto salvato."
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

export default MovieRatingsStatsView;
