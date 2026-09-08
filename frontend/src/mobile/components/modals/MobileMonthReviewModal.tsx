// src/mobile/components/modals/MobileMonthReviewModal.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  CloseIcon,
} from '@/components/shared/utils/Icons';
import { TrackerPanel } from '@/components/weekmonth/TrackerPanel';
import type { MonthReviewData } from '@/hooks/uiMonth/useMonthReview';
import type { TrackerItem, MonthlyType } from '@/types/monthlyentries';
import type { Category } from '@/types/categories';
import { MOOD_NAMES, SPHERE_NAMES } from '@/utils/monthlyEntriesUtils';
import { getTrackerColor, TRACKER_CODES } from '@/utils/trackerConstants';
import { EmptyState } from '@/components/shared/utils/EmptyState';

export type MobileReviewRecapType = 'events' | 'tasks' | 'habits' | 'charts';

interface MobileMonthReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date;
  reviewData: MonthReviewData;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onSaveAnswer: (code: MonthlyType, text: string, existingId?: number) => void;
  onUpdateMood?: (id: string, value: number) => void;
  onUpdateSphere?: (id: string, value: number) => void;
}

const REVIEW_QUESTIONS: { code: MonthlyType; text: string }[] = [
  { code: 'Q1', text: '1. Quali sono stati gli eventi più significativi di questo mese?' },
  { code: 'Q2', text: '2. Quali sono le più importanti lezioni che hai imparato in questo mese?' },
  {
    code: 'Q3',
    text: '3. Controlla i tuoi obiettivi del mese appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?',
  },
  {
    code: 'Q4',
    text: '4. Ripensa alle persone di questo ultimo mese. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?',
  },
  {
    code: 'Q5',
    text: '5. Guarda alle cose positive e a quelle negative che sono successe. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?',
  },
  {
    code: 'Q6',
    text: '6. Pensa ad almeno 3 cose che puoi migliorare in questo prossimo mese e scrivi un elenco di azioni concrete per farlo!',
  },
];

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

/** Formatta data_riferimento "YYYY-MM-DD" → "dd/MM" */
const formatShortDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const parts = dateStr.substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateStr;
};

/** Moods e Sfere di fallback per mostrare sempre i grafici anche se vuoti */
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

/** Barra dei Tag Orizzontale Scrollabile per Mobile (senza scritta "TAG:") */
const MobileReviewTagBar: React.FC<{
  assignedTags: Category[];
  allTags: Category[];
  tagEntryMap: Record<number, number>;
  onAddTag: (categoryId: number) => void;
  onCreateAndAddTag: (tagName: string) => void;
  onRemoveTag: (monthlyEntryId: number) => void;
}> = ({ assignedTags, allTags, tagEntryMap, onAddTag, onCreateAndAddTag, onRemoveTag }) => {
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
    onAddTag(tagId);
    setSearch('');
    setIsAdding(false);
  };

  const handleCreateNew = () => {
    const name = search.trim();
    if (!name) return;
    onCreateAndAddTag(name);
    setSearch('');
    setIsAdding(false);
  };

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

