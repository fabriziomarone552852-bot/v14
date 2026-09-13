// src/mobile/components/modals/review/YearReviewPixelsRecap.tsx
import React from 'react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import type { Category } from '@/types/categories';
import type { DailyEntry } from '@/types/dailyentries';
import { MESI_PIXELS, pad, formatMoodName } from './yearReview.utils';

interface YearReviewPixelsRecapProps {
  year: number;
  daysPerMonth: number[];
  entriesByDate: Map<string, DailyEntry>;
  categoriesById: Map<number, Category>;
  selectedPixelInfo: { date: string; moodName: string; color: string } | null;
  onPixelClick: (dateStr: string, moodName: string, color: string) => void;
}

export const YearReviewPixelsRecap: React.FC<YearReviewPixelsRecapProps> = ({
  year,
  daysPerMonth,
  entriesByDate,
  categoriesById,
  selectedPixelInfo,
  onPixelClick,
}) => {
  return (
    <div className="flex-1 min-h-0 p-2 sm:p-3 pb-[max(env(safe-area-inset-bottom,0px),10px)] flex flex-col justify-center overflow-hidden">
      {/* Griglia Completa Anno in Pixel (12 Mesi x 31 Giorni) */}
      <div className="relative bg-white rounded-2xl p-2 sm:p-2.5 border border-gray-200/90 shadow-2xs flex flex-col h-full max-h-full justify-between overflow-hidden">
        {/* Header Mesi */}
        <div className="grid grid-cols-[18px_repeat(12,minmax(0,1fr))] gap-0.5 sm:gap-1 pb-1 border-b border-gray-100 text-center shrink-0">
          <div className="text-[8px] font-black text-gray-300 select-none" />
          {MESI_PIXELS.map((m, idx) => (
            <div
              key={idx}
              title={m.full}
              className="text-[8px] sm:text-[9px] font-black text-gray-700 tracking-wider truncate"
            >
              {m.short}
            </div>
          ))}
        </div>

        {/* Righe 1..31 Distribuite Perfettamente Senza Scorrimento */}
        <div className="flex-1 min-h-0 flex flex-col justify-between py-0.5">
          {Array.from({ length: 31 }, (_, dIdx) => {
            const dayNum = dIdx + 1;

            return (
              <div
                key={dayNum}
                className="grid grid-cols-[18px_repeat(12,minmax(0,1fr))] gap-0.5 sm:gap-1 items-center flex-1 min-h-0"
              >
                {/* Numero Giorno */}
                <div className="text-[7.5px] sm:text-[8px] font-bold text-gray-400 text-center select-none leading-none">
                  {dayNum}
                </div>

                {/* 12 Colonne Mesi */}
                {MESI_PIXELS.map((mObj, mIdx) => {
                  const maxDays = daysPerMonth[mIdx];
                  const exists = dayNum <= maxDays;

                  if (!exists) {
                    return (
                      <div
                        key={mIdx}
                        className="aspect-square max-w-[15px] max-h-[15px] mx-auto w-full rounded-[1.5px] bg-gray-50/40 border border-dashed border-gray-200/40"
                        aria-hidden="true"
                      />
                    );
                  }

                  const dateStr = `${year}-${pad(mIdx + 1)}-${pad(dayNum)}`;
                  const entry = entriesByDate.get(dateStr);
                  const cat = entry?.category_id ? categoriesById.get(entry.category_id) : null;
                  const hasMood = Boolean(cat);
                  const color = cat?.colore || null;
                  const moodName = cat?.category_name || 'Nessun umore';

                  let formattedDisplayDate = `${dayNum} ${mObj.full} ${year}`;
                  try {
                    const parsed = parseISO(dateStr);
                    formattedDisplayDate = format(parsed, 'EEEE d MMMM yyyy', { locale: it });
                    formattedDisplayDate =
                      formattedDisplayDate.charAt(0).toUpperCase() +
                      formattedDisplayDate.slice(1);
                  } catch {
                    // fallback
                  }

                  return (
                    <div
                      key={mIdx}
                      onClick={() =>
                        onPixelClick(
                          formattedDisplayDate,
                          formatMoodName(moodName),
                          color || '#94a3b8'
                        )
                      }
                      className="flex items-center justify-center w-full"
                      title={`${dayNum} ${mObj.full}: ${formatMoodName(moodName)}`}
                    >
                      <div
                        style={hasMood && color ? { backgroundColor: color } : undefined}
                        className={`aspect-square max-w-[15px] max-h-[15px] w-full rounded-[2px] cursor-pointer active:scale-90 transition-all ${
                          hasMood
                            ? 'shadow-2xs ring-1 ring-black/10'
                            : 'bg-gray-100 hover:bg-gray-200 border border-gray-200/70'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Nuvoletta temporanea al centro della griglia al tocco di un giorno */}
        {selectedPixelInfo && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-gray-900/95 backdrop-blur-xs text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-700 animate-fadeIn flex items-center gap-2.5 pointer-events-none max-w-[90%] select-none">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/30"
              style={{ backgroundColor: selectedPixelInfo.color }}
            />
            <div className="min-w-0 text-left">
              <p className="text-[10px] text-blue-300 font-bold uppercase tracking-wider leading-tight">
                {selectedPixelInfo.date}
              </p>
              <p className="text-xs font-extrabold text-white truncate leading-tight">
                {selectedPixelInfo.moodName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
