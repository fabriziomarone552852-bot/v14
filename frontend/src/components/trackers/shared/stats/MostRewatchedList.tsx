import React from 'react';
import { StarRating } from '@/components/trackers/SeriesDetailModal/StarRating';

export interface MostRewatchedItem {
  title: string;
  rewatch_count: number;
  rating?: number | null;
}

export interface MostRewatchedListProps {
  items: MostRewatchedItem[];
  title?: string;
  subtitle?: string;
  badgeText?: string;
  countUnitSingular?: string;
  countUnitPlural?: string;
  rankingStyle?: 'number' | 'medal';
  emptyMessage?: string;
  className?: string;
}

export const MostRewatchedList: React.FC<MostRewatchedListProps> = ({
  items = [],
  title = 'I Più Riguardati (Rewatch)',
  subtitle = 'Le opere che hai visto più volte',
  badgeText,
  countUnitSingular = 'visione',
  countUnitPlural = 'visioni',
  rankingStyle = 'number',
  emptyMessage = 'Non hai ancora registrato nessun rewatch.',
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden ${className}`}
    >
      <div className="mb-4 border-b border-slate-100 pb-2 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
        {badgeText && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => {
            const rankLabel =
              rankingStyle === 'medal'
                ? index === 0
                  ? '🥇'
                  : index === 1
                  ? '🥈'
                  : index === 2
                  ? '🥉'
                  : '🛋️'
                : `#${index + 1}`;

            return (
              <div
                key={`${item.title}-${index}`}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-sm font-black text-slate-400 w-6 text-center shrink-0">
                    {rankLabel}
                  </span>
                  <div className="overflow-hidden">
                    <span
                      className="font-bold text-sm text-slate-800 truncate block"
                      title={item.title}
                    >
                      {item.title}
                    </span>
                    {typeof item.rating === 'number' && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarRating
                          value={Math.round(item.rating * 2) / 2}
                          readonly
                          hideNumber
                          iconClassName="w-3 h-3"
                        />
                        <span className="text-xs font-bold text-slate-500">
                          {item.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {item.rewatch_count}{' '}
                    {item.rewatch_count === 1 ? countUnitSingular : countUnitPlural}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 text-xs gap-2">
            <span className="text-3xl">🔁</span>
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MostRewatchedList;
