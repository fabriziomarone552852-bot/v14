import React from 'react';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export interface GuiltyPleasureItem {
  title: string;
  rewatch_count: number;
  rating?: number | null;
}

export interface GuiltyPleasuresCardProps {
  title?: string;
  items?: GuiltyPleasureItem[];
  emptyMessage?: string;
  className?: string;
}

export const GuiltyPleasuresCard: React.FC<GuiltyPleasuresCardProps> = ({
  title = 'Il Test del Tempo',
  items = [],
  emptyMessage = 'Nessun guilty pleasure trovato.',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col overflow-hidden ${className}`}
    >
      <div className="border-b border-slate-100 pb-2 mb-4 shrink-0">
        <h3 className="text-lg font-extrabold text-slate-800">{title}</h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {items && items.length > 0 ? (
          items.map((r, i) => (
            <div
              key={`${r.title}-${i}`}
              className="flex items-center gap-3 bg-red-50 p-2 rounded-lg border border-red-100"
            >
              <span className="text-xl shrink-0">🙈</span>
              <div className="flex-1 overflow-hidden">
                <span className="text-sm font-bold text-red-900 truncate block">
                  {r.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  {r.rating !== undefined && r.rating !== null ? (
                    <>
                      <StarRating
                        value={r.rating}
                        readonly
                        hideNumber
                        iconClassName="w-3 h-3"
                      />
                      <span className="text-xs font-bold text-red-700">
                        {r.rating.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold text-red-400">---</span>
                  )}
                </div>
              </div>
              <span className="text-sm font-black text-red-600 shrink-0">
                x{r.rewatch_count}
              </span>
            </div>
          ))
        ) : (
          <EmptyState
            message={emptyMessage}
            icon={<span className="not-italic text-2xl">😇</span>}
          />
        )}
      </div>
    </div>
  );
};
