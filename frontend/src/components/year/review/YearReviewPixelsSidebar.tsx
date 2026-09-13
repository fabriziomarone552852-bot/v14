// frontend/src/components/year/review/YearReviewPixelsSidebar.tsx
import React from 'react';
import type { MoodStats } from './useYearReviewPixelsLogic';
import { formatMoodName } from './useYearReviewPixelsLogic';

interface YearReviewPixelsSidebarProps {
  daysInYear: number;
  moodStats: MoodStats;
}

export const YearReviewPixelsSidebar: React.FC<YearReviewPixelsSidebarProps> = ({
  daysInYear,
  moodStats,
}) => {
  return (
    <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-3.5 h-full overflow-hidden">
      {/* Card di Riepilogo */}
      <div className="bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
            Giorni Tracciati
          </span>
          <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-white">
            Annuale
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl xl:text-3xl font-black">{moodStats.totalTracked}</span>
          <span className="text-xs font-semibold text-blue-100">/ {daysInYear} giorni</span>
        </div>

        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(moodStats.pctYear, 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-blue-100 font-medium">
          <span>Copertura annuale:</span>
          <span className="font-bold text-white">{moodStats.pctYear.toFixed(1)}%</span>
        </div>
      </div>

      {/* Card Mood Predominante (se presente) */}
      {moodStats.topMood && (
        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs flex items-center gap-3 shrink-0">
          <div
            className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center shadow-xs border border-white"
            style={{ backgroundColor: moodStats.topMood.category.colore || '#3b82f6' }}
          >
            <span className="text-xs text-white drop-shadow font-black">★</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block leading-tight">
              Mood Principale
            </span>
            <p className="text-xs font-bold text-gray-800 truncate">
              {formatMoodName(moodStats.topMood.category.category_name)}
            </p>
          </div>
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            {moodStats.topMood.count} gg
          </span>
        </div>
      )}

      {/* Legenda Mood Utente */}
      <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-2.5 shrink-0 flex items-center justify-between">
          <span>Legenda Stati d'Animo</span>
          <span className="text-[10px] text-gray-400 font-bold">{moodStats.list.length} mood</span>
        </h4>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-1">
          {moodStats.list.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center text-xs text-gray-400 p-4">
              Nessuno stato d'animo configurato o registrato.
            </div>
          ) : (
            moodStats.list.map(({ category, count, percentage }) => {
              const formattedName = formatMoodName(category.category_name);
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50/80 hover:bg-gray-100/70 transition-colors border border-gray-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs border border-white"
                      style={{ backgroundColor: category.colore || '#9CA3AF' }}
                    />
                    <span className="text-xs font-bold text-gray-700 truncate" title={formattedName}>
                      {formattedName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-extrabold text-gray-800">
                      {count} <span className="text-[10px] text-gray-400 font-medium">gg</span>
                    </span>
                    <span className="text-[10px] font-semibold text-gray-400 w-9 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