export const MobileMonthReviewModal: React.FC<MobileMonthReviewModalProps> = ({
  isOpen,
  onClose,
  monthDate,
  reviewData,
  moodsUI,
  spheresUI,
  onSaveAnswer,
}) => {
  const [activeRecap, setActiveRecap] = useState<MobileReviewRecapType | null>(null);

  const monthName = useMemo(() => {
    return format(monthDate, 'MMMM yyyy', { locale: it }).toUpperCase();
  }, [monthDate]);

  const allMonthDays = useMemo(() => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth() + 1;
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [monthDate]);

  // Grafici garantiti anche se vuoti
  const safeMoods = useMemo(() => {
    return moodsUI && moodsUI.length > 0 ? moodsUI : DEFAULT_MOODS;
  }, [moodsUI]);

  const safeSpheres = useMemo(() => {
    return spheresUI && spheresUI.length > 0 ? spheresUI : DEFAULT_SPHERES;
  }, [spheresUI]);

  // Normalizza eventi positivi e negativi con data
  const allPositive = useMemo(() => {
    return [
      ...reviewData.monthlyPositive
        .filter((e) => e.monthly_field?.trim())
        .map((e) => ({
          id: `mp-${e.id}`,
          text: e.monthly_field!.trim(),
          date: undefined as string | undefined,
        })),
      ...reviewData.weeklyPositive
        .filter((e) => e.testo?.trim())
        .map((e) => ({
          id: `wp-${e.id}`,
          text: e.testo!.trim(),
          date: formatShortDate(e.data_riferimento),
        })),
    ];
  }, [reviewData.monthlyPositive, reviewData.weeklyPositive]);

  const allNegative = useMemo(() => {
    return [
      ...reviewData.monthlyNegative
        .filter((e) => e.monthly_field?.trim())
        .map((e) => ({
          id: `mn-${e.id}`,
          text: e.monthly_field!.trim(),
          date: undefined as string | undefined,
        })),
      ...reviewData.weeklyNegative
        .filter((e) => e.testo?.trim())
        .map((e) => ({
          id: `wn-${e.id}`,
          text: e.testo!.trim(),
          date: formatShortDate(e.data_riferimento),
        })),
    ];
  }, [reviewData.monthlyNegative, reviewData.weeklyNegative]);

  const activeHabitsInMonth = useMemo(() => {
    const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const isCurrentMonth =
      monthDate.getFullYear() === today.getFullYear() &&
      monthDate.getMonth() === today.getMonth();

    const effectiveEnd = isCurrentMonth ? (endOfMonth > today ? today : endOfMonth) : endOfMonth;

    return (reviewData.habits || [])
      .map((habit) => {
        const activeDayNumbers: number[] = [];
        if (!habit.periods || habit.periods.length === 0) {
          const cur = new Date(startOfMonth);
          while (cur <= effectiveEnd) {
            activeDayNumbers.push(cur.getDate());
            cur.setDate(cur.getDate() + 1);
          }
        } else {
          const cur = new Date(startOfMonth);
          cur.setHours(0, 0, 0, 0);
          while (cur <= effectiveEnd) {
            const dStr = format(cur, 'yyyy-MM-dd');
            const isActive = habit.periods.some((p) => {
              const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
              const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
              return start <= dStr && end >= dStr;
            });
            if (isActive) {
              activeDayNumbers.push(cur.getDate());
            }
            cur.setDate(cur.getDate() + 1);
          }
        }

        const currentMonthPrefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
        const logDates = new Set(
          habit.logs
            .filter((log) => log.count > 0 && log.data_riferimento.startsWith(currentMonthPrefix))
            .map((log) => parseInt(log.data_riferimento.split('-')[2], 10))
        );
        const completedDays = logDates.size;
        const activeDays = activeDayNumbers.length;

        return {
          habit,
          activeDays,
          activeDayNumbers,
          completedDays,
          logDates,
        };
      })
      .filter((h) => h.activeDays > 0);
  }, [reviewData.habits, monthDate]);

  const [expandedEventCategory, setExpandedEventCategory] = useState<'none' | 'positive' | 'negative'>('none');
  const positiveContainerRef = useRef<HTMLDivElement>(null);
  const negativeContainerRef = useRef<HTMLDivElement>(null);
  const [positiveContainerHeight, setPositiveContainerHeight] = useState(0);
  const [negativeContainerHeight, setNegativeContainerHeight] = useState(0);

  useEffect(() => {
    if (activeRecap !== 'events') {
      setExpandedEventCategory('none');
      return;
    }

    const updateHeights = () => {
      if (positiveContainerRef.current) {
        setPositiveContainerHeight(positiveContainerRef.current.clientHeight);
      }
      if (negativeContainerRef.current) {
        setNegativeContainerHeight(negativeContainerRef.current.clientHeight);
      }
    };

    updateHeights();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === positiveContainerRef.current) {
          setPositiveContainerHeight(entry.contentRect.height);
        } else if (entry.target === negativeContainerRef.current) {
          setNegativeContainerHeight(entry.contentRect.height);
        }
      }
    });

    if (positiveContainerRef.current) observer.observe(positiveContainerRef.current);
    if (negativeContainerRef.current) observer.observe(negativeContainerRef.current);

    return () => observer.disconnect();
  }, [activeRecap]);

  const ITEM_HEIGHT = 44;
  const INDICATOR_HEIGHT = 28;

  const maxPositiveFit = useMemo(() => {
    if (positiveContainerHeight <= 0) return 2;
    if (allPositive.length * ITEM_HEIGHT <= positiveContainerHeight) {
      return allPositive.length;
    }
    const available = positiveContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(available / ITEM_HEIGHT));
  }, [positiveContainerHeight, allPositive.length]);

  const visiblePositive = useMemo(() => {
    return allPositive.slice(0, maxPositiveFit);
  }, [allPositive, maxPositiveFit]);

  const hasMorePositive = allPositive.length > maxPositiveFit;

  const maxNegativeFit = useMemo(() => {
    if (negativeContainerHeight <= 0) return 2;
    if (allNegative.length * ITEM_HEIGHT <= negativeContainerHeight) {
      return allNegative.length;
    }
    const available = negativeContainerHeight - INDICATOR_HEIGHT;
    return Math.max(1, Math.floor(available / ITEM_HEIGHT));
  }, [negativeContainerHeight, allNegative.length]);

  const visibleNegative = useMemo(() => {
    return allNegative.slice(0, maxNegativeFit);
  }, [allNegative, maxNegativeFit]);

  const hasMoreNegative = allNegative.length > maxNegativeFit;

  const tasksPercentage =
    reviewData.tasksTotal > 0
      ? Math.round((reviewData.tasksCompleted / reviewData.tasksTotal) * 100)
      : 0;

  if (!isOpen) return null;

  const modalElement = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HEADER MODALE (Copre l'intero schermo e la barra superiore)             */}
      {/* ========================================================================= */}
      {activeRecap === null ? (
        // Header pagina principale con Titolo e tasto 'X' di chiusura totale
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/95 shrink-0 pt-[max(env(safe-area-inset-top,0px),12px)]">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider truncate">
            Analisi di {monthName}
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
        // Header schede di recap: Titolo sezione e 'X' per tornare alla review
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 bg-white shrink-0 pt-[max(env(safe-area-inset-top,0px),10px)]">
          <span className="text-xs font-black uppercase tracking-wider text-gray-800">
            {activeRecap === 'events' && 'Cose Positive e Negative'}
            {activeRecap === 'tasks' && 'Statistiche Task'}
            {activeRecap === 'habits' && 'Statistiche Routine & Abitudini'}
            {activeRecap === 'charts' && 'Grafici Umore & Sfere'}
          </span>

          <button
            type="button"
            onClick={() => setActiveRecap(null)}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 active:scale-90 transition-all cursor-pointer shrink-0"
            title="Torna alla review"
            aria-label="Torna alla review"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CORPO MODALE: SCHERMATA PRINCIPALE (6 DOMANDE) O VISTA RECAP          */}
      {/* ========================================================================= */}
      {activeRecap === null && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* SEZIONE DELLE 6 DOMANDE CON SCROLLBAR & AUTO-EXPANDING TEXTAREAS */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {REVIEW_QUESTIONS.map(({ code, text }) => {
              const existing = reviewData.monthlyEntries.find((e) => e.monthly_type === code);
              const currentText = existing?.monthly_field ?? '';
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

          {/* RIGA DEI TAG (Orizzontale scrollabile stile HabitsBar, senza label fissa) */}
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
            {/* Tasto 1: Cose Positive e Negative */}
            <button
              type="button"
              onClick={() => setActiveRecap('events')}
              className="flex items-center justify-center h-11 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Cose Positive e Negative"
              aria-label="Cose Positive e Negative"
            >
              <span className="text-xl leading-none">❤️</span>
            </button>

            {/* Tasto 2: Statistiche Task */}
            <button
              type="button"
              onClick={() => setActiveRecap('tasks')}
              className="flex items-center justify-center h-11 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Statistiche Task"
              aria-label="Statistiche Task"
            >
              <span className="text-xl leading-none">📊</span>
            </button>

            {/* Tasto 3: Statistiche Abitudini */}
            <button
              type="button"
              onClick={() => setActiveRecap('habits')}
              className="flex items-center justify-center h-11 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Statistiche Abitudini"
              aria-label="Statistiche Abitudini"
            >
              <span className="text-xl leading-none">🔄</span>
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
      {/* 3. RECAP VISTA: GRAFICI POLARI MOOD E SFERE (Centrati e Non Modificabili)  */}
      {/* ========================================================================= */}
      {activeRecap === 'charts' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-4 flex flex-col items-center justify-start">
          <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
            <TrackerPanel
              titleTop="Come mi sento"
              showBottom={false}
              items={safeMoods}
            />
          </div>

          <div className="w-full max-w-md h-[340px] bg-white rounded-2xl border border-gray-200 shadow-xs p-3 flex flex-col items-center justify-center shrink-0">
            <TrackerPanel
              titleTop="Sfere di Influenza"
              showBottom={false}
              items={safeSpheres}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECAP VISTA: COSE POSITIVE E NEGATIVE (50/50 Split + Auto Fit & Expand) */}
      {/* ========================================================================= */}
      {activeRecap === 'events' && (
        <div className="relative flex-1 min-h-0 flex flex-col gap-3 p-3 overflow-hidden select-none">
          {/* Sezione Cose Positive (Occupa il 50% dello spazio) */}
          <div
            onClick={() => setExpandedEventCategory('positive')}
            className="flex-1 min-h-0 flex flex-col bg-green-50/30 rounded-2xl border border-green-200 overflow-hidden shadow-2xs cursor-pointer active:scale-[0.99] transition-transform"
            title="Tocca per espandere tutte le cose positive"
          >
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-green-200 bg-green-50/60 shrink-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                <span>❤</span> Cose Positive
              </h4>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                {allPositive.length}
              </span>
            </div>

            <div
              ref={positiveContainerRef}
              className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden p-2.5"
            >
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {visiblePositive.map((ev, i) => (
                  <div
                    key={i}
                    className="relative text-xs px-3 py-2 rounded-xl border bg-green-50 border-green-200 text-green-900 break-words shadow-2xs min-h-[36px]"
                  >
                    <span>{ev.text}</span>
                    {ev.date && (
                      <span className="text-[10px] font-bold text-green-600 float-right ml-2 mt-0.5">
                        {ev.date}
                      </span>
                    )}
                  </div>
                ))}

                {allPositive.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Nessun evento positivo registrato
                  </p>
                )}
              </div>

              {hasMorePositive && (
                <div className="shrink-0 h-6 flex items-center justify-center select-none pt-0.5">
                  <span className="text-lg font-black tracking-widest text-green-600 leading-none">
                    •••
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sezione Cose Negative (Occupa il 50% dello spazio) */}
          <div
            onClick={() => setExpandedEventCategory('negative')}
            className="flex-1 min-h-0 flex flex-col bg-red-50/30 rounded-2xl border border-red-200 overflow-hidden shadow-2xs cursor-pointer active:scale-[0.99] transition-transform"
            title="Tocca per espandere tutte le cose negative"
          >
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-red-200 bg-red-50/60 shrink-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                <span>💔</span> Cose Negative
              </h4>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                {allNegative.length}
              </span>
            </div>

            <div
              ref={negativeContainerRef}
              className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden p-2.5"
            >
              <div className="flex flex-col gap-1.5 overflow-hidden">
                {visibleNegative.map((ev, i) => (
                  <div
                    key={i}
                    className="relative text-xs px-3 py-2 rounded-xl border bg-red-50 border-red-200 text-red-900 break-words shadow-2xs min-h-[36px]"
                  >
                    <span>{ev.text}</span>
                    {ev.date && (
                      <span className="text-[10px] font-bold text-red-500 float-right ml-2 mt-0.5">
                        {ev.date}
                      </span>
                    )}
                  </div>
                ))}

                {allNegative.length === 0 && (
                  <p className="text-xs text-gray-400 italic py-4 text-center">
                    Nessun evento negativo registrato
                  </p>
                )}
              </div>

              {hasMoreNegative && (
                <div className="shrink-0 h-6 flex items-center justify-center select-none pt-0.5">
                  <span className="text-lg font-black tracking-widest text-red-600 leading-none">
                    •••
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* OVERLAY A TUTTA PAGINA PER EVENTI POSITIVI ESPANSI */}
          {expandedEventCategory === 'positive' && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-green-200">
              <div className="flex items-center justify-between pb-2.5 border-b border-green-200 shrink-0 bg-green-50/60 -m-3 p-3 rounded-t-2xl mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">❤</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-green-700">
                    Tutte le Cose Positive ({allPositive.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedEventCategory('none');
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-green-800 hover:bg-green-100 transition-colors cursor-pointer"
                  title="Chiudi visualizzazione estesa"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 p-1 pt-2">
                {allPositive.map((ev, i) => (
                  <div
                    key={i}
                    className="relative text-xs sm:text-sm px-3 py-2.5 rounded-xl border bg-green-50 border-green-200 text-green-900 break-words shadow-2xs"
                  >
                    <span>{ev.text}</span>
                    {ev.date && (
                      <span className="text-[10.5px] font-bold text-green-600 float-right ml-2 mt-0.5">
                        {ev.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OVERLAY A TUTTA PAGINA PER EVENTI NEGATIVI ESPANSI */}
          {expandedEventCategory === 'negative' && (
            <div className="absolute inset-0 z-50 bg-white flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-red-200">
              <div className="flex items-center justify-between pb-2.5 border-b border-red-200 shrink-0 bg-red-50/60 -m-3 p-3 rounded-t-2xl mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">💔</span>
                  <h3 className="text-xs font-black uppercase tracking-wider text-red-700">
                    Tutte le Cose Negative ({allNegative.length})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedEventCategory('none');
                  }}
                  className="p-1 rounded-full text-gray-400 hover:text-red-800 hover:bg-red-100 transition-colors cursor-pointer"
                  title="Chiudi visualizzazione estesa"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 p-1 pt-2">
                {allNegative.map((ev, i) => (
                  <div
                    key={i}
                    className="relative text-xs sm:text-sm px-3 py-2.5 rounded-xl border bg-red-50 border-red-200 text-red-900 break-words shadow-2xs"
                  >
                    <span>{ev.text}</span>
                    {ev.date && (
                      <span className="text-[10.5px] font-bold text-red-500 float-right ml-2 mt-0.5">
                        {ev.date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. RECAP VISTA: TASK COMPLETATE                                           */}
      {/* ========================================================================= */}
      {activeRecap === 'tasks' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3.5">
          {/* Banner Riassuntivo */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-xs flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100 mb-0.5">
              Task Completate
            </span>
            <div className="text-3xl font-extrabold mb-1">
              {reviewData.tasksCompleted}{' '}
              <span className="text-lg text-blue-200">/ {reviewData.tasksTotal}</span>
            </div>
            <div className="w-full max-w-xs bg-blue-800/40 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${tasksPercentage}%` }}
              />
            </div>
            <span className="text-[11px] text-blue-100 mt-1.5 font-medium">
              {tasksPercentage}% di completamento mensile
            </span>
          </div>

          {/* Elenco Dettagliato Task */}
          <div className="bg-white rounded-2xl p-3.5 border border-gray-200/90 shadow-2xs flex flex-col gap-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 pb-1 border-b border-gray-100">
              Elenco Task Concluse
            </h4>

            <div className="space-y-1.5">
              {reviewData.completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-800"
                >
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="flex-1 min-w-0 font-medium truncate">
                    {t.titolo}
                  </span>
                  {t.data_scadenza && (
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                      {formatShortDate(t.data_scadenza)}
                    </span>
                  )}
                </div>
              ))}

              {reviewData.completedTasks.length === 0 && (
                <p className="text-xs text-gray-400 italic text-center py-6">
                  Nessuna task completata questo mese
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. RECAP VISTA: HABITS & ROUTINE (Solo Giorni in cui Era Attiva)          */}
      {/* ========================================================================= */}
      {activeRecap === 'habits' && (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
          {activeHabitsInMonth.map(({ habit, activeDays, activeDayNumbers, completedDays, logDates }) => {
            return (
              <div
                key={habit.id}
                className="bg-gray-50 rounded-2xl p-2.5 border border-gray-200 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold text-gray-900 truncate flex items-center gap-1">
                    <span>{habit.tipo === 'R' ? '🔁' : '⭐'}</span>
                    <span className="truncate">{habit.titolo}</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 shrink-0">
                    {completedDays}/{activeDays} gg
                  </span>
                </div>

                {/* Griglia giorni: Tutti i giorni del mese mantengono la posizione precisa, i giorni non attivi sono invisibili */}
                <div className="flex gap-0.5 items-center w-full justify-between pt-0.5">
                  {allMonthDays.map((day) => {
                    const isActive = activeDayNumbers.includes(day);
                    const done = logDates.has(day);

                    if (!isActive) {
                      return (
                        <div
                          key={`d-${day}`}
                          className="flex-1 min-w-0 aspect-square max-h-6 invisible pointer-events-none"
                          aria-hidden="true"
                        />
                      );
                    }

                    return (
                      <div
                        key={`d-${day}`}
                        className={`flex-1 min-w-0 aspect-square max-h-6 rounded-[3px] flex items-center justify-center text-[7.5px] font-bold transition-colors ${
                          done
                            ? 'bg-green-500 text-white shadow-2xs'
                            : 'bg-gray-200/70 text-gray-400'
                        }`}
                        title={`Giorno ${day}${done ? ' ✓' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {activeHabitsInMonth.length === 0 && (
            <div className="flex items-center justify-center h-full min-h-[220px] p-4">
              <EmptyState message="Nessuna routine o abitudine attiva per questo mese" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(modalElement, document.body);
};

export default MobileMonthReviewModal;
