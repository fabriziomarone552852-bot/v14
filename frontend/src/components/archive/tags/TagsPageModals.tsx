// src/components/archive/tags/TagsPageModals.tsx
import React from 'react';
import type { EnrichedTagItem, AssociatedReview } from '@/hooks/useTagArchiveData';
import { TagReviewsModal } from './TagReviewsModal';
import { MonthReviewArchiveModal } from '@/components/archive/reviews/MonthReviewArchiveModal';
import { YearReviewArchiveModal } from '@/components/archive/reviews/YearReviewArchiveModal';

interface TagsPageModalsProps {
  tagForReviews: EnrichedTagItem | null;
  isReviewsModalOpen: boolean;
  onCloseReviewsModal: () => void;
  onOpenReviewFromTag: (review: AssociatedReview) => void;
  selectedMonthDate: Date | null;
  isMonthReviewOpen: boolean;
  onCloseMonthReview: () => void;
  selectedYear: number | null;
  isYearReviewOpen: boolean;
  onCloseYearReview: () => void;
}

export const TagsPageModals: React.FC<TagsPageModalsProps> = ({
  tagForReviews,
  isReviewsModalOpen,
  onCloseReviewsModal,
  onOpenReviewFromTag,
  selectedMonthDate,
  isMonthReviewOpen,
  onCloseMonthReview,
  selectedYear,
  isYearReviewOpen,
  onCloseYearReview,
}) => {
  return (
    <>
      {/* 1. MODALE REVIEW COLLEGATE (DOPPIO CLICK) */}
      <TagReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={onCloseReviewsModal}
        tag={tagForReviews}
        onOpenReview={onOpenReviewFromTag}
      />

      {/* 2. MODALI DI REVISIONE PERIODICA (DALL'APERTURA DIRETTA) */}
      <MonthReviewArchiveModal
        isOpen={isMonthReviewOpen}
        onClose={onCloseMonthReview}
        monthDate={selectedMonthDate}
      />

      <YearReviewArchiveModal
        isOpen={isYearReviewOpen}
        onClose={onCloseYearReview}
        year={selectedYear}
      />
    </>
  );
};
