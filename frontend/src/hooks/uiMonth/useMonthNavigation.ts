import { useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDateString } from '@/utils/dateUtils';
import { useDay } from '@/context/DayContext';

export interface UseMonthNavigationResult {
  targetDate: Date;
  setTargetDate: (date: Date) => void;
  firstDay: Date;
  lastDay: Date;
  firstDayStr: string;
  lastDayStr: string;
  monthName: string;
  year: number;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  handleResetCurrentMonth: () => void;
  handleGoToDay: (dateStr: string) => void;
}

export const useMonthNavigation = (): UseMonthNavigationResult => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dataRiferimento: targetDate, changeDate: setTargetDate } = useDay();

  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number);
      if (y && m) {
        setTargetDate(new Date(y, m - 1, d || 1));
      }
    }
  }, [searchParams, setTargetDate]);

  // Calcolo preciso del primo e ultimo giorno del mese
  const firstDay = useMemo((): Date => {
    return new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  }, [targetDate]);

  const lastDay = useMemo((): Date => {
    return new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  }, [targetDate]);

  const firstDayStr = useMemo((): string => formatDateString(firstDay), [firstDay]);
  const lastDayStr = useMemo((): string => formatDateString(lastDay), [lastDay]);

  const monthName = useMemo((): string => {
    return targetDate.toLocaleDateString('it-IT', { month: 'long' }).toUpperCase();
  }, [targetDate]);

  const year = targetDate.getFullYear();

  const handlePrevMonth = useCallback((): void => {
    const d = new Date(targetDate.getFullYear(), targetDate.getMonth() - 1, 1);
    setTargetDate(d);
  }, [targetDate, setTargetDate]);
  
  const handleNextMonth = useCallback((): void => {
    const d = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);
    setTargetDate(d);
  }, [targetDate, setTargetDate]);
  
  const handleResetCurrentMonth = useCallback((): void => {
    setTargetDate(new Date());
  }, [setTargetDate]);

  const handleGoToDay = useCallback((dateStr: string): void => {
    navigate('/giorno', { state: { selectedDate: dateStr } }); 
  }, [navigate]);

  return {
    targetDate,
    setTargetDate,
    firstDay,
    lastDay,
    firstDayStr,
    lastDayStr,
    monthName,
    year,
    handlePrevMonth,
    handleNextMonth,
    handleResetCurrentMonth,
    handleGoToDay
  };
};