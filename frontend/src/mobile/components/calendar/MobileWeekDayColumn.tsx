// src/mobile/components/calendar/MobileWeekDayColumn.tsx
import React from 'react';
import type { CalendarEvent, DbTask } from '@/types';
import type { ComputedDayData, SafeTask } from '@/utils/calendarLayoutUtils';
import { getHexColor, getDynamicStyles } from '@/utils/uiUtils';
import { CheckIcon } from '@/components/shared/utils/Icons';

interface MobileWeekDayColumnProps {
  dayData: ComputedDayData;
  isToday: boolean;
  onDayClick: (dateStr: string) => void;
  onEventClick: (e: React.MouseEvent, ev: CalendarEvent, isSunday: boolean) => void;
  onSelectTask?: (task: DbTask) => void;
  onOpenExpandedTasks?: (dateStr: string, dayTasks: DbTask[]) => void;
}

export const MobileWeekDayColumn: React.FC<MobileWeekDayColumnProps> = ({
  dayData,
  isToday,
  onDayClick,
  onEventClick,
  onSelectTask,
  onOpenExpandedTasks,
}) => {
  const { day, multiDayEvents, positionedEvents, dayTasks } = dayData;
  const isSunday = day.nameShort === 'DOM';
  const completedTasksCount = (dayTasks as SafeTask[]).filter((t) => t.fatto).length;
  const totalTasksCount = dayTasks.length;

  return (
    <div
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
                  onEventClick(e, ev, isSunday);
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
                onEventClick(e, pEv.ev, isSunday);
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
};

export default MobileWeekDayColumn;
