// frontend/src/components/weekmonth/review/MonthReviewModal.tsx
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { BaseReviewModal } from './BaseReviewModal';
import type { ReviewTabButton } from './BaseReviewModal';
import { ReviewQuestionsPanel } from './ReviewQuestionsPanel';
import { ReviewEventsPanel } from './ReviewEventsPanel';
import { ReviewTasksPanel } from './ReviewTasksPanel';
import { ReviewHabitsPanel } from './ReviewHabitsPanel';
import { ReviewTagBar } from './ReviewTagBar';
import type { MonthReviewData, ReviewSidebarTab } from '@/hooks/uiMonth/useMonthReview';
import type { TrackerItem } from '@/types/monthlyentries';
import type { MonthlyType } from '@/types/monthlyentries';

interface MonthReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date;
  reviewData: MonthReviewData;
  activeTab: ReviewSidebarTab | null;
  onSetTab: (tab: ReviewSidebarTab | null) => void;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onSaveAnswer: (code: MonthlyType, text: string, existingId?: number) => void;
}

const TAB_BUTTONS: ReviewTabButton<ReviewSidebarTab>[] = [
  { id: 'events', emoji: '❤️' },
  { id: 'tasks', emoji: '📋' },
  { id: 'habits', emoji: '🔄' },
];

export const MonthReviewModal: React.FC<MonthReviewModalProps> = ({
  isOpen, onClose, monthDate, reviewData, activeTab, onSetTab,
  moodsUI, spheresUI, onSaveAnswer,
}) => {
  const monthName = format(monthDate, 'MMMM yyyy', { locale: it }).toUpperCase();

  return (
    <BaseReviewModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Analisi di ${monthName}`}
      activeTab={activeTab}
      onSetTab={onSetTab}
      tabButtons={TAB_BUTTONS}
      moodsUI={moodsUI}
      spheresUI={spheresUI}
      tagBar={
        <ReviewTagBar
          assignedTags={reviewData.assignedTags}
          allTags={reviewData.allTags}
          onAddTag={reviewData.onAddTag}
          onCreateAndAddTag={reviewData.onCreateAndAddTag}
          onRemoveTag={reviewData.onRemoveTag}
          tagEntryMap={reviewData.tagEntryMap}
        />
      }
    >
      {activeTab === null && (
        <ReviewQuestionsPanel
          monthlyEntries={reviewData.monthlyEntries}
          onSaveAnswer={onSaveAnswer}
        />
      )}
      {activeTab === 'events' && (
        <ReviewEventsPanel
          monthlyPositive={reviewData.monthlyPositive}
          monthlyNegative={reviewData.monthlyNegative}
          weeklyPositive={reviewData.weeklyPositive}
          weeklyNegative={reviewData.weeklyNegative}
        />
      )}
      {activeTab === 'tasks' && (
        <ReviewTasksPanel
          completedTasks={reviewData.completedTasks}
          tasksCompleted={reviewData.tasksCompleted}
          tasksTotal={reviewData.tasksTotal}
        />
      )}
      {activeTab === 'habits' && (
        <ReviewHabitsPanel
          habits={reviewData.habits}
          year={monthDate.getFullYear()}
          month={monthDate.getMonth() + 1}
        />
      )}
    </BaseReviewModal>
  );
};
