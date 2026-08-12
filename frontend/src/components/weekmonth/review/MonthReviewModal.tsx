// frontend/src/components/weekmonth/review/MonthReviewModal.tsx
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ReadOnlyTrackerChart } from './ReadOnlyTrackerChart';
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

const TAB_BUTTONS: { id: ReviewSidebarTab; emoji: string }[] = [
  { id: 'events', emoji: '❤️' },
  { id: 'tasks', emoji: '📋' },
  { id: 'habits', emoji: '🔄' },
];

export const MonthReviewModal: React.FC<MonthReviewModalProps> = ({
  isOpen, onClose, monthDate, reviewData, activeTab, onSetTab,
  moodsUI, spheresUI, onSaveAnswer,
}) => {
  if (!isOpen) return null;

  const monthName = format(monthDate, 'MMMM yyyy', { locale: it }).toUpperCase();

  const handleTabClick = (tab: ReviewSidebarTab) => {
    onSetTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[900px] flex flex-col overflow-hidden animate-fadeIn">
        {/* Header — stile grigio come gli altri modali */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-gray-100 shrink-0">
          <h2 className="text-sm font-black text-gray-600 uppercase tracking-widest">
            Analisi di {monthName}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
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
            </div>
          </div>

          {/* Right sidebar — grafici read-only con mese + precedente */}
          <div className="w-[260px] xl:w-[300px] shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col overflow-hidden">
            {/* Mood chart */}
            <div className="flex-1 min-h-0 p-2 flex flex-col">
              <ReadOnlyTrackerChart title="Come mi sento" items={moodsUI} uid="rv-mood" />
            </div>

            <div className="w-8/12 mx-auto h-px bg-gray-200 shrink-0" />

            {/* Spheres chart */}
            <div className="flex-1 min-h-0 p-2 flex flex-col">
              <ReadOnlyTrackerChart title="Sfere di Influenza" items={spheresUI} uid="rv-sphere" />
            </div>

            <div className="w-8/12 mx-auto h-px bg-gray-200 shrink-0 my-1" />

            {/* Tab buttons — solo emoji */}
            <div className="flex gap-1.5 p-3 shrink-0 justify-center">
              {TAB_BUTTONS.map(({ id, emoji }) => (
                <button
                  key={id}
                  onClick={() => handleTabClick(id)}
                  className={`w-12 h-12 rounded-xl text-lg flex items-center justify-center transition-all ${
                    activeTab === id
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tag bar */}
        <div className="border-t border-gray-200 px-6 py-2 bg-gray-50/80 shrink-0">
          <ReviewTagBar
            assignedTags={reviewData.assignedTags}
            allTags={reviewData.allTags}
            onAddTag={reviewData.onAddTag}
            onCreateAndAddTag={reviewData.onCreateAndAddTag}
            onRemoveTag={reviewData.onRemoveTag}
            tagEntryMap={reviewData.tagEntryMap}
          />
        </div>
      </div>
    </div>
  );
};
