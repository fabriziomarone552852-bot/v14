// src/mobile/components/trackers/stats/MobileStatsRewatchSection.tsx
import React, { useState } from 'react';
import type { TVFullStats } from '@/types/trackers';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from './MobileStatsSectionHeader';

interface MobileStatsRewatchSectionProps {
  stats: TVFullStats;
}

export const MobileStatsRewatchSection: React.FC<MobileStatsRewatchSectionProps> = ({ stats }) => {
  const [comfortZoneMode, setComfortZoneMode] = useState<'series' | 'episodes'>('series');

  const rewatchList = comfortZoneMode === 'series'
    ? stats.most_rewatched
    : stats.most_rewatched_episodes;

  const explorationHours = stats.rewatch_comparison?.first_watch_hours || 0;
  const nostalgiaHours = stats.rewatch_comparison?.rewatch_hours || 0;
  const totalCompareHours = explorationHours + nostalgiaHours;
  const explorationPct = totalCompareHours > 0 ? (explorationHours / totalCompareHours) * 100 : 50;

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Rewatch & Fedeltà" icon="🔁" />

      {/* 1. Comfort Zone */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
            Comfort Zone
          </h3>
          <div className="bg-slate-100 rounded-full p-0.5 flex">
            <button
              type="button"
              onClick={() => setComfortZoneMode('series')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                comfortZoneMode === 'series'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Serie
            </button>
            <button
              type="button"
              onClick={() => setComfortZoneMode('episodes')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                comfortZoneMode === 'episodes'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Episodi
            </button>
          </div>
        </div>

        {rewatchList && rewatchList.length > 0 ? (
          <div className="space-y-2">
            {rewatchList.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
              >
                <span className="text-base shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🛋️'}
                </span>
                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-xs font-bold text-slate-700 truncate block">
                    {r.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {r.rating !== undefined && r.rating !== null ? (
                      <>
                        <StarRating value={r.rating} readonly hideNumber iconClassName="w-3 h-3" />
                        <span className="text-[10px] font-bold text-slate-500">
                          {r.rating.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">---</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                  x{r.rewatch_count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Nessun rewatch registrato finora."
            icon={<span className="text-2xl not-italic">🛋️</span>}
          />
        )}
      </div>

      {/* 2. Il Test del Tempo (Guilty Pleasures) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>🙈</span>
          <span>Il Test del Tempo</span>
        </h3>

        {stats.guilty_pleasures && stats.guilty_pleasures.length > 0 ? (
          <div className="space-y-2">
            {stats.guilty_pleasures.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-red-50/60 p-2.5 rounded-xl border border-red-100"
              >
                <span className="text-base shrink-0">🙈</span>
                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-xs font-bold text-red-900 truncate block">
                    {r.title}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {r.rating !== undefined && r.rating !== null ? (
                      <>
                        <StarRating value={r.rating} readonly hideNumber iconClassName="w-3 h-3" />
                        <span className="text-[10px] font-bold text-red-700">
                          {r.rating.toFixed(1)}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-red-400">---</span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-red-600 bg-red-100/60 px-2 py-0.5 rounded-full shrink-0">
                  x{r.rewatch_count}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            message="Nessun guilty pleasure trovato."
            icon={<span className="text-2xl not-italic">🙈</span>}
          />
        )}
      </div>

      {/* 3. Esplorazione vs Nostalgia */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
          <span>🧭</span>
          <span>Esplorazione vs Nostalgia</span>
        </h3>

        {totalCompareHours > 0 ? (
          <div className="flex flex-col items-center">
            {/* Ciambella Gradient */}
            <div
              className="w-32 h-32 rounded-full relative shadow-inner flex items-center justify-center my-3"
              style={{
                background: `conic-gradient(#3b82f6 ${explorationPct}%, #a855f7 0)`,
              }}
            >
              <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center">
                <span className="text-2xl">🧭</span>
              </div>
            </div>

            {/* Indicatori Ore */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2">
              <div className="bg-blue-50 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 truncate">Esplorazione</span>
                </div>
                <span className="font-black text-xs text-blue-600 shrink-0 ml-1">
                  {explorationHours}h
                </span>
              </div>

              <div className="bg-purple-50 p-2.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 truncate">Nostalgia</span>
                </div>
                <span className="font-black text-xs text-purple-600 shrink-0 ml-1">
                  {nostalgiaHours}h
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-bold">
            Non hai ancora registrato tempo sufficiente.
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileStatsRewatchSection;
