// src/components/reviews/MonthReviewArchiveModal.tsx
import React from 'react';
import { format } from 'date-fns';
import { useAgendaMonth } from '@/hooks/useAgendaMonth';
import { useMonthReview } from '@/hooks/uiMonth/useMonthReview';
import { MonthReviewModal } from '@/components/weekmonth/review/MonthReviewModal';

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
  if (!isOpen || !monthDate) return null;

  return <MonthReviewArchiveModalContent isOpen={isOpen} onClose={onClose} monthDate={monthDate} />;
};

const MonthReviewArchiveModalContent: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  monthDate: Date;
}> = ({ isOpen, onClose, monthDate }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const firstDayStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const lastDayStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const agenda = useAgendaMonth(firstDayStr, lastDayStr);
  const monthQueryKey = ['monthSync', firstDayStr, lastDayStr];
  const review = useMonthReview(agenda.monthData, monthDate, monthQueryKey);

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
