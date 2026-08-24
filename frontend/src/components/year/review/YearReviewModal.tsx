// frontend/src/components/year/review/YearReviewModal.tsx
import React from 'react';
import { BaseReviewModal } from '@/components/weekmonth/review/BaseReviewModal';
import type { ReviewTabButton } from '@/components/weekmonth/review/BaseReviewModal';
import { YearReviewQuestionsPanel } from './YearReviewQuestionsPanel';
import { YearReviewTasksPanel } from './YearReviewTasksPanel';
import { YearReviewHabitsPanel } from './YearReviewHabitsPanel';
import { ReviewTagBar } from '@/components/weekmonth/review/ReviewTagBar';
import type { TrackerItem } from '@/types/monthlyentries';
import type { YearlyType, DbYearlyEntry } from '@/types/yearlyentries';
import type { Habit } from '@/types/habits';
import type { Category } from '@/types/categories';

export type YearReviewSidebarTab = 'tasks' | 'habits';

export interface YearReviewData {
  yearlyEntries?: DbYearlyEntry[];
  entries?: DbYearlyEntry[];
  assignedTags?: Category[];
  allTags?: Category[];
  tagEntryMap?: Record<number, number>;
  onAddTag?: (categoryId: number) => void;
  onCreateAndAddTag?: (tagName: string) => void;
  onRemoveTag?: (yearlyEntryId: number) => void;
}

interface YearReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  reviewData: YearReviewData;
  activeTab: YearReviewSidebarTab | null;
  onSetTab: (tab: YearReviewSidebarTab | null) => void;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onUpdateMood?: (id: string, newValue: number) => void;
  onUpdateSphere?: (id: string, newValue: number) => void;
  onSaveAnswer: (code: YearlyType, text: string, existingId?: number) => void;
  tasksCompleted: number;
  tasksTotal: number;
  tasksByMonth: Record<number, number>;
  tasksByWeekday: Record<number, number>;
  habits: Habit[];
}

const TAB_BUTTONS: ReviewTabButton<YearReviewSidebarTab>[] = [
  { id: 'tasks', emoji: '📊', title: 'Statistiche Task' },
  { id: 'habits', emoji: '🔄', title: 'Statistiche Abitudini' },
];

export const YearReviewModal: React.FC<YearReviewModalProps> = ({
  isOpen,
  onClose,
  year,
  reviewData,
  activeTab,
  onSetTab,
  moodsUI,
  spheresUI,
  onUpdateMood,
  onUpdateSphere,
  onSaveAnswer,
  tasksCompleted,
  tasksTotal,
  tasksByMonth,
  tasksByWeekday,
  habits,
}) => {
  const entriesList = reviewData.yearlyEntries || reviewData.entries || [];

  return (
    <BaseReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Analisi del ${year}`}
      activeTab={activeTab}
      onSetTab={onSetTab}
      tabButtons={TAB_BUTTONS}
      moodsUI={moodsUI}
      spheresUI={spheresUI}
      onUpdateMood={onUpdateMood}
      onUpdateSphere={onUpdateSphere}
      tagBar={
        reviewData.assignedTags && reviewData.allTags && reviewData.onAddTag && reviewData.onRemoveTag && (
          <ReviewTagBar
            assignedTags={reviewData.assignedTags}
            allTags={reviewData.allTags}
            onAddTag={reviewData.onAddTag}
            onCreateAndAddTag={reviewData.onCreateAndAddTag || (() => {})}
            onRemoveTag={reviewData.onRemoveTag}
            tagEntryMap={reviewData.tagEntryMap || {}}
          />
        )
      }
    >
      {activeTab === null && (
        <YearReviewQuestionsPanel
          yearlyEntries={entriesList}
          onSaveAnswer={onSaveAnswer}
        />
      )}
      {activeTab === 'tasks' && (
        <YearReviewTasksPanel
          tasksCompleted={tasksCompleted}
          tasksTotal={tasksTotal}
          tasksByMonth={tasksByMonth}
          tasksByWeekday={tasksByWeekday}
        />
      )}
      {activeTab === 'habits' && (
        <YearReviewHabitsPanel
          habits={habits}
          year={year}
        />
      )}
    </BaseReviewModal>
  );
};
