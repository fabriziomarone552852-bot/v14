// src/mobile/components/trackers/stats/MobileMovieStatsHabitsSection.tsx
import React, { useState, useMemo } from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useMovieDashboardStats, useMyMovies } from '@/hooks/queries/useMovieQueries';
import { EditIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from '../../shared/stats/MobileStatsSectionHeader';

interface MobileMovieStatsHabitsSectionProps {
  stats: MovieFullStats;
}

const MONTH_NAMES_ITA = [
  'Gen',
  'Feb',
  'Mar',
  'Apr',
  'Mag',
  'Giu',
  'Lug',
  'Ago',
  'Set',
  'Ott',
  'Nov',
  'Dic',
];

const WEEKDAYS = [
  { key: 'Lun', label: 'Lunedì', aliases: ['lun', 'lunedì', 'lunedi', 'monday'] },
  { key: 'Mar', label: 'Martedì', aliases: ['mar', 'martedì', 'martedi', 'tuesday'] },
  { key: 'Mer', label: 'Mercoledì', aliases: ['mer', 'mercoledì', 'mercoledi', 'wednesday'] },
  { key: 'Gio', label: 'Giovedì', aliases: ['gio', 'giovedì', 'giovedi', 'thursday'] },
  { key: 'Ven', label: 'Venerdì', aliases: ['ven', 'venerdì', 'venerdi', 'friday'] },
  { key: 'Sab', label: 'Sabato', aliases: ['sab', 'sabato', 'saturday'] },
  { key: 'Dom', label: 'Domenica', aliases: ['dom', 'domenica', 'sunday'] },
];

export const MobileMovieStatsHabitsSection: React.FC<MobileMovieStatsHabitsSectionProps> = ({
  stats,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

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

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState('');

  const handleEditGoal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setGoalInputValue(goal.toString());
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    const newGoal = parseInt(goalInputValue, 10);
    if (!isNaN(newGoal) && newGoal > 0) {
      setGoalMutation.mutate(newGoal);
    }
    setIsEditingGoal(false);
  };

  // 1. Dati per giorni della settimana: mostra sempre tutti i 7 giorni (Lunedì - Domenica)
  const byDayRaw = stats.viewing_habits?.by_day || {};
  const dayList = useMemo(() => {
    return WEEKDAYS.map((w) => {
      let count = 0;
      for (const [key, val] of Object.entries(byDayRaw)) {
        const lower = key.trim().toLowerCase();
        if (w.aliases.includes(lower)) {
          count = Number(val) || 0;
          break;
        }
      }
      return {
        label: w.label,
        count,
      };
    });
  }, [byDayRaw]);

  const maxDayCount = Math.max(1, ...dayList.map((d) => d.count));

  // 2. Fallback calcolo andamento mensile dai logs in memoria
  const monthlyTrend = useMemo(() => {
    if (stats.time_trend?.[selectedYear] && stats.time_trend[selectedYear].length > 0) {
      return stats.time_trend[selectedYear];
    }

    const map: Record<number, number> = {};
    for (let i = 0; i < 12; i++) {
      map[i] = 0;
    }

    myMovies.forEach((m) => {
      (m.logs || []).forEach((l) => {
        if (l.watched_at) {
          const d = new Date(l.watched_at);
          if (d.getFullYear().toString() === selectedYear) {
            const mIdx = d.getMonth();
            map[mIdx] = (map[mIdx] || 0) + 1;
          }
        }
      });
    });

    return MONTH_NAMES_ITA.map((mName, idx) => ({
      period: mName,
      movies: map[idx] || 0,
      hours: Math.round(((map[idx] || 0) * 1.8) * 10) / 10,
    }));
  }, [stats.time_trend, selectedYear, myMovies]);

  const maxMonthVal = Math.max(
    1,
    ...monthlyTrend.map((x) => x.movies ?? 0)
  );

  // 3. Fallback generi preferiti
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

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Abitudini di Visione" icon="⏱️" />

      {/* 1. Giorni Preferiti della Settimana (Sempre visibili da Lunedì a Domenica) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Giorni Preferiti
        </h3>

        <div className="space-y-2">
          {dayList.map(({ label, count }) => {
            const pct = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
            return (
              <div key={label} className="flex items-center gap-2">
                <span className="w-24 text-[11px] font-bold text-slate-600 truncate" title={label}>
                  {label}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, opacity: Math.max(0.2, pct / 100) }}
                  />
                </div>
                <span className="w-12 text-right text-[10px] font-bold text-slate-400">
                  {count} {count === 1 ? 'film' : 'film'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Andamento Mensile & Obiettivo */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Andamento
          </h3>

          {/* Frecce centrali per cambiare anno */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => (parseInt(y, 10) - 1).toString())}
              className="p-1 text-slate-500 hover:text-slate-800 active:scale-90 transition-all text-base leading-none font-bold cursor-pointer"
              aria-label="Anno precedente"
            >
              ‹
            </button>
            <span className="text-xs font-extrabold text-slate-700">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear((y) => (parseInt(y, 10) + 1).toString())}
              className="p-1 text-slate-500 hover:text-slate-800 active:scale-90 transition-all text-base leading-none font-bold cursor-pointer"
              aria-label="Anno successivo"
            >
              ›
            </button>
          </div>

          {/* Obiettivo annuale */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Goal: {currentMovies}/
              {isEditingGoal ? (
                <input
                  autoFocus
                  type="number"
                  min={1}
                  className="w-12 px-1 py-0.5 border border-blue-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  value={goalInputValue}
                  onChange={(e) => setGoalInputValue(e.target.value)}
                  onBlur={handleSaveGoal}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveGoal();
                    if (e.key === 'Escape') setIsEditingGoal(false);
                  }}
                />
              ) : (
                <span className="font-extrabold text-blue-600">{goal}</span>
              )}
            </span>
            {!isEditingGoal && (
              <button
                type="button"
                onClick={handleEditGoal}
                className="text-blue-500 hover:text-blue-700 p-0.5 cursor-pointer"
                title="Modifica obiettivo"
              >
                <EditIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Grafico Barre Mesi con tocco interattivo */}
        {monthlyTrend.length > 0 ? (
          <div className="h-36 flex items-end justify-between gap-1 pt-6 pb-1 relative">
            {monthlyTrend.map((t) => {
              const val = t.movies ?? 0;
              const pct = maxMonthVal > 0 ? (val / maxMonthVal) * 100 : 0;
              const isSelected = selectedMonth === t.period;

              return (
                <div
                  key={t.period}
                  onClick={() =>
                    setSelectedMonth((curr) => (curr === t.period ? null : t.period))
                  }
                  className="flex flex-col items-center gap-1 flex-1 h-full justify-end cursor-pointer relative"
                  title="Tocca per vedere i dettagli"
                >
                  {/* Valore sopra la colonna al click */}
                  {isSelected && (
                    <span className="absolute -top-5 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded shadow-xs whitespace-nowrap animate-fadeIn z-10">
                      {val} {val === 1 ? 'film' : 'film'}
                    </span>
                  )}
                  <div
                    className={`w-full max-w-[16px] rounded-t transition-all duration-300 ${
                      isSelected
                        ? 'bg-blue-600 ring-2 ring-blue-300'
                        : 'bg-blue-400 hover:bg-blue-500'
                    }`}
                    style={{ height: `${Math.max(4, pct)}%` }}
                  />
                  <span
                    className={`text-[9px] truncate w-full text-center ${
                      isSelected ? 'text-blue-600 font-extrabold' : 'text-slate-500 font-bold'
                    }`}
                  >
                    {t.period.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            message={`Nessun dato per l'anno ${selectedYear}.`}
            icon={<span className="text-2xl not-italic">📅</span>}
          />
        )}
      </div>

      {/* 3. Generi Preferiti & Piattaforme */}
      <div className="space-y-4">
        {/* Generi Preferiti */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>🎭</span>
            <span>Generi Preferiti (Top 5)</span>
          </h3>

          {genresDistribution.length > 0 ? (
            <div className="space-y-2.5">
              {genresDistribution.slice(0, 5).map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-24 text-xs font-bold text-slate-600 truncate">{g.genre}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-black text-blue-600">
                    {g.percentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nessun dato sufficiente sui generi dei film."
              icon={<span className="text-2xl not-italic">🎭</span>}
            />
          )}
        </div>

        {/* Piattaforme di Visione */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>📺</span>
            <span>Piattaforme di Visione & Cinema</span>
          </h3>

          {stats.platform_distribution && stats.platform_distribution.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {stats.platform_distribution.slice(0, 6).map((p, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 truncate">{p.platform}</span>
                    <span className="text-[11px] font-black text-purple-600">{p.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nessuna piattaforma registrata nei log."
              icon={<span className="text-2xl not-italic">📺</span>}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMovieStatsHabitsSection;
