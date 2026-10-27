import React from 'react';

export interface GenreDistributionItem {
  genre: string;
  percentage: number;
  count?: number;
}

export interface GenreDistributionListProps {
  distribution: GenreDistributionItem[];
  title?: string;
  limit?: number;
  barColorClass?: string;
  emptyMessage?: string;
  className?: string;
}

export const GenreDistributionList: React.FC<GenreDistributionListProps> = ({
  distribution = [],
  title = 'I Tuoi Generi Preferiti (Top 5)',
  limit = 5,
  barColorClass = 'bg-blue-500',
  emptyMessage = 'Nessun dato sufficiente sui generi guardati.',
  className = '',
}) => {
  const items = typeof limit === 'number' && limit > 0 ? distribution.slice(0, limit) : distribution;

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden text-left ${className}`}
    >
      <h3 className="text-base sm:text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-2 shrink-0">
        {title}
      </h3>

      {items.length > 0 ? (
        <div className="flex-1 flex flex-col justify-around py-1">
          {items.map((g, i) => (
            <div key={`${g.genre}-${i}`} className="flex items-center gap-3">
              <span
                className="w-28 text-xs sm:text-sm font-bold text-slate-700 truncate"
                title={g.genre}
              >
                {g.genre}
              </span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColorClass} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, g.percentage))}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs sm:text-sm font-black text-blue-600 shrink-0">
                {g.percentage}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
          <span className="text-3xl mb-2">🎭</span>
          <p>{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default GenreDistributionList;
