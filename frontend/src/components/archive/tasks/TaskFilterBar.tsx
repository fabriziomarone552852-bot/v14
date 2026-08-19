// src/components/tasks/TaskFilterBar.tsx
import React from 'react';
import { ArchiveActionBar } from '@/components/shared/layout/ArchiveActionBar';

interface TaskFilterBarProps {
  onOpenNewTask: () => void;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  onOpenNewTask,
  onOpenSearch,
  activeFiltersCount,
  panelClass,
}) => {
  return (
    <ArchiveActionBar
      addLabel="Nuova Task"
      onAdd={onOpenNewTask}
      onOpenSearch={onOpenSearch}
      activeFiltersCount={activeFiltersCount}
      className={panelClass}
    />
  );
};

export default TaskFilterBar;
