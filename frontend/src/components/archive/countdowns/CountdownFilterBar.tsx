// src/components/countdowns/CountdownFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface CountdownFilterBarProps {
  onOpenNewCountdown: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const CountdownFilterBar: React.FC<CountdownFilterBarProps> = ({
  onOpenNewCountdown,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuovo Countdown"
      onAdd={onOpenNewCountdown}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default CountdownFilterBar;
