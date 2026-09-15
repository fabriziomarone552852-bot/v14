// src/mobile/components/day/MobileDayExpandedViews.tsx
import React from 'react';
import type { CalendarEvent, UITask, TaskSummary } from '@/types';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { ExpandedViewType, TaskSortMode } from '@/mobile/hooks/useMobileDayTasks';
import { MobileDayEventsExpanded } from './MobileDayEventsSection';
import { MobileDayTasksExpanded } from './MobileDayTasksSection';
import { MobileDayRoutinesExpanded } from './MobileDayTrackerSection';

export interface MobileDayExpandedViewsProps {
  expandedView: ExpandedViewType;
  onCloseExpanded: () => void;
  formattedDateStr: string;

  // Events
  mappedEvents: CalendarEvent[];
  isEventsSelection: boolean;
  onToggleSelectEvent: (id: number) => void;
  openEventDetail: (event: CalendarEvent) => void;

  // Tasks
  sortedTasks: UITask[];
  showWithDeadline: boolean;
  setShowWithDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  showNotificationDot: boolean;
  sortMode: TaskSortMode;
  setSortMode: React.Dispatch<React.SetStateAction<TaskSortMode>>;
  isTasksSelection: boolean;
  onToggleSelectTask: (id: number) => void;
  openTaskDetail: (task: TaskSummary) => void;
  handleToggleTask: (id: number, currentStatus: boolean, e?: React.MouseEvent) => void;

  // Routines
  mappedRoutines: RoutineItem[];
  isRoutinesSelection: boolean;
  onToggleSelectRoutine: (id: number) => void;
  openRoutineDetail: (routine: RoutineItem) => void;
  handleUpdateRoutineCount: (id: number, delta: number) => void;

  // Selection
  selectedIds: (number | string)[];
}

export const MobileDayExpandedViews: React.FC<MobileDayExpandedViewsProps> = ({
  expandedView,
  onCloseExpanded,
  formattedDateStr,
  mappedEvents,
  isEventsSelection,
  onToggleSelectEvent,
  openEventDetail,
  sortedTasks,
  showWithDeadline,
  setShowWithDeadline,
  showNotificationDot,
  sortMode,
  setSortMode,
  isTasksSelection,
  onToggleSelectTask,
  openTaskDetail,
  handleToggleTask,
  mappedRoutines,
  isRoutinesSelection,
  onToggleSelectRoutine,
  openRoutineDetail,
  handleUpdateRoutineCount,
  selectedIds,
}) => {
  if (expandedView === 'none') return null;

  return (
    <>
      {expandedView === 'events' && (
        <MobileDayEventsExpanded
          events={mappedEvents}
          formattedDateStr={formattedDateStr}
          isEventsSelection={isEventsSelection}
          selectedIds={selectedIds}
          onToggleSelectEvent={onToggleSelectEvent}
          onOpenEventDetail={openEventDetail}
          onCloseExpanded={onCloseExpanded}
        />
      )}

      {expandedView === 'tasks' && (
        <MobileDayTasksExpanded
          tasks={sortedTasks}
          showWithDeadline={showWithDeadline}
          showNotificationDot={showNotificationDot}
          sortMode={sortMode}
          isTasksSelection={isTasksSelection}
          selectedIds={selectedIds}
          onToggleDeadlineFilter={() => setShowWithDeadline((prev) => !prev)}
          onToggleSortMode={() =>
            setSortMode((prev) => (prev === 'chrono' ? 'priority' : 'chrono'))
          }
          onToggleSelectTask={onToggleSelectTask}
          onOpenTaskDetail={openTaskDetail}
          onToggleTask={(id, currentStatus, e) => handleToggleTask(id, currentStatus, e)}
          onCloseExpanded={onCloseExpanded}
        />
      )}

      {expandedView === 'routines' && (
        <MobileDayRoutinesExpanded
          routines={mappedRoutines}
          formattedDateStr={formattedDateStr}
          isRoutinesSelection={isRoutinesSelection}
          selectedIds={selectedIds}
          onToggleSelectRoutine={onToggleSelectRoutine}
          onOpenRoutineDetail={openRoutineDetail}
          onUpdateRoutineCount={handleUpdateRoutineCount}
          onCloseExpanded={onCloseExpanded}
        />
      )}
    </>
  );
};

export default MobileDayExpandedViews;
