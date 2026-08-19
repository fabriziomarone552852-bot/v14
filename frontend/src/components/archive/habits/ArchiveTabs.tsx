// src/components/habits/ArchiveTabs.tsx
import React from 'react';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';

export type HabitTabType = 'routines' | 'habits';

interface ArchiveTabsProps {
  activeTab: HabitTabType;
  onTabChange: (tab: HabitTabType) => void;
  routinesCount: number;
  habitsCount: number;
  className?: string;
}

export const ArchiveTabs: React.FC<ArchiveTabsProps> = ({
  activeTab,
  onTabChange,
  routinesCount,
  habitsCount,
  className = '',
}) => {
  const tabs: TabItem<HabitTabType>[] = [
    {
      id: 'routines',
      label: 'Routines',
      icon: '🔄',
      count: routinesCount,
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: '✨',
      count: habitsCount,
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/60',
    },
  ];

  return (
    <SegmentedTabs
      tabs={tabs}
      activeTab={activeTab}
      onChange={onTabChange}
      className={className}
    />
  );
};

export default ArchiveTabs;
