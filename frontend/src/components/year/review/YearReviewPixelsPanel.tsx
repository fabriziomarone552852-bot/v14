import React, { useMemo, useState } from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { Category } from '@/types/categories';
import { useCategories } from '@/hooks/useCategories';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface YearReviewPixelsPanelProps {
  year: number;
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
}

const MESI = [
  { short: 'GEN', full: 'Gennaio' },
  { short: 'FEB', full: 'Febbraio' },
  { short: 'MAR', full: 'Marzo' },
  { short: 'APR', full: 'Aprile' },
  { short: 'MAG', full: 'Maggio' },
  { short: 'GIU', full: 'Giugno' },
  { short: 'LUG', full: 'Luglio' },
  { short: 'AGO', full: 'Agosto' },
  { short: 'SET', full: 'Settembre' },
  { short: 'OTT', full: 'Ottobre' },
  { short: 'NOV', full: 'Novembre' },
  { short: 'DIC', full: 'Dicembre' },
];

const pad = (n: number) => String(n).padStart(2, '0');

const formatMoodName = (name: string | null | undefined): string => {
  if (!name) return 'Nessun umore';
  const trimmed = name.trim();
  if (!trimmed) return 'Nessun umore';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const YearReviewPixelsPanel: React.FC<YearReviewPixelsPanelProps> = ({
  year,
  dailyEntries = [],
  allCategories,
}) => {
  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = (allCategories && allCategories.length > 0) ? allCategories : dbCategories;

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Mappa delle categorie MOOD (genere 4)
  const moodCategories = useMemo(() => {
    return categoriesToUse.filter((c: Category) => {
      if (!c) return false;
      const g = (c as unknown as { genre?: unknown }).genre;
      return g === 4 || g === '4' || g === 'MOOD' || String(g).toUpperCase() === 'MOOD' || Number(g) === 4;
    });
  }, [categoriesToUse]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    categoriesToUse.forEach((c) => {
      if (c.id != null) map.set(c.id, c);
    });
    return map;
  }, [categoriesToUse]);

  // Mappa delle voci PX per data 'YYYY-MM-DD'
  const entriesByDate = useMemo(() => {
    const map = new Map<string, DailyEntry>();
    (dailyEntries || []).forEach((entry) => {
      if (entry.tipo === 'PX' && entry.data_riferimento) {
        const dStr = String(entry.data_riferimento).split('T')[0];
        map.set(dStr, entry);
      }
    });
    return map;
  }, [dailyEntries]);

  // Calcolo giorni totali e giorni per mese
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  const daysPerMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => new Date(year, m + 1, 0).getDate());
  }, [year]);

  // Statistiche Mood per la legenda
  const moodStats = useMemo(() => {
    const counts = new Map<number, number>();
    let totalTracked = 0;

    entriesByDate.forEach((entry) => {
      if (entry.category_id != null) {
        counts.set(entry.category_id, (counts.get(entry.category_id) || 0) + 1);
        totalTracked++;
      }
    });

    const list = moodCategories.map((cat) => {
      const count = counts.get(cat.id!) || 0;
      const pct = totalTracked > 0 ? (count / totalTracked) * 100 : 0;
      return {
        category: cat,
        count,
        percentage: pct,
      };
    }).sort((a, b) => b.count - a.count);

    // Identifichiamo il mood predominante
    const topMood = list.length > 0 && list[0].count > 0 ? list[0] : null;

    return {
      list,
      totalTracked,
      pctYear: (totalTracked / daysInYear) * 100,
      topMood,
    };
  }, [entriesByDate, moodCategories, daysInYear]);

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full overflow-hidden select-none">
      
      {/* GRIGLIA ANNO IN PIXEL (12 Colonne x 31 Righe) */}
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
                    formattedDisplayDate = format(parsed, "EEEE d MMMM", { locale: it });
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

      {/* PANNELLO LATERALE: LEGENDA & STATISTICHE */}
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

    </div>
  );
};

export default YearReviewPixelsPanel;
