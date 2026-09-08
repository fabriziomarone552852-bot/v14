// src/mobile/components/MobileMonthCalendar.tsx
import React, { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { CalendarEvent, DbTask, Category, DailyEntry } from '@/types';
import { formatDateString, pad } from '@/utils/dateUtils';
import { isEventInDay } from '@/utils/eventUtils';
import { getHexColor, getDynamicStyles } from '@/utils/uiUtils';
import {
  CheckIcon,
  CalendarIcon,
  TaskListIcon,
  CloseIcon,
  ArrowDownIcon,
} from '@/components/shared/utils/Icons';

interface MobileMonthCalendarProps {
  targetDate: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask, newStatus: boolean) => Promise<void> | void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

const DAY_NAMES = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

export const MobileMonthCalendar: React.FC<MobileMonthCalendarProps> = ({
  targetDate,
  events,
  tasks = [],
  dailyEntries = [],
  allCategories = [],
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onToggleTask,
  onOpenExpandedTasks: _onOpenExpandedTasks,
}) => {
  const todayStr = useMemo(() => formatDateString(new Date()), []);

  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();

  // 1. Calcolo giorni del mese
  const { firstDayIndex, daysInMonth, totalGridCells } = useMemo(() => {
    const firstDay = new Date(year, monthIndex, 1);
    const daysCount = new Date(year, monthIndex + 1, 0).getDate();
    // Monday = 0, Tuesday = 1, ..., Sunday = 6
    const startIdx = (firstDay.getDay() + 6) % 7;
    const totalSlots = Math.ceil((startIdx + daysCount) / 7) * 7;
    return {
      firstDayIndex: startIdx,
      daysInMonth: daysCount,
      totalGridCells: totalSlots,
    };
  }, [year, monthIndex]);

  // 2. Mappatura rapida dei Mood giornalieri (tipo 'PX')
  const moodsByDate = useMemo(() => {
    const map: Record<string, Category> = {};
    if (dailyEntries && Array.isArray(dailyEntries)) {
      dailyEntries.forEach((entry) => {
        if (entry.tipo === 'PX') {
          const d = entry.data_riferimento || (entry as unknown as { dateStr?: string }).dateStr;
          if (d && entry.category_id) {
            const cat = allCategories.find((c) => c.id === entry.category_id);
            if (cat) map[d] = cat;
          }
        }
      });
    }
    return map;
  }, [dailyEntries, allCategories]);

  // 3. Mappatura rapida delle Task per data
  const tasksByDate = useMemo(() => {
    const map: Record<string, DbTask[]> = {};
    tasks.forEach((t) => {
      if (t.data_scadenza) {
        const dateStr = t.data_scadenza.substring(0, 10);
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(t);
      }
    });
    return map;
  }, [tasks]);

  // 4. Mappatura rapida degli Eventi per data
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${year}-${pad(monthIndex + 1)}-${pad(i)}`;
      map[dateKey] = events.filter((e) => isEventInDay(e, dateKey));
    }
    return map;
  }, [events, year, monthIndex, daysInMonth]);

  // 5. STATO NUVOLETTA (POPOVER DEL GIORNO CLICCATO)
  const [selectedDateForPopup, setSelectedDateForPopup] = useState<string | null>(null);

  // 6. GESTIONE LONG PRESS VS TAP RAPIDO SUL QUADRATO DEL GIORNO
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef<boolean>(false);

  const startLongPress = (dateStr: string) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
      setSelectedDateForPopup(null);
      onDayClick(dateStr);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleDayTouchEnd = (dateStr: string) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!isLongPressTriggeredRef.current) {
      // Tap rapido: apri la nuvoletta centrata nella griglia
      setSelectedDateForPopup((prev) => (prev === dateStr ? null : dateStr));
    }
  };

  // Dati reattivi per la nuvoletta attualmente aperta
  const popupDayEvents = selectedDateForPopup ? eventsByDate[selectedDateForPopup] || [] : [];
  const popupDayTasks = selectedDateForPopup ? tasksByDate[selectedDateForPopup] || [] : [];
  const popupDayMood = selectedDateForPopup ? moodsByDate[selectedDateForPopup] : undefined;

  const formattedPopupDate = useMemo(() => {
    if (!selectedDateForPopup) return '';
    const [y, m, d] = selectedDateForPopup.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const formatted = format(dateObj, 'EEEE d MMMM', { locale: it });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }, [selectedDateForPopup]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden select-none relative">
      {/* HEADER DEI 7 GIORNI (LUN - DOM) */}
      <div className="grid grid-cols-7 gap-1 pb-1 border-b border-gray-100 shrink-0 text-center items-center">
        {DAY_NAMES.map((dayName, i) => (
          <div
            key={`header-${i}`}
            className="text-[10px] font-black text-gray-500 uppercase tracking-wider py-0.5"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* CORPO GRIGLIA MENSILE ZERO-SCROLL */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 pt-1 auto-rows-fr">
        {/* Celle vuote inizio mese */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`empty-start-${i}`}
            className="rounded-xl border border-transparent bg-gray-50/20 opacity-30 min-h-0"
          />
        ))}

        {/* Giorni del Mese Corrente */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateKey = `${year}-${pad(monthIndex + 1)}-${pad(dayNum)}`;
          const isToday = dateKey === todayStr;
          const isSelected = selectedDateForPopup === dateKey;

          const dayEvents = eventsByDate[dateKey] || [];
          const dayTasks = tasksByDate[dateKey] || [];
          const mood = moodsByDate[dateKey];

          const completedTasksCount = dayTasks.filter((t) => !!t.fatto).length;
          const totalTasksCount = dayTasks.length;

          // Stile dinamico per il Mood di sfondo/bordo se registrato
          const moodColorHex = mood?.colore ? getHexColor(mood.colore) : undefined;

          return (
            <div
              key={dateKey}
              onTouchStart={() => startLongPress(dateKey)}
              onTouchEnd={() => handleDayTouchEnd(dateKey)}
              onTouchMove={cancelLongPress}
              onMouseDown={() => startLongPress(dateKey)}
              onMouseUp={() => handleDayTouchEnd(dateKey)}
              onMouseLeave={cancelLongPress}
              className={`relative rounded-xl border p-1 flex flex-col justify-between overflow-hidden cursor-pointer transition-all active:scale-[0.97] ${
                isSelected
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/50 shadow-xs'
                  : isToday
                  ? 'bg-amber-50/40 border-amber-300 ring-2 ring-amber-400/30'
                  : moodColorHex
                  ? 'border-gray-200/90 hover:border-blue-300'
                  : 'bg-gray-50/40 hover:bg-blue-50/30 border-gray-200/70 hover:border-blue-200'
              }`}
              style={
                moodColorHex && !isToday && !isSelected
                  ? { backgroundColor: `${moodColorHex}12`, borderColor: `${moodColorHex}50` }
                  : undefined
              }
              title="Tocca per aprire anteprima • Tieni premuto per aprire il giorno"
            >
              {/* RIGA SUPERIORE: NUMERO DEL GIORNO + PALLINO MOOD SE PRESENTE */}
              <div className="flex items-center justify-between w-full leading-none shrink-0 pointer-events-none">
                <span
                  className={`text-[10px] w-4 h-4 flex items-center justify-center rounded-full transition-all ${
                    isToday
                      ? 'bg-amber-500 text-white font-black shadow-xs'
                      : 'text-gray-700 font-extrabold'
                  }`}
                >
                  {dayNum}
                </span>

                {mood && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: moodColorHex || '#9ca3af' }}
                    title={`Umore: ${mood.category_name}`}
                  />
                )}
              </div>

              {/* AREA CENTRALE: EVENTI COMPATTI (1-2 barrette o +N) */}
              <div className="flex-1 min-h-0 flex flex-col gap-0.5 justify-start overflow-hidden my-0.5 pointer-events-none">
                {dayEvents.slice(0, 2).map((ev, idx) => {
                  const hex = getHexColor(ev.categoryColor);
                  const dyn = getDynamicStyles(hex);

                  return (
                    <div
                      key={`ev-${ev.id}-${idx}`}
                      className="w-full rounded px-1 py-[1px] text-[7.5px] font-bold leading-tight truncate border-l-[2px] shadow-2xs shrink-0"
                      style={{
                        backgroundColor: dyn.bg || '#eff6ff',
                        borderLeftColor: hex,
                        color: dyn.text || '#1e3a8a',
                      }}
                      title={`${ev.time ? ev.time + ' ' : ''}${ev.title}`}
                    >
                      {ev.time ? `${ev.time.slice(0, 5)} ` : ''}
                      {ev.title}
                    </div>
                  );
                })}

                {dayEvents.length > 2 && (
                  <span className="text-[7px] font-black text-blue-600 text-center leading-none">
                    +{dayEvents.length - 2} altri
                  </span>
                )}
              </div>

              {/* RIGA INFERIORE: BADGE COMPATTO TASK */}
              {totalTasksCount > 0 && (
                <div
                  className="mx-auto px-1 py-[1px] rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-0.5 shadow-2xs text-[7.5px] font-black shrink-0 pointer-events-none"
                  title={`${completedTasksCount}/${totalTasksCount} task completate`}
                >
                  <CheckIcon className="w-2 h-2" />
                  <span>
                    {completedTasksCount}/{totalTasksCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Celle vuote fine mese */}
        {Array.from({ length: totalGridCells - (firstDayIndex + daysInMonth) }).map((_, i) => (
          <div
            key={`empty-end-${i}`}
            className="rounded-xl border border-transparent bg-gray-50/20 opacity-30 min-h-0"
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 7. NUVOLETTA DETTAGLI GIORNO (CENTRATA NELLA GRIGLIA, SENZA OSCURARE)      */}
      {/* ========================================================================= */}
      {selectedDateForPopup && (
        <>
          {/* Backdrop trasparente per intercettare il tap fuori senza oscurare dietro */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setSelectedDateForPopup(null)}
          />

          {/* Contenitore Nuvoletta centrato nella griglia */}
          <div
            className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-20px)] max-w-[280px] animate-fadeIn select-none pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex flex-col gap-2 transition-all">
              {/* 1. Header Nuvoletta: Data Formattata + Mood Badge + Tasto Chiudi */}
              <div className="flex items-center justify-between gap-1 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <h4 className="text-xs font-black text-gray-900 truncate">
                    {formattedPopupDate}
                  </h4>
                  {popupDayMood && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate shrink-0 border"
                      style={{
                        backgroundColor: `${getHexColor(popupDayMood.colore || undefined)}20`,
                        borderColor: getHexColor(popupDayMood.colore || undefined),
                        color: getHexColor(popupDayMood.colore || undefined),
                      }}
                      title={`Umore: ${popupDayMood.category_name}`}
                    >
                      {popupDayMood.category_name}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDateForPopup(null)}
                  className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer shrink-0"
                  title="Chiudi"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. Corpo Nuvoletta: Lista Eventi & Task Cliccabili */}
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-2.5 pr-0.5">
                {/* SEZIONE EVENTI */}
                {popupDayEvents.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                      <CalendarIcon className="w-3 h-3" />
                      <span>Eventi ({popupDayEvents.length})</span>
                    </div>

                    <div className="space-y-1">
                      {popupDayEvents.map((ev) => {
                        const hex = getHexColor(ev.categoryColor);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => {
                              setSelectedDateForPopup(null);
                              onSelectEvent(ev);
                            }}
                            className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 rounded-xl p-2 cursor-pointer active:scale-[0.99] transition-all shadow-2xs"
                          >
                            {ev.time && (
                              <div className="flex flex-col items-center justify-center shrink-0 text-center leading-tight pr-1 border-r border-gray-200/60">
                                <span className="text-[10px] font-black text-gray-700">
                                  {ev.time.slice(0, 5)}
                                </span>
                                {ev.endTime && (
                                  <>
                                    <ArrowDownIcon className="h-2 w-2 text-gray-400 my-0.2" />
                                    <span className="text-[9px] font-semibold text-gray-500">
                                      {ev.endTime.slice(0, 5)}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}

                            <div
                              className="w-1.5 h-6 rounded-full shrink-0"
                              style={{ backgroundColor: hex }}
                            />

                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-gray-900 truncate leading-snug">
                                {ev.title}
                              </p>
                              {ev.location && (
                                <p className="text-[9px] text-gray-500 truncate mt-0.5">
                                  📍 {ev.location}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SEZIONE TASK */}
                {popupDayTasks.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      <TaskListIcon className="w-3 h-3" />
                      <span>Task ({popupDayTasks.length})</span>
                    </div>

                    <div className="space-y-1">
                      {popupDayTasks.map((t) => {
                        const catColor = getHexColor(t.category?.colore || '#3b82f6');
                        return (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedDateForPopup(null);
                              onSelectTask?.(t);
                            }}
                            className={`flex items-center gap-2 rounded-xl p-2 border cursor-pointer active:scale-[0.99] transition-all shadow-2xs ${
                              t.fatto
                                ? 'bg-gray-100/70 border-gray-200 text-gray-400'
                                : 'bg-gray-50 hover:bg-emerald-50/40 border-gray-200/80 text-gray-800'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTask?.(t, !t.fatto);
                              }}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                                t.fatto
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'border-gray-300 hover:border-emerald-500 bg-white'
                              }`}
                            >
                              {t.fatto && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                            </button>

                            <div
                              className="w-1.5 h-5 rounded-full shrink-0"
                              style={{ backgroundColor: t.fatto ? '#9ca3af' : catColor }}
                            />

                            <span
                              className={`text-[11px] font-bold truncate flex-1 min-w-0 ${
                                t.fatto ? 'line-through opacity-70' : ''
                              }`}
                              title={t.titolo}
                            >
                              {t.titolo || 'Senza Titolo'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NESSUN ELEMENTO */}
                {popupDayEvents.length === 0 && popupDayTasks.length === 0 && (
                  <div className="py-3 text-center text-xs font-semibold text-gray-400">
                    Nessun evento o task in questo giorno
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileMonthCalendar;
