import React from 'react';

export interface CalendarDayWatchItem {
  id: string | number;
  title: string;
  subtitle?: string | null;
  posterPath?: string | null;
  rating?: number | null;
  platformName?: string | null;
  notes?: string | null;
  badgeText?: string | null;
}

export interface CalendarDayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayNumber: number;
  monthName: string;
  year: number;
  itemTypeLabelSingular?: string;
  itemTypeLabelPlural?: string;
  items: CalendarDayWatchItem[];
}

const getPosterUrl = (path: string | null | undefined) => {
  if (!path) return null;
  return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/w200${path}`;
};

export const CalendarDayDetailModal: React.FC<CalendarDayDetailModalProps> = ({
  isOpen,
  onClose,
  dayNumber,
  monthName,
  year,
  itemTypeLabelSingular = 'visione registrata',
  itemTypeLabelPlural = 'visioni registrate',
  items = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 z-10 flex flex-col gap-4 animate-fadeIn border border-slate-200 max-h-[85vh] overflow-hidden text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-800">
              Visioni di {dayNumber} {monthName} {year}
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              {items.length}{' '}
              {items.length === 1 ? itemTypeLabelSingular : itemTypeLabelPlural}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Chiudi dettaglio visioni"
          >
            ✕
          </button>
        </div>

        {/* Lista visioni */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 custom-scrollbar pr-1">
          {items.map((item, idx) => {
            const poster = getPosterUrl(item.posterPath);
            return (
              <div
                key={`detail-${idx}-${item.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors"
              >
                {poster ? (
                  <img
                    src={poster}
                    alt=""
                    className="w-10 h-14 object-cover rounded-lg shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-400">
                    🎬
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-slate-800 truncate">
                    {item.title}
                  </h4>
                  {item.subtitle && (
                    <p className="text-xs font-semibold text-slate-500 truncate">
                      {item.subtitle}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {item.rating !== undefined && item.rating !== null && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                        ★ {item.rating}/10
                      </span>
                    )}
                    {item.platformName && (
                      <span className="text-[9px] font-bold uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">
                        {item.platformName}
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-slate-600 bg-white p-2 rounded-lg mt-1 italic border border-slate-100">
                      &ldquo;{item.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default CalendarDayDetailModal;
