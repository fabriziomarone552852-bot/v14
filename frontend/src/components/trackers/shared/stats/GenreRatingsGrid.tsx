import React from 'react';

export interface GenreRatingItem {
  genre: string;
  average_rating: number;
}

export interface GenreRatingsGridProps {
  ratingsByGenre: GenreRatingItem[];
  title?: string;
  limit?: number;
  emptyMessage?: string;
  className?: string;
}

export const GenreRatingsGrid: React.FC<GenreRatingsGridProps> = ({
  ratingsByGenre,
  title = 'Voto Medio per Genere',
  limit,
  emptyMessage = 'Nessun dato sufficiente sui generi.',
  className = '',
}) => {
  const sorted = [...(ratingsByGenre || [])].sort(
    (a, b) => b.average_rating - a.average_rating
  );
  const items = typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;

  if (items.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 shrink-0 ${className}`}
      >
        <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-3 border-b border-slate-100 pb-2 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex flex-col items-center justify-center py-4 text-center text-slate-400 text-xs">
          <span className="text-2xl not-italic mb-1">🎭</span>
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-200 shrink-0 ${className}`}
    >
      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-3 border-b border-slate-100 pb-2 uppercase tracking-wider">
        {title}
      </h3>
      <div className="flex flex-wrap gap-3.5 w-full">
        {items.map((g) => (
          <div
            key={g.genre}
            className="flex-1 min-w-[130px] p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col items-center justify-center text-center hover:border-slate-300 transition-colors shadow-2xs"
          >
            <span className="text-xs sm:text-sm font-bold text-slate-700 truncate w-full" title={g.genre}>
              {g.genre}
            </span>
            <span className="text-base sm:text-lg font-black text-amber-500 mt-1">
              {g.average_rating.toFixed(1)} ★
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenreRatingsGrid;
