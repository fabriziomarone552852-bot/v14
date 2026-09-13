// src/mobile/components/day/rows/ExpandedTaskRow.tsx
import React from 'react';
import { TaskItem } from '@/components/shared/tasks/TaskItem';
import { useLongPress } from '@/mobile/hooks/useLongPress';
import type { UITask, TaskSummary } from '@/types';

export interface ExpandedTaskRowProps {
  task: UITask;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: (id: number) => void;
  onOpenDetail: (t: TaskSummary) => void;
  onToggle: (id: number, currentStatus: boolean, e: React.MouseEvent) => void;
}

export const ExpandedTaskRow: React.FC<ExpandedTaskRowProps> = ({
  task,
  isSelected,
  isSelectionMode,
  onToggleSelect,
  onOpenDetail,
  onToggle,
}) => {
  const longPressHandlers = useLongPress({
    onLongPress: () => onToggleSelect(task.id),
    onClick: () => {
      if (isSelectionMode) {
        onToggleSelect(task.id);
      } else {
        onOpenDetail(task);
      }
    },
  });

  return (
    <TaskItem
      task={task}
      isSelected={isSelected}
      onSelect={onOpenDetail}
      onToggle={onToggle}
      {...longPressHandlers}
    />
  );
};
