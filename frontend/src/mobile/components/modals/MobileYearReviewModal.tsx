// src/mobile/components/modals/MobileYearReviewModal.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { YearInPixelsIcon } from '@/components/year/review/YearInPixelsIcon';
import { TrackerPanel } from '@/components/weekmonth/TrackerPanel';
import type { YearReviewData } from '@/components/year/review/YearReviewModal';
import type { TrackerItem } from '@/types/monthlyentries';
import type { YearlyType } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';
import type { Habit } from '@/types/habits';
import type { DailyEntry } from '@/types/dailyentries';
import { useCategories } from '@/hooks/useCategories';
import { MOOD_NAMES, SPHERE_NAMES } from '@/utils/monthlyEntriesUtils';
import { getTrackerColor, TRACKER_CODES } from '@/utils/trackerConstants';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

export type MobileYearReviewRecapType = 'tasks' | 'habits' | 'pixels' | 'charts';

interface MobileYearReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  reviewData: YearReviewData;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onSaveAnswer: (code: YearlyType, text: string, existingId?: number) => void;
  onUpdateMood?: (id: string, value: number) => void;
  onUpdateSphere?: (id: string, value: number) => void;
  tasksCompleted: number;
  tasksTotal: number;
  tasksByMonth: Record<number, number>;
  tasksByWeekday: Record<number, number>;
  habits: Habit[];
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
}

const YEAR_REVIEW_QUESTIONS: { code: YearlyType; text: string }[] = [
  { code: 'Q1', text: "1. Quali sono stati gli eventi più significativi di quest'anno?" },
  { code: 'Q2', text: "2. Quali sono le più importanti lezioni che hai imparato quest'anno?" },
  {
    code: 'Q3',
    text: "3. Controlla i tuoi obiettivi dell'anno appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?",
  },
  {
    code: 'Q4',
    text: "4. Ripensa alle persone di quest'anno. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?",
  },
  {
    code: 'Q5',
    text: "5. Guarda alle cose positive e a quelle negative dell'anno. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?",
  },
  {
    code: 'Q6',
    text: "6. Pensa ad almeno 3 cose che puoi migliorare nel prossimo anno e scrivi un elenco di azioni concrete!",
  },
];

const MESI_BREVI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
const GIORNI_SETT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const MESI_PIXELS = [
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

const getLongestStreak = (logs: Habit['logs']): number => {
  if (logs.length === 0) return 0;
  const sortedDates = logs
    .map((l) => l.data_riferimento.split('T')[0])
    .sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

/** Calcolo giorni effettivi di attività di una routine in un anno */
const getHabitActiveDaysInYear = (habit: Habit, year: number): number => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const effectiveEnd = year === today.getFullYear() ? (endOfYear > today ? today : endOfYear) : endOfYear;
  if (effectiveEnd < startOfYear) return 0;

  if (!habit.periods || habit.periods.length === 0) {
    const diffTime = effectiveEnd.getTime() - startOfYear.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }

  let count = 0;
  const cur = new Date(startOfYear);
  cur.setHours(0, 0, 0, 0);

  while (cur <= effectiveEnd) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const isActive = habit.periods.some((p) => {
      const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
      const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
      return start <= dStr && end >= dStr;
    });
    if (isActive) count++;
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

/** Icona Grafico a Torta personalizzata */
const PieChartIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

/** Grafico a barre Mesi a tutta larghezza per Mobile */
const MonthBarChartMobile: React.FC<{ data: Record<number, number> }> = ({ data }) => {
  const values = Array.from({ length: 12 }, (_, i) => data[i + 1] ?? 0);
  const maxVal = Math.max(...values, 1);
  const hasData = values.some((v) => v > 0);

  const svgWidth = 420;
  const svgHeight = 160;
  const padding = { top: 18, right: 10, bottom: 24, left: 10 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / 12;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-h-[190px]" preserveAspectRatio="xMidYMid meet">
      {values.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = padding.left + i * barWidth + barWidth * 0.15;
        const y = padding.top + chartHeight - barH;
        const w = barWidth * 0.7;

        return (
          <g key={i}>
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              rx={3}
              fill="#f1f5f9"
            />
            {barH > 0 && (
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={3}
                fill="#3b82f6"
                className="transition-all duration-500 ease-out"
              />
            )}
            {val > 0 && (
              <text x={x + w / 2} y={y - 3} textAnchor="middle" fontSize={8.5} fill="#1e293b" fontWeight="700">
                {val}
              </text>
            )}
            <text x={x + w / 2} y={svgHeight - 6} textAnchor="middle" fontSize={8} fill="#64748b" fontWeight="600">
              {MESI_BREVI[i]}
            </text>
          </g>
        );
      })}

      {!hasData && (
        <text x={svgWidth / 2} y={padding.top + chartHeight / 2} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="600" fontStyle="italic">
          Nessuna task completata nei mesi
        </text>
      )}
    </svg>
  );
};

