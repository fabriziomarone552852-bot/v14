// frontend/src/components/year/review/YearReviewPixelsPanel.tsx
import React from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { Category } from '@/types/categories';
import { useYearReviewPixelsLogic } from './useYearReviewPixelsLogic';
import { YearReviewPixelsGrid } from './YearReviewPixelsGrid';
import { YearReviewPixelsSidebar } from './YearReviewPixelsSidebar';

export interface YearReviewPixelsPanelProps {
  year: number;
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
}

export const YearReviewPixelsPanel: React.FC<YearReviewPixelsPanelProps> = ({
  year,
  dailyEntries = [],
  allCategories,
}) => {
  const {
    categoriesById,
    entriesByDate,
    daysInYear,
    daysPerMonth,
    moodStats,
    hoveredKey,
    setHoveredKey,
  } = useYearReviewPixelsLogic({ year, dailyEntries, allCategories });

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full overflow-hidden select-none">
      {/* GRIGLIA ANNO IN PIXEL (12 Colonne x 31 Righe) */}
      <YearReviewPixelsGrid
        year={year}
        daysPerMonth={daysPerMonth}
        entriesByDate={entriesByDate}
        categoriesById={categoriesById}
        hoveredKey={hoveredKey}
        setHoveredKey={setHoveredKey}
      />

      {/* PANNELLO LATERALE: LEGENDA & STATISTICHE */}
      <YearReviewPixelsSidebar
        daysInYear={daysInYear}
        moodStats={moodStats}
      />
    </div>
  );
};

export default YearReviewPixelsPanel;
