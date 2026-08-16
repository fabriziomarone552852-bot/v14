// frontend/src/hooks/uiYear/useYearReview.ts
import { useState, useMemo, useCallback } from 'react';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';

export type YearReviewSidebarTab = 'tasks' | 'habits';

export interface YearReviewData {
  yearlyEntries: DbYearlyEntry[];
  yearlyPositive: DbYearlyEntry[];
  yearlyNegative: DbYearlyEntry[];
  assignedTags?: Category[];
  allTags?: Category[];
  tagEntryMap?: Record<number, number>;
  onAddTag?: (categoryId: number) => void;
  onCreateAndAddTag?: (tagName: string) => void;
  onRemoveTag?: (yearlyEntryId: number) => void;
}

export interface UseYearReviewResult {
  isOpen: boolean;
  reviewStatus: 'none' | 'empty' | 'filled';
  openReview: () => void;
  closeReview: () => void;
  activeTab: YearReviewSidebarTab | null;
  setActiveTab: (tab: YearReviewSidebarTab | null) => void;
  reviewData: YearReviewData;
}

export const useYearReview = (
  year: number,
  entries: DbYearlyEntry[],
  isCurrentYear: boolean,
  tagInfo?: {
    assignedTags: Category[];
    allTags: Category[];
    tagEntryMap: Record<number, number>;
    onAddTag: (categoryId: number) => void;
    onCreateAndAddTag: (tagName: string) => void;
    onRemoveTag: (yearlyEntryId: number) => void;
  }
): UseYearReviewResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<YearReviewSidebarTab | null>(null);

  const reviewStatus = useMemo((): 'none' | 'empty' | 'filled' => {
    const currentYear = new Date().getFullYear();
    if (year >= currentYear) return 'none';
    const hasAnswer = entries.some(
      e => ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'].includes(e.yearly_type) && e.yearly_field && e.yearly_field.trim() !== ''
    );
    return hasAnswer ? 'filled' : 'empty';
  }, [entries, year]);

  const reviewData = useMemo((): YearReviewData => {
    return {
      yearlyEntries: entries,
      yearlyPositive: entries.filter(e => e.yearly_type === 'EP'),
      yearlyNegative: entries.filter(e => e.yearly_type === 'EN'),
      assignedTags: tagInfo?.assignedTags || [],
      allTags: tagInfo?.allTags || [],
      tagEntryMap: tagInfo?.tagEntryMap || {},
      onAddTag: tagInfo?.onAddTag,
      onCreateAndAddTag: tagInfo?.onCreateAndAddTag,
      onRemoveTag: tagInfo?.onRemoveTag,
    };
  }, [entries, tagInfo]);

  const openReview = useCallback(() => {
    setIsOpen(true);
    setActiveTab(null);
  }, []);

  const closeReview = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    reviewStatus,
    openReview,
    closeReview,
    activeTab,
    setActiveTab,
    reviewData,
  };
};
