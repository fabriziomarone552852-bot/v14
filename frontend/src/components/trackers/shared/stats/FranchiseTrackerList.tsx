import React, { useMemo } from 'react';
import type { Movie } from '@/types/movies';
import { useMovieExtras } from '@/hooks/queries/useMovieQueries';

export interface FranchiseData {
  collectionId: number;
  collectionName: string;
  posterPath: string | null;
  backdropPath: string | null;
  sampleMovieTmdbId: number;
  localWatchedCount: number;
  localTotalCount: number;
}

interface FranchiseRowProps {
  franchise: FranchiseData;
}

const FranchiseRow: React.FC<FranchiseRowProps> = ({ franchise }) => {
  const { data: extras } = useMovieExtras(franchise.sampleMovieTmdbId, true);

  const parts = extras?.collection?.parts;
  const totalCount = parts && parts.length > 0 ? parts.length : franchise.localTotalCount;
  const watchedCount =
    parts && parts.length > 0
      ? parts.filter((p) => p.is_watched).length
      : franchise.localWatchedCount;

  const effectiveTotal = Math.max(totalCount, watchedCount, 1);
  const percent = Math.min(100, Math.round((watchedCount / effectiveTotal) * 100));
  const isCompleted = watchedCount >= effectiveTotal && effectiveTotal > 0;

  const poster =
    franchise.posterPath || (extras?.collection?.poster_path ?? null);
  const posterUrl = poster
    ? poster.startsWith('http')
      ? poster
      : `https://image.tmdb.org/t/p/w185${poster}`
    : null;

  return (
    <div className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-colors flex gap-3 items-center">
      {/* Poster saga */}
      {posterUrl ? (
        <img
          src={posterUrl}
          alt={franchise.collectionName}
          className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-xs"
        />
      ) : (
        <div className="w-10 h-14 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-black text-base shrink-0">
          🎬
        </div>
      )}

      {/* Dettagli Saga */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2">
          <h4
            className="font-bold text-xs sm:text-sm text-slate-800 truncate"
            title={franchise.collectionName}
          >
            {franchise.collectionName}
          </h4>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`text-xs font-black px-2 py-0.5 rounded-md border ${
                isCompleted
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-blue-600 bg-blue-50 border-blue-100'
              }`}
            >
              {watchedCount}/{effectiveTotal}
            </span>
            {isCompleted && (
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mt-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export interface FranchiseTrackerListProps {
  movies: Movie[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
}

export const FranchiseTrackerList: React.FC<FranchiseTrackerListProps> = ({
  movies = [],
  title = 'Franchise Tracker',
  subtitle = 'Saghe e collezioni che stai seguendo',
  emptyMessage = 'Nessuna saga o franchise attualmente tracciato. Aggiungi film appartenenti a una collezione per monitorarne il completamento!',
  className = '',
}) => {
  const franchises = useMemo(() => {
    const map = new Map<number, FranchiseData>();

    movies.forEach((m) => {
      if (m.collection_id && m.collection_name) {
        const existing = map.get(m.collection_id) || {
          collectionId: m.collection_id,
          collectionName: m.collection_name,
          posterPath: m.collection_poster_path || m.poster_path || null,
          backdropPath: m.collection_backdrop_path || m.backdrop_path || null,
          sampleMovieTmdbId: m.tmdb_id,
          localWatchedCount: 0,
          localTotalCount: 0,
        };

        existing.localTotalCount += 1;
        if (m.status === 'watched') {
          existing.localWatchedCount += 1;
        }

        map.set(m.collection_id, existing);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const aPct = a.localTotalCount > 0 ? a.localWatchedCount / a.localTotalCount : 0;
      const bPct = b.localTotalCount > 0 ? b.localWatchedCount / b.localTotalCount : 0;
      if (bPct !== aPct) return bPct - aPct;
      return a.collectionName.localeCompare(b.collectionName);
    });
  }, [movies]);

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden text-left ${className}`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
            <span>🪐</span>
            <span>{title}</span>
          </h3>
          {subtitle && (
            <span className="text-xs text-slate-400 font-semibold">{subtitle}</span>
          )}
        </div>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {franchises.length} {franchises.length === 1 ? 'saga' : 'saghe'}
        </span>
      </div>

      {franchises.length > 0 ? (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {franchises.map((f) => (
            <FranchiseRow key={f.collectionId} franchise={f} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
          <span className="text-3xl mb-2">🎬</span>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default FranchiseTrackerList;