/** Grafico a barre Giorni Settimana a tutta larghezza per Mobile */
const WeekdayBarChartMobile: React.FC<{ data: Record<number, number> }> = ({ data }) => {
  const values = Array.from({ length: 7 }, (_, i) => data[i] ?? 0);
  const maxVal = Math.max(...values, 1);
  const maxIndex = values.indexOf(maxVal);
  const hasData = values.some((v) => v > 0);

  const svgWidth = 320;
  const svgHeight = 160;
  const padding = { top: 18, right: 10, bottom: 24, left: 10 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;
  const barWidth = chartWidth / 7;

  return (
    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full max-h-[190px]" preserveAspectRatio="xMidYMid meet">
      {values.map((val, i) => {
        const barH = (val / maxVal) * chartHeight;
        const x = padding.left + i * barWidth + barWidth * 0.18;
        const y = padding.top + chartHeight - barH;
        const w = barWidth * 0.64;
        const isTop = i === maxIndex && val > 0;

        return (
          <g key={i}>
            <rect
              x={x}
              y={padding.top}
              width={w}
              height={chartHeight}
              rx={3}
              fill="#f1f5f9"
            />
            {barH > 0 && (
              <rect
                x={x}
                y={y}
                width={w}
                height={barH}
                rx={3}
                fill={isTop ? '#4f46e5' : '#818cf8'}
                className="transition-all duration-500 ease-out"
              />
            )}
            {val > 0 && (
              <text x={x + w / 2} y={y - 3} textAnchor="middle" fontSize={8.5} fill="#1e293b" fontWeight="700">
                {val}
              </text>
            )}
            <text x={x + w / 2} y={svgHeight - 6} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight="600">
              {GIORNI_SETT[i]}
            </text>
          </g>
        );
      })}

      {!hasData && (
        <text x={svgWidth / 2} y={padding.top + chartHeight / 2} textAnchor="middle" fontSize={11} fill="#94a3b8" fontWeight="600" fontStyle="italic">
          Nessuna task completata nei giorni
        </text>
      )}
    </svg>
  );
};

/** Textarea ad auto-espansione per le risposte alle domande di review */
const AutoExpandingReviewTextarea: React.FC<{
  initialValue: string;
  onSave: (val: string) => void;
  placeholder?: string;
}> = ({ initialValue, onSave, placeholder = 'Scrivi la tua risposta...' }) => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(68, el.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        adjustHeight();
      }}
      onBlur={() => {
        const trimmed = value.trim();
        if (trimmed !== initialValue.trim()) {
          onSave(trimmed);
        }
      }}
      placeholder={placeholder}
      rows={2}
      className="w-full text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-[border-color,box-shadow] resize-none placeholder-gray-400 leading-relaxed overflow-hidden"
    />
  );
};

/** Moods e Sfere di fallback */
const DEFAULT_MOODS: TrackerItem[] = MOOD_NAMES.map((nome) => ({
  id: TRACKER_CODES[nome],
  name: nome,
  category: 'MOOD' as const,
  colorHex: getTrackerColor(nome),
  currentValue: 0,
  previousValue: 0,
}));

const DEFAULT_SPHERES: TrackerItem[] = SPHERE_NAMES.map((nome) => ({
  id: TRACKER_CODES[nome],
  name: nome,
  category: 'SPHERE' as const,
  colorHex: getTrackerColor(nome),
  currentValue: 0,
  previousValue: 0,
}));

