// src/components/archive/reviews/MonthReviewArchiveModal.tsx
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAgendaMonth } from '@/hooks/useAgendaMonth';
import { useMonthReview } from '@/hooks/uiMonth/useMonthReview';
import { MonthReviewModal } from '@/components/weekmonth/review/MonthReviewModal';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import { MobileMonthReviewModal } from '@/mobile/components/modals/MobileMonthReviewModal';

interface MonthReviewArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date | null;
}

export const MonthReviewArchiveModal: React.FC<MonthReviewArchiveModalProps> = ({
  isOpen,
  onClose,
  monthDate,
}) => {
  const queryClient = useQueryClient();
  if (!isOpen || !monthDate) return null;

  const handleClose = () => {
    queryClient.invalidateQueries({ queryKey: ['monthly_entries'] });
    onClose();
  };

  return <MonthReviewArchiveModalContent isOpen={isOpen} onClose={handleClose} monthDate={monthDate} />;
};

const MonthReviewArchiveModalContent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date;
}> = ({ isOpen, onClose, monthDate }) => {
  const isMobile = useIsMobile();
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const firstDayStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const agenda = useAgendaMonth(firstDayStr, lastDayStr);
  const monthQueryKey = ['monthSync', firstDayStr, lastDayStr];
  const review = useMonthReview(agenda.monthData, monthDate, monthQueryKey);

  if (isMobile) {
    return (
      <MobileMonthReviewModal
        isOpen={isOpen}
        onClose={onClose}
        monthDate={monthDate}
        reviewData={review.reviewData}
        moodsUI={review.moodsUI}
        spheresUI={review.spheresUI}
        onSaveAnswer={review.handleSaveAnswer}
      />
    );
  }

  return (
    <MonthReviewModal
      isOpen={isOpen}
      onClose={onClose}
      monthDate={monthDate}
      reviewData={review.reviewData}
      activeTab={review.activeTab}
      onSetTab={review.setActiveTab}
      moodsUI={review.moodsUI}
      spheresUI={review.spheresUI}
      onSaveAnswer={review.handleSaveAnswer}
    />
  );
};

export default MonthReviewArchiveModal;
