// src/components/events/EventStatsOverview.tsx
import React from 'react';
import { CalendarIcon } from '@/components/shared/utils/Icons';
import { ArchiveHeader } from '@/components/shared/layout/ArchiveHeader';

interface EventStatsOverviewProps {
  panelClass?: string;
}

export const EventStatsOverview: React.FC<EventStatsOverviewProps> = ({
  panelClass,
}) => {
  return (
    <ArchiveHeader
      icon={<CalendarIcon className="w-5 h-5" />}
      title="Gestione Eventi"
      subtitle="Organizza e consulta i tuoi appuntamenti e impegni in programma."
      className={panelClass}
    />
  );
};

export default EventStatsOverview;
