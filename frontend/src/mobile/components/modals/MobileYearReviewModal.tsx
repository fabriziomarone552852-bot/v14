// src/mobile/components/modals/MobileYearReviewModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { YearReviewData } from '@/components/year/review/YearReviewModal';
import type { TrackerItem } from '@/types/monthlyentries';
import type { YearlyType } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';
import type { Habit } from '@/types/habits';
import type { DailyEntry } from '@/types/dailyentries';
import { MobileReviewTagBar } from './review/ReviewSharedComponents';
import { YearReviewTasksRecap } from './review/YearReviewTasksRecap';
import { YearReviewHabitsRecap } from './review/YearReviewHabitsRecap';
import { YearReviewPixelsRecap } from './review/YearReviewPixelsRecap';
import { YearReviewChartsRecap } from './review/YearReviewChartsRecap';
import {
  ReviewModalHeader,
  YearReviewQuestionsSection,
  YearReviewActionButtonsBar,
} from './review/sections';
import { useMobileYearReviewRecapData } from './review/hooks';

export type MobileYearReviewRecapType = 'tasks' | 'habits' | 'pixels' | 'charts';

interface MobileYearReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  reviewData: YearReviewData;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onSaveAnswer: (code: YearlyType, text: string, existingId?: number) => void;
  onUpdateMood?: (id: string, value: number) => void;
  onUpdateSphere?: (id: string, value: number) => void;
  tasksCompleted: number;
  tasksTotal: number;
  tasksByMonth: Record<number, number>;
  tasksByWeekday: Record<number, number>;
  habits: Habit[];
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
}

export const MobileYearReviewModal: React.FC<MobileYearReviewModalProps> = ({
  isOpen,
  onClose,
  year,
  reviewData,
  moodsUI,
  spheresUI,
  onSaveAnswer,
  onUpdateMood,
  onUpdateSphere,
  tasksCompleted,
  tasksTotal,
  tasksByMonth,
  tasksByWeekday,
  habits,
  dailyEntries = [],
  allCategories,
}) => {
  const [activeRecap, setActiveRecap] = useState<MobileYearReviewRecapType | null>(null);

  const {
    safeMoods,
    safeSpheres,
    activeHabitsInYear,
    daysInMonths,
    categoriesById,
    entriesByDate,
    selectedPixelInfo,
    setSelectedPixelInfo,
    handlePixelClick,
  } = useMobileYearReviewRecapData(year, moodsUI, spheresUI, habits, dailyEntries, allCategories);

  if (!isOpen) return null;

  const recapTitle =
    activeRecap === 'tasks' ? 'Statistiche Task' :
    activeRecap === 'habits' ? 'Statistiche Routine & Abitudini' :
    activeRecap === 'pixels' ? 'Anno in Pixel' :
    activeRecap === 'charts' ? 'Grafici Umore & Sfere' : null;

  const modalElement = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      <ReviewModalHeader
        title={`Analisi del ${year}`}
        activeRecapTitle={recapTitle}
        onClose={onClose}
        onBackToReview={() => {
          setActiveRecap(null);
          setSelectedPixelInfo(null);
        }}
      />

      {activeRecap === null && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <YearReviewQuestionsSection
            entries={reviewData.yearlyEntries || reviewData.entries || []}
            onSaveAnswer={onSaveAnswer}
          />
          <MobileReviewTagBar
            assignedTags={reviewData.assignedTags}
            allTags={reviewData.allTags}
            tagEntryMap={reviewData.tagEntryMap}
            onAddTag={reviewData.onAddTag}
            onCreateAndAddTag={reviewData.onCreateAndAddTag}
            onRemoveTag={reviewData.onRemoveTag}
          />
          <YearReviewActionButtonsBar onSelectRecap={setActiveRecap} />
        </div>
      )}

      {activeRecap === 'tasks' && (
        <YearReviewTasksRecap
          tasksCompleted={tasksCompleted}
          tasksTotal={tasksTotal}
          year={year}
          tasksByMonth={tasksByMonth}
          tasksByWeekday={tasksByWeekday}
        />
      )}
      {activeRecap === 'habits' && (
        <YearReviewHabitsRecap activeHabitsInYear={activeHabitsInYear} year={year} />
      )}
      {activeRecap === 'pixels' && (
        <YearReviewPixelsRecap
          year={year}
          daysPerMonth={daysInMonths}
          entriesByDate={entriesByDate}
          categoriesById={categoriesById}
          selectedPixelInfo={selectedPixelInfo}
          onPixelClick={handlePixelClick}
        />
      )}
      {activeRecap === 'charts' && (
        <YearReviewChartsRecap
          safeMoods={safeMoods}
          safeSpheres={safeSpheres}
          onUpdateMood={onUpdateMood}
          onUpdateSphere={onUpdateSphere}
        />
      )}
    </div>
  );

  return createPortal(modalElement, document.body);
};

export default MobileYearReviewModal;
