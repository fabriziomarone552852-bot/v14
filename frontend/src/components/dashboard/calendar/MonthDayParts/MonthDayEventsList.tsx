// frontend/src/components/dashboard/calendar/MonthDayParts/MonthDayEventsList.tsx
import React from 'react';
import type { CalendarGridItem } from '../MonthGrid';
import type { CalendarEvent } from '@/types';
import { getHexColor } from '@/utils/uiUtils';
import { TimeDisplay, DateRangeDisplay } from '@/components/shared/utils/DateTimeDisplays';

interface MonthDayEventsListProps {
  items: CalendarGridItem[];
  dateKey: string;
  popoverAlignClass: string;
  isHovered: boolean;
  isMoodMenuOpen: boolean;
  isTaskPopoverOpen: boolean;
  onSelectEvent?: (event: CalendarEvent) => void;
}

export const MonthDayEventsList: React.FC<MonthDayEventsListProps> = ({
  items,
  dateKey,
  popoverAlignClass,
  isHovered,
  isMoodMenuOpen,
  isTaskPopoverOpen,
  onSelectEvent,
}) => {
  const eventItems = items.filter((i) => i.type === 'event');
  const visibleEvents = eventItems.slice(0, 3);
  const hiddenCount = eventItems.length - 3;

  return (
    <>
      {/* MACRO EVENTI (3 barrette ultra-compatte che entrano al 100% senza tagli) */}
      <div className="flex flex-col gap-[2px] w-full overflow-hidden pointer-events-none mt-0.5 pb-0.5">
        {visibleEvents.map((item, idx) => {
          const catColor = getHexColor(item.categoryColor);
          return (
            <div
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                if (item.originalItem && onSelectEvent) {
                  onSelectEvent(item.originalItem as CalendarEvent);
                }
              }}
              className="w-full flex items-center gap-1 px-1 py-[0.5px] rounded text-[7.5px] leading-tight font-extrabold border-l-[2px] shadow-2xs overflow-hidden shrink-0 pointer-events-auto cursor-pointer hover:brightness-95 transition-all"
              style={{
                borderLeftColor: catColor,
                backgroundColor: `${catColor}25`,
                color: '#1e293b',
              }}
            >
              <span className="truncate flex-1 min-w-0" title={item.title}>
                {item.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* 🪄 ORECCHIA DI PAGINA (DOG-EAR FOLD) CON +N SEMPRE VISIBILE IN IDLE */}
      {hiddenCount > 0 && (
        <div
          className="absolute bottom-0 right-0 z-20 pointer-events-none"
          title={`+${hiddenCount} altri eventi`}
        >
          <div className="relative flex items-end justify-end">
            {/* Triangolo della piegatura del foglio con ombra */}
            <div className="w-0 h-0 border-b-[18px] border-b-gray-300/90 border-l-[18px] border-l-transparent rounded-br-lg shadow-2xs" />
            {/* Testo +N SEMPRE VISIBILE sulla piegatura */}
            <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black text-gray-800 leading-none select-none">
              +{hiddenCount}
            </span>
          </div>
        </div>
      )}

      {/* TOOLTIP HOVER CON Z-[1000] E POSIZIONAMENTO INTELLIGENTE (Solo per Eventi) */}
      {isHovered && !isMoodMenuOpen && !isTaskPopoverOpen && eventItems.length > 0 && (
        <div
          className={`absolute bottom-full mb-1 w-56 pb-2 cursor-default z-[1000] ${popoverAlignClass}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-900 text-white rounded-xl shadow-2xl p-3 text-left border border-gray-800 animate-fadeIn relative">
            <p className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">
              Eventi del {dateKey.split('-').reverse().slice(0, 2).join('/')}
            </p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              {eventItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs w-full min-w-0 py-0.5">
                  <span
                    className={`h-1.5 rounded-full flex-shrink-0 ${item.isMultiDay ? 'w-3' : 'w-1.5'}`}
                    style={{ backgroundColor: getHexColor(item.categoryColor) }}
                  />
                  <div className="flex-1 min-w-0 text-gray-200 flex items-center gap-1.5 truncate">
                    <span className="text-[9px] font-bold text-gray-400 shrink-0 inline-flex items-center">
                      {item.dateStr && item.endDateStr && item.dateStr !== item.endDateStr ? (
                        <DateRangeDisplay startStr={item.dateStr} endStr={item.endDateStr} />
                      ) : (
                        <TimeDisplay time={item.time} endTime={item.endTime} />
                      )}
                    </span>
                    <span
                      className={`truncate ${item.done ? 'line-through text-gray-500 italic' : ''}`}
                      title={item.title}
                    >
                      {item.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
