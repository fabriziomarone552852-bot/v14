// src/mobile/components/MobileWeekCalendar.tsx
import React, { useState, useMemo } from 'react';
import type { CalendarEvent, DbTask } from '@/types';
import { formatDateString } from '@/utils/dateUtils';
import { computeWeekLayout, type ComputedDayData, type SafeTask } from '@/utils/calendarLayoutUtils';
import { getHexColor, getDynamicStyles } from '@/utils/uiUtils';
import { CheckIcon } from '@/components/shared/utils/Icons';

interface MobileWeekCalendarProps {
  monday: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
  onDayClick: (dateStr: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

export const MobileWeekCalendar: React.FC<MobileWeekCalendarProps> = ({
  monday,
  events,
  tasks = [],
  onDayClick,
  onSelectEvent,
  onSelectTask,
  onOpenExpandedTasks,
}) => {
  const todayStr = useMemo(() => formatDateString(new Date()), []);

  // Stato per la "nuvoletta" overlay al click sull'evento
  const [selectedEventForPopup, setSelectedEventForPopup] = useState<CalendarEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
    isTopHalf: boolean;
    arrowX: number;
  } | null>(null);

  const handleEventClick = (e: React.MouseEvent, ev: CalendarEvent, isSunday: boolean = false) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const isTopHalf = rect.top < window.innerHeight / 2;

    const popupWidth = 190;
    
    // Per Domenica, sposta verso sinistra verso l'interno della griglia
    // Per gli altri giorni (Lun - Sab), centra orizzontalmente rispetto all'evento/giorno
    const targetLeft = isSunday
      ? rect.right - popupWidth - 10
      : centerX - popupWidth / 2;

    // Clamp per evitare sbordamenti (rimane ad almeno 10px dal bordo sinistro e destro dello schermo)
    const clampedLeft = Math.max(10, Math.min(window.innerWidth - popupWidth - 10, targetLeft));

    setPopupPosition({
      x: clampedLeft,
      y: isTopHalf ? rect.bottom + 6 : rect.top - 6,
      isTopHalf,
      arrowX: Math.max(14, Math.min(popupWidth - 14, centerX - clampedLeft)),
    });
    setSelectedEventForPopup(ev);
  };

