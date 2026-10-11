import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { useSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { EditIcon } from '@/components/shared/utils/Icons';

interface Props {
  stats: TVFullStats;
}

export const HabitsStatsView: React.FC<Props> = ({ stats }) => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [habitViewMode, setHabitViewMode] = useState<'hours' | 'episodes'>('hours');

  const { data: statsData } = useSeriesStats();
  const { data: goalData, refetch: refetchGoal } = useQuery({
    queryKey: ['yearlyGoal', 'series', new Date().getFullYear()],
    queryFn: () => userGoalsApi.getYearlyGoal('series', new Date().getFullYear()),
  });

  const setGoalMutation = useMutation({
    mutationFn: (newGoal: number) => userGoalsApi.setYearlyGoal('series', new Date().getFullYear(), newGoal),
    onSuccess: () => refetchGoal()
  });

  const goal = goalData?.goal_value || 300;
  const currentEpisodes = statsData?.episodes_watched_this_year || 0;

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInputValue, setGoalInputValue] = useState("");

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

  return (
    <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              {/* Top Row: Last 7 Days & Monthly Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 shrink-0 h-52">
                <div 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 lg:col-span-1 flex flex-col h-full overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => setHabitViewMode(m => m === 'hours' ? 'episodes' : 'hours')}
                  title="Clicca per alternare Ore/Episodi"
                >
                  <h3 className="text-sm font-extrabold text-slate-800 mb-2 border-b border-slate-100 pb-1 shrink-0 select-none">
                    Ultimi 7 Giorni
                  </h3>
                  <div className="flex-1 overflow-hidden flex flex-col justify-around">
                    {stats.viewing_habits?.by_day && Object.entries(stats.viewing_habits.by_day as Record<string, number>).map(([day, count]) => {
                      const maxCount = Math.max(...Object.values(stats.viewing_habits.by_day) as number[]);
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      
                      let displayStr = '';
                      if (habitViewMode === 'hours') {
                        const h = Math.floor(count / 60);
                        const m = count % 60;
                        displayStr = count === 0 ? "0m" : (h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`);
                      } else {
                        displayStr = `${Math.round(count / 45)} ep`;
                      }
                      
                      return (
                        <div key={day} className="flex items-center gap-2">
                          <span className="w-24 text-xs font-bold text-slate-600 truncate" title={day}>{day}</span>
                          <div className="flex-1 h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-sm" style={{ width: `${pct}%`, opacity: Math.max(0.2, pct/100) }}></div>
                          </div>
                          <span className="w-12 text-right text-[10px] font-bold text-slate-400">{displayStr}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 lg:col-span-2 flex flex-col h-full overflow-hidden cursor-pointer hover:border-blue-300 transition-colors"
                  onClick={() => setHabitViewMode(m => m === 'hours' ? 'episodes' : 'hours')}
                  title="Clicca per alternare Ore/Episodi"
                >
                  <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1 shrink-0 group/goal">
                    <h3 className="text-sm font-extrabold text-slate-800 select-none">
                      Andamento Mensile {selectedYear}
                    </h3>
                    <div className="flex-1 flex items-center justify-center gap-2" onClick={e => e.stopPropagation()}>
                       <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                         Obiettivo annuale: {currentEpisodes}/
                         {isEditingGoal ? (
                           <input
                             autoFocus
                             type="number"
                             min={1}
                             className="w-16 px-1 py-0.5 border border-blue-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                             value={goalInputValue}
                             onChange={(e) => setGoalInputValue(e.target.value)}
                             onBlur={handleSaveGoal}
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                 handleSaveGoal();
                               } else if (e.key === 'Escape') {
                                 setIsEditingGoal(false);
                               }
                             }}
                           />
                         ) : (
                           <span>{goal}</span>
                         )}
                       </span>
                       {!isEditingGoal && (
                         <button onClick={handleEditGoal} className="opacity-0 group-hover/goal:opacity-100 text-blue-500 hover:text-blue-700 transition-opacity">
                           <EditIcon className="w-3 h-3" />
                         </button>
                       )}
                    </div>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                       <button onClick={() => setSelectedYear(y => (parseInt(y) - 1).toString())} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                       </button>
                       <button onClick={() => setSelectedYear(y => (parseInt(y) + 1).toString())} className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                       </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex items-end justify-between gap-1 pt-2">
                    {stats.time_trend?.[selectedYear] ? stats.time_trend[selectedYear].map((t) => {
                      const maxVal = Math.max(...(stats.time_trend[selectedYear] || []).map((x) => habitViewMode === 'hours' ? x.hours : x.episodes));
                      const val = habitViewMode === 'hours' ? t.hours : t.episodes;
                      const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                      return (
                        <div key={t.period} className="flex flex-col items-center gap-1 w-full group h-full justify-end relative">
                          <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4">{val}{habitViewMode === 'hours' ? 'h' : ' ep'}</span>
                          <div 
                            className="w-full max-w-[32px] bg-blue-400 rounded-t-sm transition-all duration-300 group-hover:bg-blue-500"
                            style={{ height: `${Math.max(2, pct)}%` }}
                          ></div>
                          <span className="text-xs font-bold text-slate-500 truncate w-full text-center">{t.period}</span>
                        </div>
                      )
                    }) : (
                      <div className="w-full flex justify-center pb-4"><EmptyState message="Nessun dato per questo anno." icon={<span className="not-italic text-xl">📅</span>} /></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Genres & Platforms */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 shrink-0">I Tuoi Generi Preferiti (Top 5)</h3>
                  <div className="flex-1 flex flex-col justify-around">
                    {stats.genres_distribution?.slice(0, 5).map((g, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-28 text-sm font-bold text-slate-600 truncate">{g.genre}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.percentage}%` }}></div>
                        </div>
                        <span className="w-12 text-right text-sm font-black text-blue-600">{g.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 shrink-0">Top Network</h3>
                  <div className="flex-1 flex flex-col justify-around">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {stats.platform_distribution?.slice(0, 8).map((p, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xl shrink-0 opacity-80">📺</span>
                          <div className="flex-1 overflow-hidden">
                            <span className="text-xs font-bold text-slate-600 truncate block">{p.platform}</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.percentage}%` }}></div>
                            </div>
                          </div>
                          <span className="text-xs font-black text-purple-600 shrink-0">{p.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
  );
};
