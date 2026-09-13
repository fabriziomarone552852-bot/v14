// src/mobile/components/day/events/MobileDayEventsExpanded.tsx
import React from 'react';
import { CalendarIcon, CloseIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { ExpandedEventRow } from '../rows/ExpandedEventRow';
import type { CalendarEvent } from '@/types';

export interface MobileDayEventsExpandedProps {
  events: CalendarEvent[];
  formattedDateStr: string;
  isEventsSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectEvent: (id: number) => void;
  onOpenEventDetail: (event: CalendarEvent) => void;
  onCloseExpanded: () => void;
}

export const MobileDayEventsExpanded: React.FC<MobileDayEventsExpandedProps> = ({
  events,
  formattedDateStr,
  isEventsSelection,
  selectedIds,
  onToggleSelectEvent,
  onOpenEventDetail,
  onCloseExpanded,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col p-3 rounded-2xl animate-fadeIn shadow-2xl border border-gray-200">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Tutti gli Eventi del Giorno
            </h3>
            <p className="text-xs text-gray-500 font-medium">{formattedDateStr}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseExpanded}
          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-colors cursor-pointer"
          title="Chiudi visualizzazione estesa"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 px-2 pb-3">
        {events.map((ev) => (
          <ExpandedEventRow
            key={ev.id}
            event={ev}
            isSelected={isEventsSelection && selectedIds.includes(Number(ev.id))}
            isSelectionMode={isEventsSelection}
            onToggleSelect={onToggleSelectEvent}
            onOpenDetail={(targetEv) => {
              onCloseExpanded();
              onOpenEventDetail(targetEv);
            }}
          />
        ))}

        {events.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessun evento in programma per questo giorno" />
          </div>
        )}
      </div>
    </div>
  );
};