  // 1. Costruzione dei 7 giorni della settimana (da Lunedì a Domenica)
  const daysOfWeekData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatDateString(d);
      return {
        nameShort: DAY_NAMES_SHORT[i],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dateStr,
      };
    });
  }, [monday]);

  // 2. Calcolo del layout eventi e task tramite l'utility di sistema
  const computedWeekData: ComputedDayData[] = useMemo(() => {
    return computeWeekLayout(daysOfWeekData, events, tasks);
  }, [daysOfWeekData, events, tasks]);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-1.5 overflow-hidden select-none relative">
      
      {/* 1. HEADER DEI GIORNI (LUN - DOM) CON GRIGLIA A 8 COLONNE (Ora + 7 Giorni) */}
      <div className="grid grid-cols-[18px_repeat(7,_1fr)] gap-1 pb-1.5 border-b border-gray-100 shrink-0 items-center text-center">
        {/* Spazio allineamento asse orario */}
        <div className="text-[9px] font-bold text-gray-400">h</div>

        {computedWeekData.map(({ day }) => {
          const isToday = day.dateStr === todayStr;
          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onDayClick(day.dateStr)}
              className={`flex flex-col items-center justify-center py-0.5 px-0.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                isToday
                  ? 'bg-amber-500 text-white shadow-xs font-black'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={`Vai a ${day.nameShort} ${day.dayNum}`}
            >
              <span className={`text-[9px] font-bold leading-none ${isToday ? 'text-amber-100' : 'text-gray-400'}`}>
                {day.nameShort}
              </span>
              <span className={`text-xs font-black leading-tight mt-0.5 ${isToday ? 'text-white font-black' : 'text-gray-800'}`}>
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. CORPO DELLA GRIGLIA ORARIA COMPRESSA ZERO-SCROLL (00:00 -> 24:00) */}
      <div className="grid grid-cols-[18px_repeat(7,_1fr)] gap-1 flex-1 min-h-0 pt-1 relative overflow-hidden">
        
        {/* COLONNA MARCATRICI ORARIE (6 a 25%, 12 a 50%, 18 a 75%) */}
        <div className="relative h-full border-r border-gray-100/60 pointer-events-none select-none">
          <span className="absolute top-[25%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            6
          </span>
          <span className="absolute top-[50%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            12
          </span>
          <span className="absolute top-[75%] -translate-y-1/2 left-0 right-1 text-[9px] font-bold text-gray-400 text-right leading-none">
            18
          </span>
        </div>

        {/* 7 COLONNE GIORNALIERE */}
        {computedWeekData.map(({ day, multiDayEvents, positionedEvents, dayTasks }) => {
          const isToday = day.dateStr === todayStr;
          const isSunday = day.nameShort === 'DOM';
          const completedTasksCount = (dayTasks as SafeTask[]).filter((t) => t.fatto).length;
          const totalTasksCount = dayTasks.length;

          return (
            <div
              key={day.dateStr}
              onClick={() => onDayClick(day.dateStr)}
              className={`relative h-full flex flex-col rounded-xl overflow-hidden cursor-pointer transition-colors border ${
                isToday
                  ? 'bg-amber-50/20 border-amber-200/60 hover:bg-amber-50/40'
                  : 'bg-gray-50/40 border-gray-100 hover:bg-gray-50'
              }`}
              title={`Tocca per aprire ${day.nameShort} ${day.dayNum}`}
            >
              {/* LINEE GUIDA ORARIE DI BACKGROUND (06:00 a 25%, 12:00 a 50%, 18:00 a 75%) */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-[25%] left-0 right-0 border-b border-dashed border-gray-200/70" />
                <div className="absolute top-[50%] left-0 right-0 border-b border-dashed border-gray-200/70" />
                <div className="absolute top-[75%] left-0 right-0 border-b border-dashed border-gray-200/70" />
              </div>

              {/* EVENTI TUTTO IL GIORNO (In cima alla colonna) */}
              {multiDayEvents.length > 0 && (
                <div className="relative z-20 flex flex-col gap-0.5 p-0.5 shrink-0">
                  {multiDayEvents.slice(0, 2).map(({ ev }, idx) => {
                    const hex = getHexColor(ev.categoryColor);
                    const dyn = getDynamicStyles(hex);
                    return (
                      <div
                        key={`allday-${ev.id}-${idx}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(e, ev, isSunday);
                        }}
                        className="rounded px-1 py-0.5 text-[8px] font-bold truncate shadow-2xs border-l-2 active:scale-95 transition-transform cursor-pointer"
                        style={{
                          backgroundColor: dyn.bg || '#eff6ff',
                          borderColor: hex,
                          color: dyn.text || '#1e3a8a',
                        }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    );
                  })}
                  {multiDayEvents.length > 2 && (
                    <span className="text-[7px] font-bold text-gray-500 text-center leading-none">
                      +{multiDayEvents.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* EVENTI A TEMPO POSIZIONATI PROPORZIONALMENTE (00:00 -> 24:00) */}
              <div className="flex-1 min-h-0 relative z-10 mx-0.5">
                {positionedEvents.map((pEv, idx) => {
                  const hex = getHexColor(pEv.ev.categoryColor);
                  const dyn = getDynamicStyles(hex);

                  const widthPercent = 100 / Math.max(1, pEv.totalColumns);
                  const leftPercent = pEv.column * widthPercent;

                  return (
                    <div
                      key={`timed-${pEv.ev.id}-${idx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(e, pEv.ev, isSunday);
                      }}
                      className="absolute rounded-[4px] border-l-2 shadow-2xs p-0.5 flex flex-col justify-start overflow-hidden active:scale-95 transition-all cursor-pointer hover:brightness-95"
                      style={{
                        top: pEv.seg.top,
                        height: pEv.seg.height,
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        minHeight: '22px',
                        backgroundColor: dyn.bg || '#f3f4f6',
                        borderColor: hex,
                        zIndex: 10 + pEv.column,
                      }}
                      title={`${pEv.ev.time ? pEv.ev.time + ' - ' : ''}${pEv.ev.title}`}
                    >
                      {/* RIGO 1: Orario più grande */}
                      {pEv.ev.time && (
                        <span
                          className="text-[9px] font-black leading-none truncate"
                          style={{ color: dyn.text || '#111827' }}
                        >
                          {pEv.ev.time.slice(0, 5)}
                        </span>
                      )}

                      {/* RIGO 2: Nome dell'evento */}
                      <span
                        className="text-[8px] font-semibold leading-tight truncate mt-0.5"
                        style={{ color: dyn.text || '#374151' }}
                      >
                        {pEv.ev.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* BADGE COMPATTO TASK IN BASSO */}
              {totalTasksCount > 0 && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (totalTasksCount === 1) {
                      onSelectTask?.(dayTasks[0] as DbTask);
                    } else {
                      onOpenExpandedTasks?.(day.dateStr, dayTasks as DbTask[]);
                    }
                  }}
                  className="relative z-20 mx-auto mb-1 px-1 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center gap-0.5 shadow-2xs text-[8px] font-black shrink-0 transition-transform active:scale-90 cursor-pointer"
                  title={`${completedTasksCount}/${totalTasksCount} task completate. Tocca per aprire.`}
                >
                  <CheckIcon className="w-2.5 h-2.5" />
                  <span>
                    {completedTasksCount}/{totalTasksCount}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. NUVOLETTA / OVERLAY DETTAGLI RAPIDI EVENTO (Al 1° Click) */}
      {selectedEventForPopup && popupPosition && (
        <>
          {/* Backdrop trasparente SENZA oscurare nulla sotto */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setSelectedEventForPopup(null)}
          />

          {/* Nuvoletta ancorata con apertura modale al 2° Click */}
          <div
            className="fixed z-50 animate-fadeIn select-none"
            style={{
              left: popupPosition.x,
              top: popupPosition.isTopHalf ? popupPosition.y : 'auto',
              bottom: !popupPosition.isTopHalf ? window.innerHeight - popupPosition.y : 'auto',
              width: '190px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              onClick={() => {
                const target = selectedEventForPopup;
                setSelectedEventForPopup(null);
                onSelectEvent(target);
              }}
              className="relative bg-white rounded-2xl shadow-xl border border-gray-200/90 p-2.5 cursor-pointer hover:border-blue-400 active:scale-[0.98] transition-all group"
            >
              {/* Freccetta / Puntatore ancorato al centro dell'evento */}
              {popupPosition.isTopHalf ? (
                <div
                  className="absolute -top-1 w-2.5 h-2.5 bg-white border-t border-l border-gray-200 rotate-45"
                  style={{ left: `${popupPosition.arrowX - 5}px` }}
                />
              ) : (
                <div
                  className="absolute -bottom-1 w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45"
                  style={{ left: `${popupPosition.arrowX - 5}px` }}
                />
              )}

              {/* Header Nuvoletta: Orario/Data + Pallino Categoria */}
              <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-gray-100">
                {selectedEventForPopup.time ? (
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                    {selectedEventForPopup.time}
                    {selectedEventForPopup.endTime ? ` → ${selectedEventForPopup.endTime}` : ''}
                  </span>
                ) : selectedEventForPopup.endDateStr &&
                  selectedEventForPopup.endDateStr !== selectedEventForPopup.dateStr ? (
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full truncate">
                    {selectedEventForPopup.dateStr} → {selectedEventForPopup.endDateStr}
                  </span>
                ) : null}

                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs ml-auto"
                  style={{
                    backgroundColor: getHexColor(selectedEventForPopup.categoryColor),
                  }}
                  title={selectedEventForPopup.category || 'Categoria'}
                />
              </div>

              {/* Titolo evento & Luogo */}
              <div className="pt-1.5 pb-0.5">
                <p className="text-xs font-black text-gray-900 leading-snug break-words">
                  {selectedEventForPopup.title}
                </p>
                {selectedEventForPopup.location && (
                  <p className="text-[10px] text-gray-500 font-medium truncate mt-1">
                    📍 {selectedEventForPopup.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileWeekCalendar;
