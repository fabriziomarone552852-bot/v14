import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { StarRating } from '../SeriesDetailModal/StarRating';

interface Props {
  stats: TVFullStats;
}

export const RatingsStatsView: React.FC<Props> = ({ stats }) => {
  const [ratingsType, setRatingsType] = useState<'series' | 'episodes'>('series');

  return (
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
                    {(ratingsType === 'series' ? stats.series_ratings_distribution : stats.episode_ratings_distribution)?.map((r) => {
                       const distribution = ratingsType === 'series' ? stats.series_ratings_distribution : stats.episode_ratings_distribution;
                       const maxCount = Math.max(...(distribution || []).map((x)=>x.count));
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
                    {stats.top_10_series?.length > 0 ? stats.top_10_series.map((s, i) => (
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
                          .sort((a, b) => b.average_rating - a.average_rating)
                          .slice(0, 5)
                          .map((g, i) => (
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
  );
};
