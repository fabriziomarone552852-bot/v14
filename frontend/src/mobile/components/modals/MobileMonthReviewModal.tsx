// src/mobile/components/modals/MobileMonthReviewModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MonthReviewData } from '@/hooks/uiMonth/useMonthReview';
import type { TrackerItem, MonthlyType } from '@/types/monthlyentries';

// Sub-componenti e Hook Modulari
import { MobileReviewTagBar } from './review/ReviewSharedComponents';
import { MonthReviewEventsRecap } from './review/MonthReviewEventsRecap';
import { MonthReviewTasksRecap } from './review/MonthReviewTasksRecap';
import { MonthReviewHabitsRecap } from './review/MonthReviewHabitsRecap';
import { YearReviewChartsRecap } from './review/YearReviewChartsRecap';
import {
  ReviewModalHeader,
  MonthReviewQuestionsSection,
  MonthReviewActionButtonsBar,
} from './review/sections';
import { useMobileMonthReviewRecapData } from './review/hooks';

export type MobileReviewRecapType = 'events' | 'tasks' | 'habits' | 'charts';

interface MobileMonthReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date;
  reviewData: MonthReviewData;
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  onSaveAnswer: (code: MonthlyType, text: string, existingId?: number) => void;
  onUpdateMood?: (id: string, value: number) => void;
  onUpdateSphere?: (id: string, value: number) => void;
}

export const MobileMonthReviewModal: React.FC<MobileMonthReviewModalProps> = ({
  isOpen,
  onClose,
  monthDate,
  reviewData,
  moodsUI,
  spheresUI,
  onSaveAnswer,
  onUpdateMood,
  onUpdateSphere,
}) => {
  const [activeRecap, setActiveRecap] = useState<MobileReviewRecapType | null>(null);

  const {
    monthName,
    allMonthDays,
    safeMoods,
    safeSpheres,
    allPositive,
    allNegative,
    activeHabitsInMonth,
  } = useMobileMonthReviewRecapData(monthDate, reviewData, moodsUI, spheresUI);

  if (!isOpen) return null;

  const getRecapTitle = () => {
    if (activeRecap === 'events') return 'Cose Positive e Negative';
    if (activeRecap === 'tasks') return 'Statistiche Task';
    if (activeRecap === 'habits') return 'Statistiche Routine & Abitudini';
    if (activeRecap === 'charts') return 'Grafici Umore & Sfere';
    return null;
  };

  const modalElement = (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col h-[100dvh] w-full overflow-hidden select-none animate-fadeIn">
      {/* 1. Header Modale */}
      <ReviewModalHeader
        title={`Analisi di ${monthName}`}
        activeRecapTitle={getRecapTitle()}
        onClose={onClose}
        onBackToReview={() => setActiveRecap(null)}
      />

      {/* 2. Schermata Principale: 6 Domande + Tag + 4 Tasti Recap */}
      {activeRecap === null && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <MonthReviewQuestionsSection
            entries={reviewData.monthlyEntries}
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

          <MonthReviewActionButtonsBar onSelectRecap={setActiveRecap} />
        </div>
      )}

      {/* 3. Recap: Cose Positive e Negative */}
      {activeRecap === 'events' && (
        <MonthReviewEventsRecap
          allPositive={allPositive}
          allNegative={allNegative}
        />
      )}

      {/* 4. Recap: Statistiche Task */}
      {activeRecap === 'tasks' && (
        <MonthReviewTasksRecap
          tasksCompleted={reviewData.tasksCompleted}
          tasksTotal={reviewData.tasksTotal}
          completedTasks={reviewData.completedTasks}
        />
      )}

      {/* 5. Recap: Statistiche Abitudini e Routine */}
      {activeRecap === 'habits' && (
        <MonthReviewHabitsRecap
          activeHabitsInMonth={activeHabitsInMonth}
          allMonthDays={allMonthDays}
        />
      )}

      {/* 6. Recap: Grafici Radar Umore e Sfere */}
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

export default MobileMonthReviewModal;
