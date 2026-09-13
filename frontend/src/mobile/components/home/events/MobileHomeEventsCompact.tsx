// src/mobile/components/home/events/MobileHomeEventsCompact.tsx
import React from 'react';
import { TruncatedTitle } from '@/components/shared/utils/TruncatedTitle';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { ArrowDownIcon, CalendarIcon, SyncIcon } from '@/components/shared/utils/Icons';
import type { CalendarEvent } from '@/types';

export interface MobileHomeEventsCompactProps {
  todayEvents: CalendarEvent[];
  onExpand: () => void;
  isSyncing: boolean;
  onSyncGoogle: () => void;
  onOpenDetail: (ev: CalendarEvent) => void;
}

export const MobileHomeEventsCompact: React.FC<MobileHomeEventsCompactProps> = ({
  todayEvents,
  onExpand,
  isSyncing,
  onSyncGoogle,
  onOpenDetail,
}) => {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 overflow-hidden">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100 shrink-0 select-none">
        <div
          onClick={onExpand}
          className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
          title="Tocca per visualizzare tutti gli eventi a schermo intero"
        >
          <div className="p-1 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider truncate">
            Eventi di Oggi
          </h3>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full shrink-0">
            {todayEvents.length}
          </span>
        </div>

        {/* Tasto Sincronizzazione Google Calendar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSyncGoogle();
            }}
            disabled={isSyncing}
            title="Sincronizza con Google Calendar"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-xs bg-white flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            <SyncIcon
              className={`w-3.5 h-3.5 text-gray-500 ${
                isSyncing ? 'animate-spin text-blue-600' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Lista Eventi Compatti */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pt-2 pr-0.5">
        {todayEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={() => onOpenDetail(ev)}
            className="flex items-center gap-2.5 bg-gray-50/80 hover:bg-blue-50/40 border border-gray-200/70 hover:border-blue-300 rounded-xl p-2.5 cursor-pointer active:scale-[0.99] transition-all shadow-2xs"
          >
            <div className="w-11 flex flex-col items-center justify-center shrink-0 text-center leading-tight">
              {ev.time && (
                <span className="text-[11px] font-black text-gray-700">{ev.time}</span>
              )}
              {ev.endTime && (
                <>
                  <ArrowDownIcon className="h-2.5 w-2.5 text-gray-400 my-0.2" />
                  <span className="text-[10px] font-semibold text-gray-500">
                    {ev.endTime}
                  </span>
                </>
              )}
            </div>

            <div
              className="w-1.5 h-7 rounded-full shrink-0"
              style={{
                backgroundColor: ev.categoryColor?.startsWith('#')
                  ? ev.categoryColor
                  : '#3b82f6',
              }}
            />

            <div className="flex-1 min-w-0">
              <TruncatedTitle title={ev.title} />
              {ev.location && (
                <p className="text-[10px] text-gray-400 truncate mt-0.5">📍 {ev.location}</p>
              )}
            </div>
          </div>
        ))}

        {todayEvents.length === 0 && (
          <div className="h-full flex items-center justify-center py-6">
            <EmptyState message="Nessun evento oggi" />
          </div>
        )}
      </div>
    </div>
  );
};
