// src/components/events/EventFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface EventFilterBarProps {
  onOpenNewEvent: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  onOpenNewEvent,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuovo Evento"
      onAdd={onOpenNewEvent}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default EventFilterBar;
