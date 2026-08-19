// src/components/reviews/ReviewActionBar.tsx
import React from 'react';
import { SegmentedTabs, type TabItem } from '@/components/shared/layout/SegmentedTabs';
import { SearchIcon } from '@/components/shared/utils/Icons';
import type { ReviewTabType } from '@/hooks/useReviewArchiveData';

interface ReviewActionBarProps {
  activeTab: ReviewTabType;
  onTabChange: (tab: ReviewTabType) => void;
  monthsCount: number;
  yearsCount: number;
  onOpenSearch: () => void;
  activeFiltersCount: number;
  panelClass?: string;
}

export const ReviewActionBar: React.FC<ReviewActionBarProps> = ({
  activeTab,
  onTabChange,
  monthsCount,
  yearsCount,
  onOpenSearch,
  activeFiltersCount,
  panelClass = '',
}) => {
  const tabs: TabItem<ReviewTabType>[] = [
    {
      id: 'months',
      label: 'Revisioni Mesi',
      icon: '📅',
      count: monthsCount,
      badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200/60',
    },
    {
      id: 'years',
      label: 'Revisioni Anni',
      icon: '📆',
      count: yearsCount,
      badgeBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    },
  ];

  return (
    <div
      className={`${panelClass} px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none`}
    >
      {/* 1. SLIDER / SCHEDE REVISIONI (MESI / ANNI) A SINISTRA */}
      <SegmentedTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={onTabChange}
      />

      {/* 2. LENTE DI RICERCA & FILTRI A DESTRA */}
      <button
        type="button"
        onClick={onOpenSearch}
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          activeFiltersCount > 0
            ? 'bg-blue-50 border-blue-200 text-blue-600 shadow-2xs'
            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
        title="Filtri & Ricerca"
      >
        <SearchIcon className="w-5 h-5" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-sm">
            {activeFiltersCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default ReviewActionBar;
