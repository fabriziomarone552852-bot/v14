import React, { useState } from 'react';
import { useFullSeriesStats, useSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { StarRating } from './SeriesDetailModal/StarRating';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userGoalsApi } from '@/api/userGoalsApi';
import { EditIcon } from '@/components/shared/utils/Icons';
interface SeriesStatsModalProps {
  onClose: () => void;
}

const SeriesStatsModal: React.FC<SeriesStatsModalProps> = ({ onClose }) => {
  const { data: stats, isLoading, isError } = useFullSeriesStats();
  const [activeTab, setActiveTab] = useState<'generale' | 'voti' | 'abitudini' | 'rewatch'>('generale');
  const [ratingsType, setRatingsType] = useState<'series' | 'episodes'>('series');
  const [comfortZoneMode, setComfortZoneMode] = useState<'series' | 'episodes'>('series');
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10">
          <LoadingIcon className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-gray-600">Elaborazione statistiche in corso...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl p-10 flex flex-col items-center gap-4 z-10">
          <p className="font-bold text-red-500">Errore durante il caricamento delle statistiche.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600">Chiudi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Shell */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-fadeIn z-10 pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
            Statistiche
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
          {['generale', 'voti', 'abitudini', 'rewatch'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-t-xl font-bold text-sm transition-colors uppercase tracking-wider whitespace-nowrap ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50 flex flex-col">
          
          {activeTab === 'generale' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tempo Totale</span>
                  <div className="text-3xl font-black text-blue-600 mb-1">{stats.total_watch_time?.days || 0}G {stats.total_watch_time?.hours || 0}H</div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">GUARDANDO SERIE</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Completamento</span>
                  <div className="text-3xl font-black text-green-500 mb-1">{stats.completion_rate?.percentage || 0}%</div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{stats.completion_rate?.completed || 0} FINITE, {stats.completion_rate?.dropped || 0} ABBANDONATE</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Proiezioni Future</span>
                  <div className="text-xl font-black text-purple-600 mb-1">{stats.watchlist_forecast?.estimated_date ? new Date(stats.watchlist_forecast.estimated_date).toLocaleDateString('it-IT') : 'N/A'}</div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DATA DI COMPLETAMENTO LISTA AL TUO RITMO ATTUALE</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Binge record</span>
                  <div className="text-3xl font-black text-orange-500 mb-1">{stats.personal_records?.max_episodes_in_day || 0} EP.</div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SOLO IL {stats.personal_records?.max_episodes_day ? new Date(stats.personal_records.max_episodes_day).toLocaleDateString('it-IT') : '-'}</span>
                </div>
              </div>

              {/* Nuove Righe Generale - Due colonne */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Colonna Sinistra */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col gap-5">
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">Episodi guardati negli ultimi 30 giorni:</span>
                      <span className="text-lg font-black text-blue-500">{stats.general_stats?.episodes_last_month || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-600 text-xs uppercase tracking-wider">Episodi guardati negli ultimi 365 giorni:</span>
                      <span className="text-lg font-black text-blue-500">{stats.general_stats?.episodes_last_year || 0}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {/* Intestazione Colonne */}
                    <div className="grid grid-cols-3 items-center px-2 pb-1">
                      <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Serie</span>
                      <span className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider leading-tight">Negli ultimi<br/>30 giorni</span>
                      <span className="text-center font-bold text-slate-400 text-[10px] uppercase tracking-wider leading-tight">Negli ultimi<br/>365 giorni</span>
                    </div>

                    <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Completate</span>
                      <span className="text-center font-black text-green-500 text-sm">{stats.general_stats?.series_completed_last_month || 0}</span>
                      <span className="text-center font-black text-green-500 text-sm">{stats.general_stats?.series_completed_last_year || 0}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">In Visione</span>
                      <span className="text-center font-black text-amber-500 text-sm">{stats.general_stats?.series_watching_last_month || 0}</span>
                      <span className="text-center font-black text-amber-500 text-sm">{stats.general_stats?.series_watching_last_year || 0}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">In Attesa</span>
                      <span className="text-center font-black text-slate-400 text-sm">{stats.general_stats?.series_to_watch_last_month || 0}</span>
                      <span className="text-center font-black text-slate-400 text-sm">{stats.general_stats?.series_to_watch_last_year || 0}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Abbandonate</span>
                      <span className="text-center font-black text-red-500 text-sm">{stats.general_stats?.series_dropped_last_month || 0}</span>
                      <span className="text-center font-black text-red-500 text-sm">{stats.general_stats?.series_dropped_last_year || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Colonna Destra: Il Cimitero delle Serie */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2 shrink-0">
                    <span>👻 Il Cimitero delle Serie</span>
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{(stats.graveyard || []).length}</span>
                  </h3>
                  {stats.graveyard?.length > 0 ? (
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                      {stats.graveyard.map((g: any, i: number) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center">
                          <span className="font-extrabold text-sm text-slate-700 truncate" title={g.title}>{g.title}</span>
                          <span className="text-xs font-bold text-slate-400 shrink-0">{g.abandoned_date ? new Date(g.abandoned_date).toLocaleDateString('it-IT') : 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="Nessuna serie abbandonata. Sei un vero completista!" icon={<span className="text-2xl not-italic">🏆</span>} />
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voti' && (
            <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              {/* Distribuzione Voti & Top 10 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2 shrink-0">
                    <h3 className="text-lg font-extrabold text-slate-800">Il Profilo del Critico</h3>
                    <div className="bg-slate-100 rounded-full p-1 flex">
                      <button 
                        onClick={() => setRatingsType('series')} 
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${ratingsType === 'series' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        Serie
                      </button>
                      <button 
                        onClick={() => setRatingsType('episodes')} 
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${ratingsType === 'episodes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                      >
                        Episodi
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 flex items-end justify-center gap-1 sm:gap-2 pt-2">
                    {(ratingsType === 'series' ? stats.series_ratings_distribution : stats.episode_ratings_distribution)?.map((r: any) => {
                       const distribution = ratingsType === 'series' ? stats.series_ratings_distribution : stats.episode_ratings_distribution;
                       const maxCount = Math.max(...(distribution || []).map((x:any)=>x.count));
                       return (
                        <div key={r.rating} className="flex flex-col items-center gap-1 flex-1 group h-full justify-end max-w-[40px]">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{r.count}</span>
                          <div 
                            className="w-full bg-amber-400 rounded-t-sm sm:rounded-t-lg transition-all duration-500 group-hover:bg-amber-500" 
                            style={{ height: `${Math.max(4, (r.count / (maxCount || 1)) * 100)}%` }}
                          ></div>
                          <span className="text-[10px] sm:text-xs font-extrabold text-slate-600">{r.rating}</span>
                        </div>
                       )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 shrink-0">Hall of Fame (Top 10)</h3>
                  <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-1">
                    {stats.top_10_series?.length > 0 ? stats.top_10_series.map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-sm font-black text-slate-300 w-5 text-center">{i + 1}</span>
                          <span className="font-bold text-xs text-slate-700 truncate">{s.title}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <StarRating value={Math.round(s.rating * 2) / 2} readonly hideNumber iconClassName="w-4 h-4" />
                          <span className="font-black text-amber-500 text-xs ml-1">{s.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    )) : (
                      <EmptyState message="Nessun voto assegnato." icon={<span className="text-2xl not-italic">⭐</span>} />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 shrink-0">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-3 border-b border-slate-100 pb-2">Top 5 Generi (Per Voto Medio)</h3>
                  <div className="w-full pt-1">
                    {stats.ratings_by_genre?.length > 0 ? (
                      <div className="flex flex-wrap gap-4 w-full">
                        {stats.ratings_by_genre
                          .sort((a: any, b: any) => b.average_rating - a.average_rating)
                          .slice(0, 5)
                          .map((g: any, i: number) => (
                          <div key={i} className="flex-1 min-w-[140px] bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                            <h4 className="font-bold text-sm text-slate-700 mb-1">{g.genre}</h4>
                            <span className="font-black text-lg text-amber-500">{g.average_rating.toFixed(1)} ★</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="w-full flex justify-center py-2">
                        <EmptyState message="Nessun dato sufficiente sui generi." icon={<span className="text-2xl not-italic">🎭</span>} />
                      </div>
                    )}
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'abitudini' && (
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
                    {stats.viewing_habits?.by_day && Object.entries(stats.viewing_habits.by_day).map(([day, count]: [string, any]) => {
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
                    {stats.time_trend?.[selectedYear] ? stats.time_trend[selectedYear].map((t: any) => {
                      const maxVal = Math.max(...(stats.time_trend[selectedYear] || []).map((x:any) => habitViewMode === 'hours' ? x.hours : x.episodes));
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
                    {stats.genres_distribution?.slice(0, 5).map((g: any, i: number) => (
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
                      {stats.platform_distribution?.slice(0, 8).map((p: any, i: number) => (
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
          )}

          {activeTab === 'rewatch' && (
            <div className="gap-6 animate-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Comfort Zone */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-1 flex flex-col overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-4 shrink-0">
                    <h3 className="text-lg font-extrabold text-slate-800">Comfort Zone</h3>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 shrink-0">
                      <button
                        onClick={() => setComfortZoneMode('series')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${comfortZoneMode === 'series' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Serie
                      </button>
                      <button
                        onClick={() => setComfortZoneMode('episodes')}
                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${comfortZoneMode === 'episodes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Episodi
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {(comfortZoneMode === 'series' ? stats.most_rewatched : stats.most_rewatched_episodes)?.length > 0 ? (comfortZoneMode === 'series' ? stats.most_rewatched : stats.most_rewatched_episodes).map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-xl shrink-0">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🛋️'}</span>
                        <div className="flex-1 overflow-hidden">
                          <span className="text-sm font-bold text-slate-700 truncate block">{r.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {r.rating !== undefined && r.rating !== null ? (
                              <>
                                <StarRating value={r.rating} readonly hideNumber iconClassName="w-3 h-3" />
                                <span className="text-xs font-bold text-slate-500">{r.rating.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-slate-400">---</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-black text-indigo-600 shrink-0">x{r.rewatch_count}</span>
                      </div>
                    )) : (
                       <EmptyState message="Nessun dato." />
                    )}
                  </div>
                </div>

                {/* Il Test del Tempo */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-1 flex flex-col overflow-hidden">
                  <div className="border-b border-slate-100 pb-2 mb-4 shrink-0">
                    <h3 className="text-lg font-extrabold text-slate-800">Il Test del Tempo</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {stats.guilty_pleasures?.length > 0 ? stats.guilty_pleasures.map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 bg-red-50 p-2 rounded-lg border border-red-100">
                        <span className="text-xl shrink-0">🙈</span>
                        <div className="flex-1 overflow-hidden">
                          <span className="text-sm font-bold text-red-900 truncate block">{r.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            {r.rating !== undefined && r.rating !== null ? (
                              <>
                                <StarRating value={r.rating} readonly hideNumber iconClassName="w-3 h-3" />
                                <span className="text-xs font-bold text-red-700">{r.rating.toFixed(1)}</span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-red-400">---</span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-black text-red-600 shrink-0">x{r.rewatch_count}</span>
                      </div>
                    )) : (
                      <EmptyState message="Nessun guilty pleasure trovato." icon={<span className="not-italic text-2xl">😇</span>} />
                    )}
                  </div>
                </div>

                {/* Esplorazione vs Nostalgia */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 lg:col-span-1 flex flex-col justify-center items-center overflow-hidden">
                  <div className="border-b border-slate-100 pb-2 mb-6 w-full text-left shrink-0">
                    <h3 className="text-lg font-extrabold text-slate-800">Esplorazione vs Nostalgia</h3>
                  </div>
                  
                  <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[200px]">
                    {stats.rewatch_comparison && (stats.rewatch_comparison.first_watch_hours > 0 || stats.rewatch_comparison.rewatch_hours > 0) ? (
                      <div className="w-48 h-48 rounded-full relative shadow-inner overflow-hidden mb-6" style={{
                        background: `conic-gradient(#3b82f6 ${(stats.rewatch_comparison.first_watch_hours / (stats.rewatch_comparison.first_watch_hours + stats.rewatch_comparison.rewatch_hours)) * 100}%, #a855f7 0)`
                      }}>
                        <div className="absolute inset-4 bg-white rounded-full shadow-sm flex items-center justify-center">
                          <span className="text-3xl">🧭</span>
                        </div>
                      </div>
                    ) : (
                      <EmptyState message="Non hai ancora registrato tempo." />
                    )}
                    
                    <div className="w-full space-y-3 shrink-0">
                      <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-bold text-slate-700">Esplorazione</span>
                        </div>
                        <span className="font-black text-blue-600">{stats.rewatch_comparison?.first_watch_hours || 0}h</span>
                      </div>
                      <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          <span className="text-sm font-bold text-slate-700">Nostalgia</span>
                        </div>
                        <span className="font-black text-purple-600">{stats.rewatch_comparison?.rewatch_hours || 0}h</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SeriesStatsModal;
