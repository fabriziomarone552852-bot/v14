// src/mobile/components/calendar/MobileMonthDayCell.tsx
import React from 'react';
import type { CalendarEvent, DbTask, Category } from '@/types';
import { getHexColor, getDynamicStyles } from '@/utils/uiUtils';
import { CheckIcon } from '@/components/shared/utils/Icons';

interface MobileMonthDayCellProps {
  dayNum: number;
  dateKey: string;
  isToday: boolean;
  isSelected: boolean;
  dayEvents: CalendarEvent[];
  dayTasks: DbTask[];
  mood?: Category;
  onStartLongPress: (dateKey: string) => void;
  onDayTouchEnd: (dateKey: string) => void;
  onCancelLongPress: () => void;
}

export const MobileMonthDayCell: React.FC<MobileMonthDayCellProps> = ({
  dayNum,
  dateKey,
  isToday,
  isSelected,
  dayEvents,
  dayTasks,
  mood,
  onStartLongPress,
  onDayTouchEnd,
  onCancelLongPress,
}) => {
  const completedTasksCount = dayTasks.filter((t) => !!t.fatto).length;
  const totalTasksCount = dayTasks.length;

  // Stile dinamico per il Mood di sfondo/bordo se registrato
  const moodColorHex = mood?.colore ? getHexColor(mood.colore) : undefined;

  return (
    <div
      onTouchStart={() => onStartLongPress(dateKey)}
      onTouchEnd={() => onDayTouchEnd(dateKey)}
      onTouchMove={onCancelLongPress}
      onMouseDown={() => onStartLongPress(dateKey)}
      onMouseUp={() => onDayTouchEnd(dateKey)}
      onMouseLeave={onCancelLongPress}
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
};

export default MobileMonthDayCell;
