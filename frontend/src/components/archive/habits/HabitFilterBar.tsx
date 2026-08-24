// src/components/archive/habits/HabitFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';
import { ArchiveTabs, type HabitTabType } from '@/components/archive/habits/ArchiveTabs';

interface HabitFilterBarProps {
  activeTab: HabitTabType;
  onTabChange: (tab: HabitTabType) => void;
  routinesCount: number;
  habitsCount: number;
  onOpenNew: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const HabitFilterBar: React.FC<HabitFilterBarProps> = ({
  activeTab,
  onTabChange,
  routinesCount,
  habitsCount,
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
      centerContent={
        <ArchiveTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          routinesCount={routinesCount}
          habitsCount={habitsCount}
        />
      }
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default HabitFilterBar;
