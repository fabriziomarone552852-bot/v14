// src/components/archive/reviews/YearReviewArchiveModal.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAgendaYear } from '@/hooks/useAgendaYear';
import { useYearEntries } from '@/hooks/uiYear/useYearEntries';
import { useYearReview } from '@/hooks/uiYear/useYearReview';
import { YearReviewModal } from '@/components/year/review/YearReviewModal';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { MobileYearReviewModal } from '@/mobile/components/modals/MobileYearReviewModal';

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
  const queryClient = useQueryClient();
  if (!isOpen || year === null) return null;

  const handleClose = () => {
    queryClient.invalidateQueries({ queryKey: ['yearly_entries'] });
    onClose();
  };

  return <YearReviewArchiveModalContent isOpen={isOpen} onClose={handleClose} year={year} />;
};

const YearReviewArchiveModalContent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  year: number;
}> = ({ isOpen, onClose, year }) => {
  const isMobile = useIsMobile();
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

  if (isMobile) {
    return (
      <MobileYearReviewModal
        isOpen={isOpen}
        onClose={onClose}
        year={year}
        reviewData={review.reviewData}
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
        dailyEntries={agendaYear.yearData?.dailyEntries || []}
      />
    );
  }

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
      dailyEntries={agendaYear.yearData?.dailyEntries || []}
    />
  );
};

export default YearReviewArchiveModal;