/** Barra dei Tag Orizzontale Scrollabile per Mobile */
const MobileReviewTagBar: React.FC<{
  assignedTags?: Category[];
  allTags?: Category[];
  tagEntryMap?: Record<number, number>;
  onAddTag?: (categoryId: number) => void;
  onCreateAndAddTag?: (tagName: string) => void;
  onRemoveTag?: (yearlyEntryId: number) => void;
}> = ({ assignedTags = [], allTags = [], tagEntryMap = {}, onAddTag, onCreateAndAddTag, onRemoveTag }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) inputRef.current.focus();
  }, [isAdding]);

  useEffect(() => {
    if (!isAdding) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAdding(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isAdding]);

  const assignedIds = useMemo(() => new Set(assignedTags.map((t) => t.id)), [assignedTags]);

  const suggestions = useMemo(() => {
    const available = allTags.filter((t) => !assignedIds.has(t.id));
    if (!search.trim()) return available;
    const q = search.toLowerCase().trim();
    return available.filter((t) => t.category_name.toLowerCase().includes(q));
  }, [search, allTags, assignedIds]);

  const nameAlreadyExists = useMemo(() => {
    if (!search.trim()) return false;
    return allTags.some((t) => t.category_name.toLowerCase() === search.toLowerCase().trim());
  }, [search, allTags]);

  const handleSelect = (tagId: number) => {
    onAddTag?.(tagId);
    setSearch('');
    setIsAdding(false);
  };

  const handleCreateNew = () => {
    const name = search.trim();
    if (!name) return;
    onCreateAndAddTag?.(name);
    setSearch('');
    setIsAdding(false);
  };

  if (!onAddTag || !onRemoveTag) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap py-2 px-3 bg-gray-50 border-t border-gray-200 shrink-0 relative z-30 overflow-visible">
      {assignedTags.map((tag) => {
        const entryId = tagEntryMap[tag.id];
        return (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 shrink-0 shadow-2xs"
          >
            #{tag.category_name}
            {entryId && (
              <button
                type="button"
                onClick={() => onRemoveTag(entryId)}
                className="ml-0.5 text-indigo-400 hover:text-red-500 font-black focus:outline-none cursor-pointer"
                title="Rimuovi tag"
              >
                ×
              </button>
            )}
          </span>
        );
      })}

      {isAdding ? (
        <div ref={dropdownRef} className="relative shrink-0">
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions.length > 0) {
                  handleSelect(suggestions[0].id);
                } else if (search.trim()) {
                  handleCreateNew();
                }
              }
              if (e.key === 'Escape') {
                setIsAdding(false);
                setSearch('');
              }
            }}
            placeholder="Cerca o crea tag..."
            className="text-xs px-2.5 py-1 rounded-full border border-indigo-400 bg-white focus:ring-2 focus:ring-indigo-300 outline-none w-36 shadow-xs"
          />

          {(suggestions.length > 0 || search.trim()) && (
            <div className="absolute bottom-full left-0 mb-1.5 w-48 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-2xl border border-gray-200 max-h-40 overflow-y-auto z-50">
              {suggestions.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(tag.id);
                  }}
                  onClick={() => handleSelect(tag.id)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-gray-700 font-medium truncate block cursor-pointer border-b border-gray-50 last:border-b-0"
                >
                  #{tag.category_name}
                </button>
              ))}
              {search.trim() && !nameAlreadyExists && (
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCreateNew();
                  }}
                  onClick={handleCreateNew}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-green-50 text-green-700 font-bold border-t border-gray-100 truncate block cursor-pointer"
                >
                  + Crea &quot;#{search.trim()}&quot;
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-gray-600 border border-dashed border-gray-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-all shrink-0 cursor-pointer shadow-2xs"
        >
          + Tag
        </button>
      )}
    </div>
  );
};

