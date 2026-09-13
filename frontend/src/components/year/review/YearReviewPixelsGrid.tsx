// frontend/src/components/year/review/YearReviewPixelsGrid.tsx
import React from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { Category } from '@/types/categories';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { MESI, pad, formatMoodName } from './useYearReviewPixelsLogic';

interface YearReviewPixelsGridProps {
  year: number;
  daysPerMonth: number[];
  entriesByDate: Map<string, DailyEntry>;
  categoriesById: Map<number, Category>;
  hoveredKey: string | null;
  setHoveredKey: (key: string | null) => void;
}

export const YearReviewPixelsGrid: React.FC<YearReviewPixelsGridProps> = ({
  year,
  daysPerMonth,
  entriesByDate,
  categoriesById,
  hoveredKey,
  setHoveredKey,
}) => {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs h-full overflow-hidden">
      {/* Riga Header: Mesi */}
      <div className="grid grid-cols-[24px_repeat(12,minmax(0,1fr))] gap-1 pb-1.5 border-b border-gray-100 text-center shrink-0">
        <div className="text-[10px] font-black text-gray-300 flex items-center justify-center select-none" />
        {MESI.map((m, idx) => (
          <div
            key={idx}
            title={m.full}
            className="text-[10px] xl:text-[11px] font-black text-gray-600 tracking-wider hover:text-blue-600 transition-colors"
          >
            {m.short}
          </div>
        ))}
      </div>

      {/* Righe dei Giorni 1..31 distribuite perfettamente nell'altezza */}
      <div className="flex-1 flex flex-col justify-between pt-1.5 pb-0.5 min-h-0 overflow-hidden">
        {Array.from({ length: 31 }, (_, dIdx) => {
          const dayNum = dIdx + 1;

          return (
            <div
              key={dayNum}
              className="grid grid-cols-[24px_repeat(12,minmax(0,1fr))] gap-1 items-center flex-1 min-h-0"
            >
              {/* Numero del giorno */}
              <div className="text-[9px] xl:text-[10px] font-bold text-gray-400 text-center select-none leading-none">
                {dayNum}
              </div>

              {/* 12 Colonne per i mesi */}
              {MESI.map((mObj, mIdx) => {
                const maxDays = daysPerMonth[mIdx];
                const exists = dayNum <= maxDays;

                if (!exists) {
                  return (
                    <div
                      key={mIdx}
                      className="aspect-square max-w-[17px] max-h-[17px] mx-auto w-full opacity-0 pointer-events-none"
                      aria-hidden="true"
                    />
                  );
                }

                const dateStr = `${year}-${pad(mIdx + 1)}-${pad(dayNum)}`;
                const entry = entriesByDate.get(dateStr);
                const cat = entry?.category_id ? categoriesById.get(entry.category_id) : null;
                const hasMood = Boolean(cat);
                const color = cat?.colore || null;
                const moodName = cat?.category_name || null;

                let formattedDisplayDate = `${dayNum} ${mObj.full}`;
                try {
                  const parsed = parseISO(dateStr);
                  formattedDisplayDate = format(parsed, 'EEEE d MMMM', { locale: it });
                  // Capitalize first letter
                  formattedDisplayDate = formattedDisplayDate.charAt(0).toUpperCase() + formattedDisplayDate.slice(1);
                } catch {
                  // fallback
                }

                const isHovered = hoveredKey === dateStr;

                // Posizionamento Smart del Popover per evitare overflow
                const popoverHAlignClass =
                  mIdx <= 1
                    ? 'left-0 translate-x-0'
                    : mIdx >= 10
                    ? 'right-0 left-auto translate-x-0'
                    : 'left-1/2 -translate-x-1/2';

                const popoverVAlignClass =
                  dayNum <= 4
                    ? 'top-full mt-1.5'
                    : 'bottom-full mb-1.5';

                return (
                  <div
                    key={mIdx}
                    className="relative flex items-center justify-center w-full h-full"
                    onMouseEnter={() => setHoveredKey(dateStr)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <div
                      style={hasMood && color ? { backgroundColor: color } : undefined}
                      className={`aspect-square max-w-[17px] max-h-[17px] w-full rounded-[2.5px] transition-transform duration-150 cursor-pointer ${
                        hasMood
                          ? 'shadow-2xs hover:scale-135 hover:z-30 hover:ring-2 hover:ring-offset-1 hover:ring-blue-500'
                          : 'bg-gray-100 hover:bg-gray-200 border border-gray-200/60 hover:scale-120 hover:z-20'
                      }`}
                    />

                    {/* POPOVER HOVER (NUVOLETTA STILE MONTH DAY CELL) */}
                    {isHovered && (
                      <div
                        className={`absolute ${popoverVAlignClass} ${popoverHAlignClass} pointer-events-none z-[1000] animate-fadeIn whitespace-nowrap`}
                      >
                        <div className="bg-gray-900/95 backdrop-blur-xs text-white rounded-xl shadow-2xl px-3 py-2 text-left border border-gray-800 flex flex-col gap-1 min-w-[140px]">
                          <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider border-b border-gray-800 pb-1">
                            {formattedDisplayDate}
                          </p>
                          <div className="flex items-center gap-2 text-xs pt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs border border-white/20"
                              style={{ backgroundColor: color || '#94a3b8' }}
                            />
                            <span className="text-gray-200 font-bold text-[11px] truncate">
                              {formatMoodName(moodName)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
