// src/mobile/components/home/events/MobileHomeEventsExpanded.tsx
import React from 'react';
import { CalendarIcon, CloseIcon, SyncIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { MobileHomeExpandedEventRow } from '../MobileHomeExpandedRows';
import type { CalendarEvent } from '@/types';

export interface MobileHomeEventsExpandedProps {
  todayEvents: CalendarEvent[];
  formattedDate: string;
  onCloseExpanded: () => void;
  isSyncing: boolean;
  onSyncGoogle: () => void;
  onOpenDetail: (ev: CalendarEvent) => void;
  isEventsSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectEvent: (id: number) => void;
}

export const MobileHomeEventsExpanded: React.FC<MobileHomeEventsExpandedProps> = ({
  todayEvents,
  formattedDate,
  onCloseExpanded,
  isSyncing,
  onSyncGoogle,
  onOpenDetail,
  isEventsSelection,
  selectedIds,
  onToggleSelectEvent,
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
              Tutti gli Eventi di Oggi ({todayEvents.length})
            </h3>
            <p className="text-xs text-gray-500 font-medium">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSyncGoogle}
            disabled={isSyncing}
            title="Sincronizza con Google Calendar"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs bg-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            <SyncIcon
              className={`w-4 h-4 text-gray-500 ${
                isSyncing ? 'animate-spin text-blue-600' : ''
              }`}
            />
          </button>

          <button
            type="button"
            onClick={onCloseExpanded}
            className="p-2 rounded-xl bg-gray-200/80 text-gray-700 hover:bg-gray-300 transition-colors cursor-pointer"
            title="Chiudi visualizzazione estesa"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2.5 pt-3 px-2 pb-3">
        {todayEvents.map((ev) => (
          <MobileHomeExpandedEventRow
            key={ev.id}
            event={ev}
            isSelected={isEventsSelection && selectedIds.includes(Number(ev.id))}
            isSelectionMode={isEventsSelection}
            onToggleSelect={onToggleSelectEvent}
            onOpenDetail={(targetEv) => {
              onCloseExpanded();
              onOpenDetail(targetEv);
            }}
          />
        ))}

        {todayEvents.length === 0 && (
          <div className="h-full flex items-center justify-center py-8">
            <EmptyState message="Nessun evento in programma" />
          </div>
        )}
      </div>
    </div>
  );
};
