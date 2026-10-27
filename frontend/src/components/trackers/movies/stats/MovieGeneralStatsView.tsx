import React from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { formatWatchDuration } from '@/utils/dateUtils';
import { StatHighlightCard, FranchiseTrackerList } from '@/components/trackers/shared/stats';

interface MovieGeneralStatsViewProps {
  stats: MovieFullStats;
}

export const MovieGeneralStatsView: React.FC<MovieGeneralStatsViewProps> = ({ stats }) => {
  const { data: movies = [] } = useMyMovies();

  const estimatedDateStr = stats.watchlist_forecast?.estimated_date
    ? new Date(stats.watchlist_forecast.estimated_date).toLocaleDateString('it-IT')
    : 'N/A';

  const bingeDateStr = stats.personal_records?.max_movies_day
    ? new Date(stats.personal_records.max_movies_day).toLocaleDateString('it-IT')
    : '-';

  const moviesLastMonth = stats.general_stats?.movies_last_month || 0;
  const moviesLastYear = stats.general_stats?.movies_last_year || 0;

  const minsLastMonth =
    stats.general_stats?.minutes_last_month ??
    Math.round((stats.general_stats?.hours_last_month || 0) * 60);

  const minsLastYear =
    stats.general_stats?.minutes_last_year ??
    Math.round((stats.general_stats?.hours_last_year || 0) * 60);

  const timeLastMonthStr = formatWatchDuration(minsLastMonth);
  const timeLastYearStr = formatWatchDuration(minsLastYear);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full text-left">
      {/* 1. Highlight Cards in cima */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <StatHighlightCard
          label="Tempo Totale"
          value={`${stats.total_watch_time?.days || 0}G ${stats.total_watch_time?.hours || 0}H`}
          subtitle="GUARDANDO FILM (RUNTIME REALE)"
          valueColorClass="text-blue-600"
        />

        <StatHighlightCard
          label="Completamento"
          value={`${stats.completion_rate?.percentage || 0}%`}
          subtitle={`${stats.completion_rate?.watched || 0} VISTI, ${stats.completion_rate?.to_watch || 0} IN LISTA`}
          valueColorClass="text-green-500"
        />

        <StatHighlightCard
          label="Proiezioni Future"
          value={estimatedDateStr}
          subtitle="DATA STIMATA COMPLETAMENTO WATCHLIST"
          valueColorClass="text-purple-600"
          valueSizeClass="text-xl"
        />

        <StatHighlightCard
          label="Binge Record"
          value={`${stats.personal_records?.max_movies_in_day || '0'} FILM`}
          subtitle={`IL ${bingeDateStr}`}
          valueColorClass="text-orange-500"
        />
      </div>

      {/* 2. Due colonne: Finestre Temporali & Franchise Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Colonna Sinistra: Due card per 30 giorni e 365 giorni */}
        <div className="flex flex-col gap-4 sm:gap-6 justify-center h-full">
          {/* Card Ultimi 30 Giorni */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center">
            <h3 className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 select-none">
              Negli ultimi 30 giorni
            </h3>
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                  {moviesLastMonth}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">
                  {moviesLastMonth === 1 ? 'film' : 'film'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-2xl font-black text-indigo-600">
                  {timeLastMonthStr}
                </span>
              </div>
            </div>
          </div>

          {/* Card Ultimi 365 Giorni */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-center">
            <h3 className="text-center font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 select-none">
              Negli ultimi 365 giorni
            </h3>
            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                  {moviesLastYear}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase">
                  {moviesLastYear === 1 ? 'film' : 'film'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg sm:text-2xl font-black text-indigo-600">
                  {timeLastYearStr}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Destra: Franchise Tracker */}
        <FranchiseTrackerList movies={movies} />
      </div>
    </div>
  );
};

export default MovieGeneralStatsView;
