// src/components/reviews/YearReviewArchiveModal.tsx
import React from 'react';
import { useAgendaYear } from '@/hooks/useAgendaYear';
import { useYearEntries } from '@/hooks/uiYear/useYearEntries';
import { useYearReview } from '@/hooks/uiYear/useYearReview';
import { YearReviewModal } from '@/components/year/review/YearReviewModal';

interface YearReviewArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  year: number | null;
}

export const YearReviewArchiveModal: React.FC<YearReviewArchiveModalProps> = ({
  isOpen,
  onClose,
  year,
}) => {
  if (!isOpen || year === null) return null;

  return <YearReviewArchiveModalContent isOpen={isOpen} onClose={onClose} year={year} />;
};

const YearReviewArchiveModalContent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  year: number;
}> = ({ isOpen, onClose, year }) => {
  const agendaYear = useAgendaYear(year);
  const entries = useYearEntries(agendaYear.yearData, year);
  const isCurrentYear = year === new Date().getFullYear();

  const review = useYearReview(year, entries.entries, isCurrentYear, {
    assignedTags: entries.assignedTags,
    allTags: entries.allTags,
    tagEntryMap: entries.tagEntryMap,
    onAddTag: entries.handleAddTag,
    onCreateAndAddTag: entries.handleCreateAndAddTag,
    onRemoveTag: entries.handleRemoveTag,
  });

  return (
    <YearReviewModal
      isOpen={isOpen}
      onClose={onClose}
      year={year}
      reviewData={review.reviewData}
      activeTab={review.activeTab}
      onSetTab={review.setActiveTab}
      moodsUI={entries.moodsUI}
      spheresUI={entries.spheresUI}
      onUpdateMood={entries.handleUpdateMood}
      onUpdateSphere={entries.handleUpdateSphere}
      onSaveAnswer={entries.handleSaveAnswer}
      tasksCompleted={0}
      tasksTotal={0}
      tasksByMonth={{}}
      tasksByWeekday={{}}
      habits={[]}
    />
  );
};

export default YearReviewArchiveModal;
