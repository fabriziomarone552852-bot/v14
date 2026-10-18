// src/mobile/components/trackers/stats/MobileStatsHabitsSection.tsx
import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { EditIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from './MobileStatsSectionHeader';

interface MobileStatsHabitsSectionProps {
  stats: TVFullStats;
}

export const MobileStatsHabitsSection: React.FC<MobileStatsHabitsSectionProps> = ({ stats }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [habitViewMode, setHabitViewMode] = useState<'hours' | 'episodes'>('hours');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const { data: statsData } = useSeriesStats();
  const { data: goalData, refetch: refetchGoal } = useQuery({
    queryKey: ['yearlyGoal', 'series', currentYear],
    queryFn: () => userGoalsApi.getYearlyGoal('series', currentYear),
  });

  const setGoalMutation = useMutation({
    mutationFn: (newGoal: number) => userGoalsApi.setYearlyGoal('series', currentYear, newGoal),
    onSuccess: () => refetchGoal(),
  });

  const goal = goalData?.goal_value || 300;
  const currentEpisodes = statsData?.episodes_watched_this_year || 0;

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

  // Dati ultimi 7 giorni
  const dayEntries = stats.viewing_habits?.by_day
    ? Object.entries(stats.viewing_habits.by_day as Record<string, number>)
    : [];
  const maxDayCount = Math.max(1, ...(stats.viewing_habits?.by_day ? (Object.values(stats.viewing_habits.by_day) as number[]) : [0]));

  // Dati mensili
  const monthlyTrend = stats.time_trend?.[selectedYear] || [];
  const maxMonthVal = Math.max(
    1,
    ...monthlyTrend.map((x) => (habitViewMode === 'hours' ? x.hours : x.episodes))
  );

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Abitudini di Visione" icon="⏱️" />

      {/* 1. Ultimi 7 Giorni */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Ultimi 7 Giorni
          </h3>
          <div className="bg-slate-100 rounded-full p-0.5 flex">
            <button
              type="button"
              onClick={() => setHabitViewMode('hours')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                habitViewMode === 'hours'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Ore
            </button>
            <button
              type="button"
              onClick={() => setHabitViewMode('episodes')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                habitViewMode === 'episodes'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Episodi
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {dayEntries.map(([day, count]) => {
            const pct = maxDayCount > 0 ? (count / maxDayCount) * 100 : 0;
            let displayStr = '';
            if (habitViewMode === 'hours') {
              const h = Math.floor(count / 60);
              const m = count % 60;
              displayStr = count === 0 ? '0m' : h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
            } else {
              displayStr = `${Math.round(count / 45)} ep`;
            }

            return (
              <div key={day} className="flex items-center gap-2">
                <span className="w-20 text-[11px] font-bold text-slate-600 truncate" title={day}>
                  {day}
                </span>
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, opacity: Math.max(0.3, pct / 100) }}
                  />
                </div>
                <span className="w-12 text-right text-[10px] font-bold text-slate-400">
                  {displayStr}
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

          {/* Frecce centrali senza bordo per cambiare anno */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => (parseInt(y, 10) - 1).toString())}
              className="p-1 text-slate-500 hover:text-slate-800 active:scale-90 transition-all text-base leading-none font-bold"
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
              className="p-1 text-slate-500 hover:text-slate-800 active:scale-90 transition-all text-base leading-none font-bold"
              aria-label="Anno successivo"
            >
              ›
            </button>
          </div>

          {/* Obiettivo annuale */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              Goal: {currentEpisodes}/
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
                className="text-blue-500 hover:text-blue-700 p-0.5"
                title="Modifica obiettivo"
              >
                <EditIcon className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Grafico Barre Mesi con interattività al click */}
        {monthlyTrend.length > 0 ? (
          <div className="h-36 flex items-end justify-between gap-1 pt-6 pb-1 relative">
            {monthlyTrend.map((t) => {
              const val = habitViewMode === 'hours' ? t.hours : t.episodes;
              const pct = maxMonthVal > 0 ? (val / maxMonthVal) * 100 : 0;
              const isSelected = selectedMonth === t.period;

              return (
                <div
                  key={t.period}
                  onClick={() => setSelectedMonth((curr) => (curr === t.period ? null : t.period))}
                  className="flex flex-col items-center gap-1 flex-1 h-full justify-end cursor-pointer relative"
                  title="Tocca per vedere i dettagli"
                >
                  {/* Valore sopra la colonna al click */}
                  {isSelected && (
                    <span className="absolute -top-5 text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200 px-1 py-0.5 rounded shadow-xs whitespace-nowrap animate-fadeIn z-10">
                      {val}{habitViewMode === 'hours' ? 'h' : ' ep'}
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

      {/* 3. Generi Preferiti & Top Network */}
      <div className="space-y-4">
        {/* Generi Preferiti */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>🎭</span>
            <span>Generi Preferiti (Top 5)</span>
          </h3>

          <div className="space-y-2.5">
            {stats.genres_distribution?.slice(0, 5).map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-24 text-xs font-bold text-slate-600 truncate">{g.genre}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.percentage}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-black text-blue-600">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Network */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
            <span>📺</span>
            <span>Top Network & Piattaforme</span>
          </h3>

          {stats.platform_distribution && stats.platform_distribution.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {stats.platform_distribution.slice(0, 6).map((p, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 truncate">{p.platform}</span>
                    <span className="text-[11px] font-black text-purple-600">{p.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              message="Nessuna piattaforma registrata."
              icon={<span className="text-2xl not-italic">📺</span>}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileStatsHabitsSection;
