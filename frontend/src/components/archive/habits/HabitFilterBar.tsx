// src/components/habits/HabitFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import type { HabitTabType } from '@/components/archive/habits/ArchiveTabs';

interface HabitFilterBarProps {
  activeTab: HabitTabType;
  onOpenNew: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const HabitFilterBar: React.FC<HabitFilterBarProps> = ({
  activeTab,
  onOpenNew,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  const addLabel = activeTab === 'routines' ? 'Nuova Routine' : 'Nuovo Habit';

  return (
    <ArchiveActionBar
      addLabel={addLabel}
      onAdd={onOpenNew}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default HabitFilterBar;
