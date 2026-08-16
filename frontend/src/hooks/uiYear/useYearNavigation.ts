// frontend/src/hooks/uiYear/useYearNavigation.ts
import { useState, useCallback, useMemo } from 'react';

export interface UseYearNavigationResult {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  handlePrevYear: () => void;
  handleNextYear: () => void;
  handleResetCurrentYear: () => void;
  isCurrentYear: boolean;
}

export const useYearNavigation = (): UseYearNavigationResult => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const handlePrevYear = useCallback(() => {
    setSelectedYear((prev) => prev - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setSelectedYear((prev) => prev + 1);
  }, []);

  const handleResetCurrentYear = useCallback(() => {
    setSelectedYear(new Date().getFullYear());
  }, []);

  const isCurrentYear = useMemo(() => {
    return selectedYear === new Date().getFullYear();
  }, [selectedYear]);

  return {
    selectedYear,
    setSelectedYear,
    handlePrevYear,
    handleNextYear,
    handleResetCurrentYear,
    isCurrentYear,
  };
};
