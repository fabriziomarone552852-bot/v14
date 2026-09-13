// src/components/archive/reviews/ReviewsPageModals.tsx
import React from 'react';
import { ReviewFilterModal } from './ReviewFilterModal';
import { MonthReviewArchiveModal } from './MonthReviewArchiveModal';
import { YearReviewArchiveModal } from './YearReviewArchiveModal';
import type { UseModalResult } from '@/hooks/useModals';
import type { ReviewTabType, ReviewFilterState } from '@/hooks/useReviewArchiveData';

interface ReviewsPageModalsProps {
  filterModal: UseModalResult;
  monthModal: UseModalResult<Date>;
  yearModal: UseModalResult<number>;
  filters: ReviewFilterState;
  onFilterChange: (filters: ReviewFilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  availableTags: string[];
  activeTab: ReviewTabType;
}

export const ReviewsPageModals: React.FC<ReviewsPageModalsProps> = ({
  filterModal,
  monthModal,
  yearModal,
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters,
  availableTags,
  activeTab,
}) => {
  return (
    <>
      {/* MODALE FILTRI & RICERCA IN OVERLAY GLOBALE */}
      <ReviewFilterModal
        isOpen={filterModal.isOpen}
        onClose={filterModal.close}
        filters={filters}
        onFilterChange={onFilterChange}
        onReset={onResetFilters}
        hasActiveFilters={hasActiveFilters}
        availableTags={availableTags}
        activeTab={activeTab}
      />

      {/* MODALE REVIEW MESE */}
      <MonthReviewArchiveModal
        isOpen={monthModal.isOpen}
        onClose={monthModal.close}
        monthDate={monthModal.data}
      />

      {/* MODALE REVIEW ANNO */}
      <YearReviewArchiveModal
        isOpen={yearModal.isOpen}
        onClose={yearModal.close}
        year={yearModal.data}
      />
    </>
  );
};
