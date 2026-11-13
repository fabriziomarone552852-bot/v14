// src/mobile/components/trackers/stats/MobileMovieStatsRewatchSection.tsx
import React, { useMemo } from 'react';
import type { MovieFullStats } from '@/types/movies';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { StarRating } from '@/components/trackers/shared/detail/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileStatsSectionHeader } from '../../shared/stats/MobileStatsSectionHeader';

interface MobileMovieStatsRewatchSectionProps {
  stats: MovieFullStats;
}

export const MobileMovieStatsRewatchSection: React.FC<MobileMovieStatsRewatchSectionProps> = ({
  stats,
}) => {
  const { data: myMovies = [] } = useMyMovies();

  // Calcolo locale di fallback in RAM per rewatch e guilty pleasures
  const fallbackData = useMemo(() => {
    let firstMins = 0;
    let rewatchMins = 0;
    const rewatchedList: { title: string; rewatch_count: number; rating?: number | null }[] = [];
    const guiltyList: { title: string; rewatch_count: number; rating: number }[] = [];

    myMovies.forEach((m) => {
      const watchCount = m.watch_count || (m.status === 'watched' ? 1 : 0);
      const runtime = m.runtime || 100;

      if (watchCount > 0) {
        firstMins += runtime;
      }

      if (watchCount > 1) {
        rewatchMins += (watchCount - 1) * runtime;
        const rating = m.my_rating ?? null;
        rewatchedList.push({
          title: m.title,
          rewatch_count: watchCount,
          rating,
        });

        if (rating !== null && rating !== undefined) {
          guiltyList.push({
            title: m.title,
            rewatch_count: watchCount,
            rating,
          });
        }
      }
    });

    rewatchedList.sort((a, b) => b.rewatch_count - a.rewatch_count);
    guiltyList.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));

    return {
      rewatched: rewatchedList.slice(0, 10),
      guilty: guiltyList.slice(0, 5),
      firstWatchHours: Math.round((firstMins / 60) * 10) / 10,
      rewatchHours: Math.round((rewatchMins / 60) * 10) / 10,
    };
  }, [myMovies]);

  const rewatchList =
    stats.most_rewatched && stats.most_rewatched.length > 0
      ? stats.most_rewatched
      : fallbackData.rewatched;

  const guiltyPleasures =
    stats.guilty_pleasures && stats.guilty_pleasures.length > 0
      ? stats.guilty_pleasures
      : fallbackData.guilty;

  const explorationHours =
    stats.rewatch_comparison?.first_watch_hours ?? fallbackData.firstWatchHours;
  const nostalgiaHours =
    stats.rewatch_comparison?.rewatch_hours ?? fallbackData.rewatchHours;

  const totalCompareHours = explorationHours + nostalgiaHours;
  const explorationPct =
    totalCompareHours > 0 ? (explorationHours / totalCompareHours) * 100 : 50;

  return (
    <div className="space-y-5">
      <MobileStatsSectionHeader title="Rewatch & Fedeltà" icon="🔁" />

      {/* 1. Comfort Zone (Film più visti) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
          Comfort Zone
        </h3>

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
            message="Nessun rewatch di film registrato finora."
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

        {guiltyPleasures && guiltyPleasures.length > 0 ? (
          <div className="space-y-2">
            {guiltyPleasures.map((r, i) => (
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
            message="Nessun guilty pleasure trovato tra i film."
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
          <EmptyState
            message="Non hai ancora registrato tempo sufficiente di visione."
            icon={<span className="text-2xl not-italic">🧭</span>}
          />
        )}
      </div>
    </div>
  );
};

export default MobileMovieStatsRewatchSection;
