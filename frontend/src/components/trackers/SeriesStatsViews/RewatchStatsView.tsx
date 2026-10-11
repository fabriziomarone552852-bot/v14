import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { StarRating } from '../SeriesDetailModal/StarRating';

interface Props {
  stats: TVFullStats;
}

export const RewatchStatsView: React.FC<Props> = ({ stats }) => {
  const [comfortZoneMode, setComfortZoneMode] = useState<'series' | 'episodes'>('series');

  return (
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
                    {(comfortZoneMode === 'series' ? stats.most_rewatched : stats.most_rewatched_episodes)?.length > 0 ? (comfortZoneMode === 'series' ? stats.most_rewatched : stats.most_rewatched_episodes).map((r, i) => (
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
                    {stats.guilty_pleasures?.length > 0 ? stats.guilty_pleasures.map((r, i) => (
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
  );
};
