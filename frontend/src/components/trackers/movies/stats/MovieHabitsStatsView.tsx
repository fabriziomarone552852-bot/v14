import React, { useMemo } from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useMovieDashboardStats, useMyMovies } from '@/hooks/queries/useMovieQueries';
import {
  DayOfWeekHabitsChart,
  MonthlyTrendChart,
  GenreDistributionList,
  PlatformDistributionList,
} from '@/components/trackers/shared/stats';

interface MovieHabitsStatsViewProps {
  stats: MovieFullStats;
}

const MONTH_NAMES_ITA = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

export const MovieHabitsStatsView: React.FC<MovieHabitsStatsViewProps> = ({ stats }) => {
  const currentYear = new Date().getFullYear();
  const { data: myMovies = [] } = useMyMovies();
  const { data: dashboardStats } = useMovieDashboardStats();

  const { data: goalData, refetch: refetchGoal } = useQuery({
    queryKey: ['yearlyGoal', 'movies', currentYear],
    queryFn: () => userGoalsApi.getYearlyGoal('movies', currentYear),
  });

  const setGoalMutation = useMutation({
    mutationFn: (newGoal: number) =>
      userGoalsApi.setYearlyGoal('movies', currentYear, newGoal),
    onSuccess: () => refetchGoal(),
  });

  const goal = goalData?.goal_value || 50;
  const currentMovies = dashboardStats?.movies_watched_this_year || 0;

  // Fallback calcolo andamento mensile dai logs in memoria se non ancora presente nel payload
  const timeTrend = useMemo(() => {
    if (stats.time_trend && Object.keys(stats.time_trend).length > 0) {
      return stats.time_trend;
    }

    const map: Record<string, Record<number, { count: number; minutes: number }>> = {};
    const movieRuntimeMap = new Map<number, number>();
    myMovies.forEach((m) => {
      movieRuntimeMap.set(m.tmdb_id, m.runtime || 100);
    });

    myMovies.forEach((m) => {
      (m.logs || []).forEach((l) => {
        if (l.watched_at) {
          const d = new Date(l.watched_at);
          const yStr = d.getFullYear().toString();
          const mIdx = d.getMonth();
          const rt = movieRuntimeMap.get(m.tmdb_id) || 100;

          if (!map[yStr]) {
            map[yStr] = {};
            for (let i = 0; i < 12; i++) {
              map[yStr][i] = { count: 0, minutes: 0 };
            }
          }
          map[yStr][mIdx].count += 1;
          map[yStr][mIdx].minutes += rt;
        }
      });
    });

    const nowYearStr = currentYear.toString();
    if (!map[nowYearStr]) {
      map[nowYearStr] = {};
      for (let i = 0; i < 12; i++) {
        map[nowYearStr][i] = { count: 0, minutes: 0 };
      }
    }

    const result: Record<string, { period: string; hours: number; movies: number }[]> = {};
    Object.entries(map).forEach(([yStr, mDict]) => {
      result[yStr] = MONTH_NAMES_ITA.map((mName, idx) => ({
        period: mName,
        movies: mDict[idx]?.count || 0,
        hours: Math.round(((mDict[idx]?.minutes || 0) / 60) * 10) / 10,
      }));
    });

    return result;
  }, [stats.time_trend, myMovies, currentYear]);

  // Fallback calcolo generi preferiti se non ancora nel payload backend
  const genresDistribution = useMemo(() => {
    if (stats.genres_distribution && stats.genres_distribution.length > 0) {
      return stats.genres_distribution;
    }

    const genreCounts = new Map<string, number>();
    let totalCount = 0;

    myMovies.forEach((m) => {
      if (m.status === 'watched' && m.genres) {
        m.genres.split(',').forEach((g) => {
          const clean = g.trim();
          if (clean) {
            genreCounts.set(clean, (genreCounts.get(clean) || 0) + 1);
            totalCount += 1;
          }
        });
      }
    });

    if (totalCount === 0) return [];

    return Array.from(genreCounts.entries())
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: Math.round((count / totalCount) * 1000) / 10,
      }))
      .sort((a, b) => b.count - a.count);
  }, [stats.genres_distribution, myMovies]);

  const byDay = stats.viewing_habits?.by_day || {};

  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      {/* Top Row: Giorni della Settimana & Andamento Mensile con Obiettivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-56">
        <div className="lg:col-span-1 h-full">
          <DayOfWeekHabitsChart
            byDay={byDay}
            title="Giorni Preferiti"
            subtitle="Film per giorno della settimana"
            barColorClass="bg-blue-500"
            barHoverColorClass="group-hover:bg-blue-600"
          />
        </div>

        <div className="lg:col-span-2 h-full">
          <MonthlyTrendChart
            timeTrend={timeTrend}
            currentYear={currentYear.toString()}
            goal={goal}
            currentCount={currentMovies}
            onSaveGoal={(newGoal) => setGoalMutation.mutate(newGoal)}
            mediaUnitLabel="film"
            title="Andamento Mensile"
          />
        </div>
      </div>

      {/* Bottom Row: Top Generi (Top 5) & Piattaforme di Visione */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <GenreDistributionList
          distribution={genresDistribution}
          title="I Tuoi Generi Preferiti (Top 5)"
          limit={5}
          barColorClass="bg-blue-500"
          emptyMessage="Nessun dato sufficiente sui generi dei film guardati."
        />

        <PlatformDistributionList
          distribution={stats.platform_distribution || []}
          title="Dove Guardo i Film"
          subtitle="Piattaforme di visione"
          barColorClass="bg-indigo-500"
          emptyMessage="Registra le piattaforme streaming o il cinema nei log per visualizzare la ripartizione."
        />
      </div>
    </div>
  );
};

export default MovieHabitsStatsView;
