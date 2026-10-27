import React from 'react';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';

export interface TopMediaItem {
  title: string;
  rating: number;
}

export interface TopMediaRankingListProps {
  items: TopMediaItem[];
  title?: string;
  emptyMessage?: string;
  useStarGraphic?: boolean;
  className?: string;
}

export const TopMediaRankingList: React.FC<TopMediaRankingListProps> = ({
  items,
  title = 'Hall of Fame (Top 10)',
  emptyMessage = 'Nessun voto assegnato.',
  useStarGraphic = true,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden ${className}`}
    >
      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 shrink-0">
        {title}
      </h3>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
        {items && items.length > 0 ? (
          items.map((item, i) => (
            <div
              key={`${item.title}-${i}`}
              className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <span className="text-sm font-black text-slate-300 w-5 text-center shrink-0">
                  {i + 1}
                </span>
                <span
                  className="font-bold text-xs text-slate-700 truncate"
                  title={item.title}
                >
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {useStarGraphic && (
                  <StarRating
                    value={Math.round(item.rating * 2) / 2}
                    readonly
                    hideNumber
                    iconClassName="w-3.5 h-3.5"
                  />
                )}
                <span className="font-black text-amber-500 text-xs">
                  {item.rating.toFixed(1)} ★
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-xs text-slate-400 text-center p-4">
            <span className="text-2xl not-italic mb-2">⭐</span>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopMediaRankingList;
