import React, { useState } from 'react';
import { useFullSeriesStats } from '@/hooks/queries/useTrackersQueries';
import { LoadingIcon } from '@/components/shared/utils/Icons';

interface SeriesStatsModalProps {
  onClose: () => void;
}

const SeriesStatsModal: React.FC<SeriesStatsModalProps> = ({ onClose }) => {
  const { data: stats, isLoading, isError } = useFullSeriesStats();
  const [activeTab, setActiveTab] = useState<'generale' | 'voti' | 'abitudini'>('generale');

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4">
          <LoadingIcon className="w-10 h-10 animate-spin text-blue-500" />
          <p className="font-bold text-gray-600">Elaborazione statistiche in corso...</p>
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-10 flex flex-col items-center gap-4">
          <p className="font-bold text-red-500">Errore durante il caricamento delle statistiche.</p>
          <button onClick={onClose} className="px-6 py-2 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600">Chiudi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-slate-50 w-full max-w-6xl max-h-[95vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Le Tue Statistiche</h2>
              <p className="text-xs sm:text-sm font-bold text-slate-500">Analizza le tue abitudini di visione</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 hover:text-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-2 bg-white border-b border-slate-200 shrink-0 overflow-x-auto custom-scrollbar">
          {['generale', 'voti', 'abitudini'].map(tab => (
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50">
          
          {activeTab === 'generale' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Tempo Totale</span>
                  <div className="text-3xl font-black text-blue-600 mb-1">{stats.total_watch_time?.days || 0}g {stats.total_watch_time?.hours || 0}h</div>
                  <span className="text-xs font-bold text-slate-500">passati davanti allo schermo</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Completamento</span>
                  <div className="text-3xl font-black text-green-500 mb-1">{stats.completion_rate?.percentage || 0}%</div>
                  <span className="text-xs font-bold text-slate-500">{stats.completion_rate?.completed || 0} finite, {stats.completion_rate?.dropped || 0} abbandonate</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Forecast</span>
                  <div className="text-xl font-black text-purple-600 mb-1">{stats.watchlist_forecast?.estimated_date ? new Date(stats.watchlist_forecast.estimated_date).toLocaleDateString('it-IT') : 'N/A'}</div>
                  <span className="text-xs font-bold text-slate-500">Data stimata di smaltimento lista</span>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Record Binge</span>
                  <div className="text-3xl font-black text-orange-500 mb-1">{stats.personal_records?.max_episodes_in_day || 0} ep.</div>
                  <span className="text-xs font-bold text-slate-500">in un solo giorno ({stats.personal_records?.max_episodes_day ? new Date(stats.personal_records.max_episodes_day).toLocaleDateString('it-IT') : '-'})</span>
                </div>
              </div>

              {/* Due colonne: Generi e Piattaforme */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Distribuzione Generi</h3>
                  <div className="space-y-3">
                    {stats.genres_distribution?.slice(0, 6).map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-bold text-slate-600 truncate">{g.genre}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${g.percentage}%` }}></div>
                        </div>
                        <span className="w-10 text-right text-sm font-black text-blue-600">{g.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Top Network (Piattaforme)</h3>
                  <div className="space-y-3">
                    {stats.platform_distribution?.slice(0, 6).map((p: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-bold text-slate-600 truncate">{p.platform}</span>
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p.percentage}%` }}></div>
                        </div>
                        <span className="w-10 text-right text-sm font-black text-purple-600">{p.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Il Cimitero delle Serie */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span>🪦 Il Cimitero delle Serie</span>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-full">{(stats.graveyard || []).length} Abbandonate</span>
                </h3>
                {stats.graveyard?.length > 0 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {stats.graveyard.map((g: any, i: number) => (
                      <div key={i} className="shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 w-48">
                        <p className="font-extrabold text-sm text-slate-700 truncate" title={g.title}>{g.title}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Abbandonata il: {g.abandoned_date ? new Date(g.abandoned_date).toLocaleDateString('it-IT') : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-slate-400 italic">Nessuna serie abbandonata. Sei un vero completista!</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'voti' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              {/* Distribuzione Voti & Top 10 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Il Profilo del Critico</h3>
                  <div className="h-64 flex items-end justify-center gap-4 pt-4">
                    {stats.ratings_distribution?.map((r: any) => (
                      <div key={r.rating} className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{r.count}</span>
                        <div 
                          className="w-full bg-amber-400 rounded-t-lg transition-all duration-500 group-hover:bg-amber-500" 
                          style={{ height: `${Math.max(4, (r.count / (Math.max(...(stats.ratings_distribution || []).map((x:any)=>x.count)) || 1)) * 100)}%` }}
                        ></div>
                        <span className="text-sm font-extrabold text-slate-600">{r.rating} ★</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Hall of Fame (Top 10)</h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {stats.top_10_series?.length > 0 ? stats.top_10_series.map((s: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className="text-lg font-black text-slate-300 w-6 text-center">{i + 1}</span>
                          <span className="font-bold text-sm text-slate-700 truncate">{s.title}</span>
                        </div>
                        <span className="font-black text-amber-500 shrink-0">{s.rating} ★</span>
                      </div>
                    )) : (
                      <p className="text-sm font-bold text-slate-400 italic text-center mt-10">Nessun voto assegnato.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Qualità vs Quantità (Media per Genere)</h3>
                  <div className="flex flex-wrap gap-3">
                    {stats.ratings_by_genre?.map((g: any, i: number) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{g.genre}</span>
                        <span className="text-xs font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{g.average_rating} ★</span>
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'abitudini' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Heatmap Giorni */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Giorni Preferiti</h3>
                  <div className="space-y-3">
                    {stats.viewing_habits?.by_day && Object.entries(stats.viewing_habits.by_day).map(([day, count]: [string, any]) => {
                      const maxCount = Math.max(...Object.values(stats.viewing_habits.by_day) as number[]);
                      const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={day} className="flex items-center gap-3">
                          <span className="w-24 text-sm font-bold text-slate-600">{day}</span>
                          <div className="flex-1 h-4 bg-slate-100 rounded-sm overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-sm" style={{ width: `${pct}%`, opacity: Math.max(0.2, pct/100) }}></div>
                          </div>
                          <span className="w-10 text-right text-xs font-bold text-slate-400">{count} ep.</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Heatmap Orari */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Fasce Orarie</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {stats.viewing_habits?.by_time && Object.entries(stats.viewing_habits.by_time).map(([time, count]: [string, any]) => (
                      <div key={time} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-sm font-extrabold text-slate-700 mb-2">{time}</span>
                        <span className="text-2xl font-black text-indigo-500">{count}</span>
                        <span className="text-xs font-bold text-slate-400">episodi</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Andamento nel Tempo */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                 <h3 className="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2">Andamento nel Tempo (Ultimi Mesi)</h3>
                 <div className="flex items-end gap-2 h-40 overflow-x-auto custom-scrollbar pt-4">
                    {stats.time_trend?.map((t: any) => {
                      const maxHrs = Math.max(...(stats.time_trend || []).map((x:any)=>x.hours));
                      const pct = maxHrs > 0 ? (t.hours / maxHrs) * 100 : 0;
                      return (
                        <div key={t.period} className="flex flex-col items-center gap-2 min-w-[40px] group">
                          <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6">{t.hours}h</span>
                          <div 
                            className="w-full bg-blue-400 rounded-t-sm transition-all duration-300 group-hover:bg-blue-500"
                            style={{ height: `${Math.max(5, pct)}%` }}
                          ></div>
                          <span className="text-[10px] font-bold text-slate-500 -rotate-45 origin-top-left mt-2">{t.period}</span>
                        </div>
                      )
                    })}
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
