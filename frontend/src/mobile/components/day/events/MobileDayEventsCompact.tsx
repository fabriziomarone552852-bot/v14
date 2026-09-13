// src/mobile/components/day/events/MobileDayEventsCompact.tsx
import React from 'react';
import { CalendarIcon, ArrowDownIcon } from '@/components/shared/utils/Icons';
import { TruncatedTitle } from '@/components/shared/utils/TruncatedTitle';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import type { CalendarEvent } from '@/types';

export interface MobileDayEventsCompactProps {
  events: CalendarEvent[];
  visibleEvents: CalendarEvent[];
  hasMoreEvents: boolean;
  eventsListRef: React.RefObject<HTMLDivElement | null>;
  onExpandEvents: () => void;
  onOpenEventDetail: (event: CalendarEvent) => void;
}

export const MobileDayEventsCompact: React.FC<MobileDayEventsCompactProps> = ({
  events,
  visibleEvents,
  hasMoreEvents,
  eventsListRef,
  onExpandEvents,
  onOpenEventDetail,
}) => {
  return (
    <div
      onClick={onExpandEvents}
      className="flex-1 min-h-0 flex flex-col justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-2.5 overflow-hidden cursor-pointer active:border-blue-300 transition-colors select-none"
      title="Tocca per espandere gli eventi a schermo intero"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Eventi
          </h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {events.length}
          </span>
        </div>
      </div>

      <div
        ref={eventsListRef}
        className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden pt-1.5"
      >
        <div className="flex flex-col gap-1.5 overflow-hidden">
          {visibleEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={(e) => {
                e.stopPropagation();
                onOpenEventDetail(ev);
              }}
              className="flex items-center gap-2 bg-gray-50/80 hover:bg-blue-50/40 border border-gray-200/70 hover:border-blue-300 rounded-xl p-2 cursor-pointer active:scale-[0.99] transition-all shadow-2xs shrink-0 select-none"
            >
              <div className="w-10 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
                {ev.time && (
                  <span className="text-[10px] font-black text-gray-700">{ev.time}</span>
                )}
                {ev.endTime && (
                  <>
                    <ArrowDownIcon className="h-2 w-2 text-gray-400 my-0.2" />
                    <span className="text-[9px] font-semibold text-gray-500">{ev.endTime}</span>
                  </>
                )}
              </div>

              <div
                className="w-1.5 h-6 rounded-full shrink-0"
                style={{
                  backgroundColor: ev.categoryColor?.startsWith('#')
                    ? ev.categoryColor
                    : '#3b82f6',
                }}
              />

              <div className="flex-1 min-w-0">
                <TruncatedTitle title={ev.title} />
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="h-full flex items-center justify-center py-2">
              <EmptyState message="Nessun evento per questo giorno" />
            </div>
          )}
        </div>

        {hasMoreEvents && (
          <div className="shrink-0 h-7 flex items-center justify-center select-none pt-0.5">
            <span className="text-xl font-black tracking-widest text-blue-500 hover:text-blue-600 leading-none">
              •••
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
