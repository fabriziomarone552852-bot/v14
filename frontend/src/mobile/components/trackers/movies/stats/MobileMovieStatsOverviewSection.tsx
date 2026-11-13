// src/mobile/components/trackers/stats/MobileMovieStatsOverviewSection.tsx
import React from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { FranchiseTrackerList } from '@/components/trackers/shared/stats';
import { MobileStatsSectionHeader } from '../../shared/stats/MobileStatsSectionHeader';

interface MobileMovieStatsOverviewSectionProps {
  stats: MovieFullStats;
}

const renderDurationMetric = (totalMinutes: number) => {
  const rounded = Math.max(0, Math.round(totalMinutes));
  if (rounded < 60) {
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-blue-600">{rounded}</span>
        <span className="text-xs font-bold text-slate-500 uppercase">
          {rounded === 1 ? 'minuto' : 'minuti'}
        </span>
      </div>
    );
  }
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return (
    <div className="flex items-baseline gap-1.5">
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-black text-blue-600">{hours}</span>
        <span className="text-xs font-bold text-slate-500 uppercase">
          {hours === 1 ? 'ora' : 'ore'}
        </span>
      </div>
      {mins > 0 && (
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-blue-600">{mins}</span>
          <span className="text-xs font-bold text-slate-500 uppercase">min</span>
        </div>
      )}
    </div>
  );
};

export const MobileMovieStatsOverviewSection: React.FC<MobileMovieStatsOverviewSectionProps> = ({
  stats,
}) => {
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

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Panoramica" icon="📊" />

      {/* 1. Prime 4 Card in Griglia 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Tempo Totale */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tempo Totale
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-600 mb-0.5 leading-tight">
            {stats.total_watch_time?.days || 0}G {stats.total_watch_time?.hours || 0}H
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Guardando Film
          </span>
        </div>

        {/* Card 2: Tasso di Completamento */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Completamento
          </span>
          <div className="text-xl sm:text-2xl font-black text-green-500 mb-0.5 leading-tight">
            {stats.completion_rate?.percentage || 0}%
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full px-1">
            {stats.completion_rate?.watched || 0} visti, {stats.completion_rate?.to_watch || 0} in lista
          </span>
        </div>

        {/* Card 3: Proiezioni Future */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Proiezioni Future
          </span>
          <div className="text-base sm:text-lg font-black text-purple-600 mb-0.5 leading-tight">
            {estimatedDateStr}
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
            Fine lista al ritmo attuale
          </span>
        </div>

        {/* Card 4: Binge Record */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Binge Record
          </span>
          <div className="text-xl sm:text-2xl font-black text-orange-500 mb-0.5 leading-tight">
            {stats.personal_records?.max_movies_in_day || '0'} FILM
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-full px-1">
            Solo il {bingeDateStr}
          </span>
        </div>
      </div>

      {/* 2. Statistiche Ultimi 30gg e Ultimi 365gg con stile unificato */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 30 giorni */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ultimi 30 giorni
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-blue-600">
                  {moviesLastMonth}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {moviesLastMonth === 1 ? 'film' : 'film'}
                </span>
              </div>
              {renderDurationMetric(minsLastMonth)}
            </div>
          </div>

          {/* Card 365 giorni */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Ultimi 365 giorni
            </span>
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-blue-600">
                  {moviesLastYear}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {moviesLastYear === 1 ? 'film' : 'film'}
                </span>
              </div>
              {renderDurationMetric(minsLastYear)}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Saghe & Collezioni (Franchise Tracker) */}
      <FranchiseTrackerList
        movies={movies}
        title="Saghe & Collezioni"
        className="max-h-80"
      />
    </div>
  );
};

export default MobileMovieStatsOverviewSection;
