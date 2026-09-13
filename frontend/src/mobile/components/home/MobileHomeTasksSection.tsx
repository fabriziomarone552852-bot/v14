// src/mobile/components/home/MobileHomeTasksSection.tsx
import React from 'react';
import { MobileHomeTasksCompact, MobileHomeTasksExpanded } from './tasks';
import type { UITask, TaskSummary } from '@/types';
import type { ExpandedHomeViewMode } from '../../hooks/useMobileHomeLogic';

export interface MobileHomeTasksSectionProps {
  displayedTaskTree: UITask[];
  showWithDeadline: boolean;
  setShowWithDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  sortMode: 'chrono' | 'priority';
  setSortMode: React.Dispatch<React.SetStateAction<'chrono' | 'priority'>>;
  showNotificationDot: boolean;
  expandedView: ExpandedHomeViewMode;
  onExpand: () => void;
  onCloseExpanded: () => void;
  onToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => void;
  onOpenDetail: (t: TaskSummary) => void;
  isTasksSelection: boolean;
  selectedIds: (number | string)[];
  onToggleSelectTask: (id: number) => void;
}

export const MobileHomeTasksSection: React.FC<MobileHomeTasksSectionProps> = ({
  displayedTaskTree,
  showWithDeadline,
  setShowWithDeadline,
  sortMode,
  setSortMode,
  showNotificationDot,
  expandedView,
  onExpand,
  onCloseExpanded,
  onToggleTask,
  onOpenDetail,
  isTasksSelection,
  selectedIds,
  onToggleSelectTask,
}) => {
  return (
    <>
      <MobileHomeTasksCompact
        displayedTaskTree={displayedTaskTree}
        showWithDeadline={showWithDeadline}
        setShowWithDeadline={setShowWithDeadline}
        sortMode={sortMode}
        setSortMode={setSortMode}
        showNotificationDot={showNotificationDot}
        onExpand={onExpand}
        onToggleTask={onToggleTask}
        onOpenDetail={onOpenDetail}
      />

      {expandedView === 'tasks' && (
        <MobileHomeTasksExpanded
          displayedTaskTree={displayedTaskTree}
          showWithDeadline={showWithDeadline}
          setShowWithDeadline={setShowWithDeadline}
          sortMode={sortMode}
          setSortMode={setSortMode}
          showNotificationDot={showNotificationDot}
          onCloseExpanded={onCloseExpanded}
          onToggleTask={onToggleTask}
          onOpenDetail={onOpenDetail}
          isTasksSelection={isTasksSelection}
          selectedIds={selectedIds}
          onToggleSelectTask={onToggleSelectTask}
        />
      )}
    </>
  );
};

export * from './tasks';