export const MobileYearReviewModal: React.FC<MobileYearReviewModalProps> = ({
  isOpen,
  onClose,
  year,
  reviewData,
  moodsUI,
  spheresUI,
  onSaveAnswer,
  onUpdateMood,
  onUpdateSphere,
  tasksCompleted,
  tasksTotal,
  tasksByMonth,
  tasksByWeekday,
  habits,
  dailyEntries = [],
  allCategories,
}) => {
  const [activeRecap, setActiveRecap] = useState<MobileYearReviewRecapType | null>(null);
  const [selectedPixelInfo, setSelectedPixelInfo] = useState<{ date: string; moodName: string; color: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = allCategories && allCategories.length > 0 ? allCategories : dbCategories;

  const safeMoods = useMemo(() => {
    return moodsUI && moodsUI.length > 0 ? moodsUI : DEFAULT_MOODS;
  }, [moodsUI]);

  const safeSpheres = useMemo(() => {
    return spheresUI && spheresUI.length > 0 ? spheresUI : DEFAULT_SPHERES;
  }, [spheresUI]);

  const entriesList = reviewData.yearlyEntries || reviewData.entries || [];

  // Calcolo delle abitudini e routine attive nell'anno selezionato
  const activeHabitsInYear = useMemo(() => {
    return habits
      .map((habit) => {
        const activeDays = getHabitActiveDaysInYear(habit, year);
        const yearLogs = habit.logs.filter((l) => {
          if (l.count <= 0) return false;
          const dStr = l.data_riferimento.split('T')[0];
          const y = parseInt(dStr.split('-')[0], 10);
          return y === year;
        });
        const completedDays = yearLogs.length;
        const longestStreak = getLongestStreak(yearLogs);
        const pct = activeDays > 0 ? Math.min((completedDays / activeDays) * 100, 100) : 0;

        return {
          habit,
          activeDays,
          completedDays,
          longestStreak,
          pct,
        };
      })
      .filter((h) => h.activeDays > 0);
  }, [habits, year]);

  // Calcoli Anno in Pixel
  const daysPerMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => new Date(year, m + 1, 0).getDate());
  }, [year]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    categoriesToUse.forEach((c) => {
      if (c.id != null) map.set(c.id, c);
    });
    return map;
  }, [categoriesToUse]);

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

  // Gestione tocco pixel con nuvoletta temporanea al centro
  const handlePixelClick = (dateStr: string, moodName: string, color: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setSelectedPixelInfo({ date: dateStr, moodName, color });
    toastTimeoutRef.current = window.setTimeout(() => {
      setSelectedPixelInfo(null);
      toastTimeoutRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  const modalElement = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER MODALE                                                          */}
      {/* ========================================================================= */}
      {activeRecap === null ? (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">
            Analisi del {year}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
            title="Chiudi"
            aria-label="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-white shrink-0 pt-[max(env(safe-area-inset-top,0px),10px)]">
          <span className="text-xs font-black uppercase tracking-wider text-gray-800">
            {activeRecap === 'tasks' && 'Statistiche Task'}
            {activeRecap === 'habits' && 'Statistiche Routine & Abitudini'}
            {activeRecap === 'pixels' && 'Anno in Pixel'}
            {activeRecap === 'charts' && 'Grafici Umore & Sfere'}
          </span>

          <button
            type="button"
            onClick={() => {
              setActiveRecap(null);
              setSelectedPixelInfo(null);
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
            title="Torna all'analisi"
            aria-label="Torna all'analisi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CORPO MODALE: SCHERMATA PRINCIPALE (6 DOMANDE)                         */}
      {/* ========================================================================= */}
      {activeRecap === null && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* SEZIONE DELLE 6 DOMANDE ANNUALI */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {YEAR_REVIEW_QUESTIONS.map(({ code, text }) => {
              const existing = entriesList.find((e) => e.yearly_type === code);
              const currentText = existing?.yearly_field ?? '';
              const existingId = existing?.id;

              return (
                <div
                  key={code}
                  className="bg-gray-50/70 border border-gray-200/90 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs"
                >
                  <p className="text-xs sm:text-sm font-bold text-gray-800 whitespace-pre-line leading-relaxed">
                    {text}
                  </p>

                  <AutoExpandingReviewTextarea
                    key={`${code}-${existingId || 'empty'}`}
                    initialValue={currentText}
                    onSave={(val) => onSaveAnswer(code, val, existingId)}
                  />
                </div>
              );
            })}
          </div>

          {/* RIGA DEI TAG ANNUALI */}
          <MobileReviewTagBar
            assignedTags={reviewData.assignedTags}
            allTags={reviewData.allTags}
            tagEntryMap={reviewData.tagEntryMap}
            onAddTag={reviewData.onAddTag}
            onCreateAndAddTag={reviewData.onCreateAndAddTag}
            onRemoveTag={reviewData.onRemoveTag}
          />

          {/* 4 TASTI RECAP IN FONDO (Solo Icone) */}
          <div className="grid grid-cols-4 gap-2.5 p-2.5 bg-white border-t border-gray-200 shrink-0 pb-[max(env(safe-area-inset-bottom,0px),10px)]">
            {/* Tasto 1: Statistiche Task */}
            <button
              type="button"
              onClick={() => setActiveRecap('tasks')}
              className="flex items-center justify-center h-11 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Statistiche Task"
              aria-label="Statistiche Task"
            >
              <span className="text-xl leading-none">📊</span>
            </button>

            {/* Tasto 2: Statistiche Abitudini */}
            <button
              type="button"
              onClick={() => setActiveRecap('habits')}
              className="flex items-center justify-center h-11 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Statistiche Abitudini"
              aria-label="Statistiche Abitudini"
            >
              <span className="text-xl leading-none">🔄</span>
            </button>

            {/* Tasto 3: Anno in Pixel (Icona standard webpage) */}
            <button
              type="button"
              onClick={() => setActiveRecap('pixels')}
              className="flex items-center justify-center h-11 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Anno in Pixel"
              aria-label="Anno in Pixel"
            >
              <YearInPixelsIcon className="scale-110" />
            </button>

            {/* Tasto 4: Grafici Umore & Sfere */}
            <button
              type="button"
              onClick={() => setActiveRecap('charts')}
              className="flex items-center justify-center h-11 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-600 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Grafici Radar"
              aria-label="Grafici Radar"
            >
              <PieChartIcon className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RECAP: STATISTICHE TASK (Grafici Estesi su Tutto lo Spazio Disponibile) */}
      {/* ========================================================================= */}
      {activeRecap === 'tasks' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3 flex flex-col justify-between">
          {/* Banner Riassuntivo */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3.5 text-white shadow-xs flex flex-col items-center shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-0.5">
              Task Completate
            </span>
            <div className="text-3xl font-extrabold mb-1">
              {tasksCompleted} <span className="text-lg text-blue-200">/ {tasksTotal}</span>
            </div>
            <div className="w-full max-w-xs bg-blue-800/40 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-blue-100 mt-1.5 font-medium">
              {taskProgress.toFixed(0)}% di completamento del {year}
            </span>
          </div>

          {/* Riga 1: Mese più Produttivo (A tutta larghezza e altezza estesa) */}
          <div className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex-1 min-h-[160px] flex flex-col justify-between">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1 text-center shrink-0">
              Mese più Produttivo
            </h4>
            <div className="flex-1 min-h-0 flex items-center justify-center w-full">
              <MonthBarChartMobile data={tasksByMonth} />
            </div>
          </div>

          {/* Riga 2: Giorno più Produttivo (A tutta larghezza e altezza estesa) */}
          <div className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex-1 min-h-[160px] flex flex-col justify-between">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-gray-600 mb-1 text-center shrink-0">
              Giorno più Produttivo
            </h4>
            <div className="flex-1 min-h-0 flex items-center justify-center w-full">
              <WeekdayBarChartMobile data={tasksByWeekday} />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECAP: STATISTICHE ROUTINE / HABITS (Singola Pagina Scrollabile, Card Compatte, Filtro Attive) */}
      {/* ========================================================================= */}
      {activeRecap === 'habits' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {activeHabitsInYear.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[220px] p-4">
              <EmptyState message={`Nessuna routine o abitudine attiva nel ${year}`} />
            </div>
          ) : (
            activeHabitsInYear.map(({ habit, activeDays, completedDays, longestStreak, pct }) => (
              <div
                key={habit.id}
                className="bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="text-sm shrink-0">{habit.tipo === 'R' ? '🔁' : '⭐'}</span>
                    <span className="text-xs font-bold text-gray-900 truncate">{habit.titolo}</span>
                  </div>
                  <span className="text-[10.5px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                    {completedDays}/{activeDays} gg
                  </span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10.5px] text-gray-500 font-medium pt-0.5">
                  <span>
                    🔥 Streak più lunga: <strong className="text-orange-600">{longestStreak} gg</strong>
                  </span>
                  <span className="font-semibold text-gray-600">{pct.toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RECAP: ANNO IN PIXEL (Solo Griglia 12x31 con Nuvoletta Temporanea al Clic) */}
      {/* ========================================================================= */}
      {activeRecap === 'pixels' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 flex flex-col justify-start">
          {/* GRIGLIA COMPLETA ANNO IN PIXEL (12 Mesi x 31 Giorni) */}
          <div className="relative bg-white rounded-2xl p-3 border border-gray-200/90 shadow-2xs flex flex-col overflow-hidden">
            {/* Header Mesi */}
            <div className="grid grid-cols-[20px_repeat(12,minmax(0,1fr))] gap-1 pb-1.5 border-b border-gray-100 text-center shrink-0">
              <div className="text-[9px] font-black text-gray-300 select-none" />
              {MESI_PIXELS.map((m, idx) => (
                <div
                  key={idx}
                  title={m.full}
                  className="text-[9px] font-black text-gray-700 tracking-wider truncate"
                >
                  {m.short}
                </div>
              ))}
            </div>

            {/* Righe 1..31 Sempre Visibili per Tutti i Mesi */}
            <div className="flex flex-col gap-1 pt-1.5">
              {Array.from({ length: 31 }, (_, dIdx) => {
                const dayNum = dIdx + 1;

                return (
                  <div
                    key={dayNum}
                    className="grid grid-cols-[20px_repeat(12,minmax(0,1fr))] gap-1 items-center"
                  >
                    {/* Numero Giorno */}
                    <div className="text-[8.5px] font-bold text-gray-400 text-center select-none leading-none">
                      {dayNum}
                    </div>

                    {/* 12 Colonne Mesi */}
                    {MESI_PIXELS.map((mObj, mIdx) => {
                      const maxDays = daysPerMonth[mIdx];
                      const exists = dayNum <= maxDays;

                      if (!exists) {
                        // Slot inattivo per giorni non presenti nel mese (es. 31 Febbraio)
                        return (
                          <div
                            key={mIdx}
                            className="aspect-square max-w-[18px] max-h-[18px] mx-auto w-full rounded-[2px] bg-gray-50/40 border border-dashed border-gray-200/40"
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
                        formattedDisplayDate = format(parsed, "EEEE d MMMM yyyy", { locale: it });
                        formattedDisplayDate = formattedDisplayDate.charAt(0).toUpperCase() + formattedDisplayDate.slice(1);
                      } catch {
                        // fallback
                      }

                      return (
                        <div
                          key={mIdx}
                          onClick={() =>
                            handlePixelClick(
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
                            className={`aspect-square max-w-[18px] max-h-[18px] w-full rounded-[2.5px] cursor-pointer active:scale-90 transition-all ${
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

            {/* NUVOLETTA TEMPORANEA AL CENTRO DELLA GRIGLIA AL TOCCO DI UN GIORNO */}
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
      )}

      {/* ========================================================================= */}
      {/* 6. RECAP: GRAFICI RADAR MOOD & SFERE                                      */}
      {/* ========================================================================= */}
      {activeRecap === 'charts' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4 flex flex-col items-center justify-start">
          <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
            <TrackerPanel
              titleTop="Come mi sento"
              showBottom={false}
              items={safeMoods}
              onUpdateValue={(id, val) => onUpdateMood?.(id, val)}
            />
          </div>

          <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
            <TrackerPanel
              titleTop="Sfere di Influenza"
              showBottom={false}
              items={safeSpheres}
              onUpdateValue={(id, val) => onUpdateSphere?.(id, val)}
            />
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalElement, document.body);
};

export default MobileYearReviewModal;
