// src/mobile/components/trackers/stats/MobileStatsRatingsSection.tsx
import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from './MobileStatsSectionHeader';

interface MobileStatsRatingsSectionProps {
  stats: TVFullStats;
}

export const MobileStatsRatingsSection: React.FC<MobileStatsRatingsSectionProps> = ({ stats }) => {
  const [ratingsType, setRatingsType] = useState<'series' | 'episodes'>('series');

  const distribution = ratingsType === 'series'
    ? stats.series_ratings_distribution
    : stats.episode_ratings_distribution;

  const maxCount = Math.max(1, ...(distribution || []).map((x) => x.count));

  const sortedGenres = (stats.ratings_by_genre || [])
    .slice()
    .sort((a, b) => b.average_rating - a.average_rating)
    .slice(0, 4);

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Valutazioni & Voti" icon="⭐" />

      {/* 1. Il Profilo del Critico (Distribuzione Voti) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Il Profilo del Critico
          </h3>
          <div className="bg-slate-100 rounded-full p-0.5 flex">
            <button
              type="button"
              onClick={() => setRatingsType('series')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                ratingsType === 'series'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Serie
            </button>
            <button
              type="button"
              onClick={() => setRatingsType('episodes')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                ratingsType === 'episodes'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Episodi
            </button>
          </div>
        </div>

        {/* Grafico Barre Distribuzione */}
        <div className="h-36 flex items-end justify-between gap-1 pt-4 pb-1 px-1">
          {distribution?.map((r) => {
            const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
            return (
              <div
                key={r.rating}
                className="flex flex-col items-center gap-1 flex-1 h-full justify-end"
              >
                <span className="text-[10px] font-bold text-slate-400">
                  {r.count > 0 ? r.count : ''}
                </span>
                <div
                  className="w-full max-w-[20px] bg-amber-400 rounded-t transition-all duration-300"
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
                <span className="text-[10px] font-extrabold text-slate-600">
                  {r.rating}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Hall of Fame (Top 10 Serie Votate) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>🏆</span>
          <span>Hall of Fame (Top 10)</span>
        </h3>

        {stats.top_10_series && stats.top_10_series.length > 0 ? (
          <div className="space-y-1.5">
            {stats.top_10_series.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className={`text-xs font-black w-5 text-center ${
                      i === 0
                        ? 'text-amber-500'
                        : i === 1
                        ? 'text-slate-400'
                        : i === 2
                        ? 'text-amber-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-700 truncate">
                    {s.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <StarRating
                    value={Math.round(s.rating * 2) / 2}
                    readonly
                    hideNumber
                    iconClassName="w-3.5 h-3.5"
                  />
                  <span className="font-black text-amber-500 text-xs ml-1">
                    {s.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Nessun voto assegnato finora."
            icon={<span className="text-2xl not-italic">⭐</span>}
          />
        )}
      </div>

      {/* 3. Top Generi */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>🎭</span>
          <span>Top Generi</span>
        </h3>

        {sortedGenres.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {sortedGenres.map((g, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center"
              >
                <span className="font-bold text-xs text-slate-700 truncate max-w-full">
                  {g.genre}
                </span>
                <span className="font-black text-sm text-amber-500 mt-0.5">
                  {g.average_rating.toFixed(1)} ★
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Nessun dato sufficiente sui generi."
            icon={<span className="text-2xl not-italic">🎭</span>}
          />
        )}
      </div>
    </div>
  );
};

export default MobileStatsRatingsSection;
