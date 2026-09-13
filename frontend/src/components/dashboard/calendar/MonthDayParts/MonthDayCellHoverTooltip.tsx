// src/components/dashboard/calendar/MonthDayParts/MonthDayCellHoverTooltip.tsx
import React from 'react';
import { getHexColor } from '@/utils/uiUtils';
import { TimeDisplay, DateRangeDisplay } from '@/components/shared/utils/DateTimeDisplays';
import { CalendarIcon, TaskListIcon } from '@/components/shared/utils/Icons';
import type { CalendarGridItem } from '../MonthGrid';

interface MonthDayCellHoverTooltipProps {
  headerDateTitle: string;
  dayEvents: CalendarGridItem[];
  dayTasks: CalendarGridItem[];
  popoverAlignClass: string;
}

export const MonthDayCellHoverTooltip: React.FC<MonthDayCellHoverTooltipProps> = ({
  headerDateTitle,
  dayEvents,
  dayTasks,
  popoverAlignClass,
}) => {
  return (
    <div
      className={`absolute bottom-full mb-2 bg-slate-900 text-white rounded-xl shadow-xl p-3 border border-slate-800 text-xs z-[100] w-64 animate-fadeIn pointer-events-none ${popoverAlignClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="font-extrabold text-[11px] text-blue-300 uppercase tracking-wider border-b border-slate-700 pb-1 mb-2 text-left">
        {headerDateTitle}
      </div>

      {dayEvents.length > 0 && (
        <div className={dayTasks.length > 0 ? 'mb-2' : ''}>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
            <CalendarIcon className="w-3 h-3 text-blue-400" /> Eventi
          </div>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
            {dayEvents.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate flex items-center gap-1.5 border-l-2 border-blue-500 text-left"
                style={item.categoryColor ? { borderLeftColor: getHexColor(item.categoryColor) } : undefined}
              >
                <span className="text-[9px] font-bold text-slate-400 shrink-0 inline-flex items-center">
                  {item.dateStr && item.endDateStr && item.dateStr !== item.endDateStr ? (
                    <DateRangeDisplay startStr={item.dateStr} endStr={item.endDateStr} />
                  ) : (
                    <TimeDisplay time={item.time} endTime={item.endTime} />
                  )}
                </span>
                <span className="truncate flex-1" title={item.title}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {dayTasks.length > 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1">
            <TaskListIcon className="w-3 h-3 text-emerald-400" /> Task in Scadenza
          </div>
          <div className="flex flex-col gap-1 max-h-36 overflow-y-auto pr-0.5 custom-scrollbar">
            {dayTasks.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-800/80 rounded px-2 py-1 text-[11px] font-medium text-slate-200 truncate flex items-center justify-between border-l-2 border-emerald-500 text-left"
                style={item.categoryColor ? { borderLeftColor: getHexColor(item.categoryColor) } : undefined}
              >
                <span className={`truncate flex-1 ${item.done ? 'line-through text-slate-500 italic' : ''}`} title={item.title}>
                  {item.title}
                </span>
                {item.done && <span className="text-[9px] text-emerald-400 font-bold ml-1 shrink-0">✓ Fatto</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
