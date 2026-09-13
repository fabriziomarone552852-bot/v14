// src/mobile/components/home/MobileHomeEventsSection.tsx
import React from 'react';
import { MobileHomeEventsCompact, MobileHomeEventsExpanded } from './events';
import type { CalendarEvent } from '@/types';
import type { ExpandedHomeViewMode } from '../../hooks/useMobileHomeLogic';

export interface MobileHomeEventsSectionProps {
  todayEvents: CalendarEvent[];
  formattedDate: string;
  expandedView: ExpandedHomeViewMode;
  onExpand: () => void;
  onCloseExpanded: () => void;
  isSyncing: boolean;
  onSyncGoogle: () => void;
  onOpenDetail: (ev: CalendarEvent) => void;
  isEventsSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectEvent: (id: number) => void;
}

export const MobileHomeEventsSection: React.FC<MobileHomeEventsSectionProps> = ({
  todayEvents,
  formattedDate,
  expandedView,
  onExpand,
  onCloseExpanded,
  isSyncing,
  onSyncGoogle,
  onOpenDetail,
  isEventsSelection,
  selectedIds,
  onToggleSelectEvent,
}) => {
  return (
    <>
      <MobileHomeEventsCompact
        todayEvents={todayEvents}
        onExpand={onExpand}
        isSyncing={isSyncing}
        onSyncGoogle={onSyncGoogle}
        onOpenDetail={onOpenDetail}
      />

      {expandedView === 'events' && (
        <MobileHomeEventsExpanded
          todayEvents={todayEvents}
          formattedDate={formattedDate}
          onCloseExpanded={onCloseExpanded}
          isSyncing={isSyncing}
          onSyncGoogle={onSyncGoogle}
          onOpenDetail={onOpenDetail}
          isEventsSelection={isEventsSelection}
          selectedIds={selectedIds}
          onToggleSelectEvent={onToggleSelectEvent}
        />
      )}
    </>
  );
};

export * from './events';
