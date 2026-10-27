import React from 'react';

export interface RatingDistributionItem {
  rating: number;
  count: number;
}

export interface CriticRatingDistributionChartProps {
  distribution: RatingDistributionItem[];
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  showStarIcon?: boolean;
  barColorClass?: string;
  barHoverColorClass?: string;
  className?: string;
}

export const CriticRatingDistributionChart: React.FC<CriticRatingDistributionChartProps> = ({
  distribution,
  title = 'Il Profilo del Critico',
  subtitle,
  headerRight,
  showStarIcon = false,
  barColorClass = 'bg-amber-400',
  barHoverColorClass = 'group-hover:bg-amber-500',
  className = '',
}) => {
  const maxCount = Math.max(...(distribution || []).map((x) => x.count), 1);
  const totalVotes = (distribution || []).reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full ${className}`}
    >
      <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2 shrink-0">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">{title}</h3>
          {subtitle && (
            <span className="text-xs text-slate-400 font-semibold">{subtitle}</span>
          )}
        </div>
        {headerRight}
      </div>

      {totalVotes === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-slate-400 p-6">
          <span className="text-3xl mb-2">📊</span>
          Nessuna valutazione registrata al momento.
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-end justify-center gap-1 sm:gap-2 pt-2">
          {distribution.map((r) => {
            const pct = maxCount > 0 ? (r.count / maxCount) * 100 : 0;
            return (
              <div
                key={r.rating}
                className="flex flex-col items-center gap-1 flex-1 group h-full justify-end max-w-[40px] sm:max-w-[48px]"
              >
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {r.count}
                </span>
                <div
                  className={`w-full rounded-t-sm sm:rounded-t-lg transition-all duration-500 ${barColorClass} ${barHoverColorClass}`}
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
                <span className="text-[10px] sm:text-xs font-extrabold text-slate-600 flex items-center gap-0.5">
                  {r.rating}
                  {showStarIcon && <span className="text-amber-500 text-[10px]">★</span>}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CriticRatingDistributionChart;
