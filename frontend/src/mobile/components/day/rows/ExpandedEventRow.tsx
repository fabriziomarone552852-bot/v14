// src/mobile/components/day/rows/ExpandedEventRow.tsx
import React from 'react';
import { ArrowDownIcon } from '@/components/shared/utils/Icons';
import { TruncatedTitle } from '@/components/shared/utils/TruncatedTitle';
import { useLongPress } from '@/mobile/hooks/useLongPress';
import type { CalendarEvent } from '@/types';

export interface ExpandedEventRowProps {
  event: CalendarEvent;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (ev: CalendarEvent) => void;
}

export const ExpandedEventRow: React.FC<ExpandedEventRowProps> = ({
  event,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onOpenDetail,
}) => {
  const eventId = Number(event.id);
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(eventId),
    onClick: () => {
      if (isSelectionMode) {
        onToggleSelect(eventId);
      } else {
        onOpenDetail(event);
      }
    },
  });

  return (
    <div
      {...longPressHandlers}
      className={`flex items-center gap-3 border rounded-xl p-3 cursor-pointer shadow-xs active:scale-[0.99] transition-all select-none ${
        isSelected
          ? 'ring-2 ring-blue-400 ring-inset bg-blue-50/90 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)] relative z-10'
          : 'bg-white border-gray-200 hover:border-blue-400'
      }`}
    >
      <div className="w-14 flex flex-col items-center justify-center shrink-0 text-center leading-tight pointer-events-none">
        {event.time ? (
          <span className="text-xs font-black text-gray-800">{event.time}</span>
        ) : (
          <span className="text-[11px] font-bold text-gray-400">Tutto il giorno</span>
        )}
        {event.endTime && (
          <>
            <ArrowDownIcon className="h-3 w-3 text-gray-400 my-0.5" />
            <span className="text-[11px] font-bold text-gray-500">{event.endTime}</span>
          </>
        )}
      </div>

      <div
        className="w-2 h-9 rounded-full shrink-0 pointer-events-none"
        style={{
          backgroundColor: event.categoryColor?.startsWith('#')
            ? event.categoryColor
            : '#3b82f6',
        }}
      />

      <div className="flex-1 min-w-0 pointer-events-none">
        <TruncatedTitle title={event.title} />
        {event.location && (
          <p className="text-[11px] text-gray-500 truncate mt-0.5">📍 {event.location}</p>
        )}
      </div>
    </div>
  );
};
