// src/mobile/components/modals/review/hooks/useMobileMonthReviewRecapData.ts
import { useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { MonthReviewData } from '@/hooks/uiMonth/useMonthReview';
import type { TrackerItem } from '@/types/monthlyentries';
import {
  formatShortDate,
  getActiveHabitsInMonth,
} from '../monthReview.utils';
import {
  DEFAULT_MOODS,
  DEFAULT_SPHERES,
} from '../yearReview.utils';

export function useMobileMonthReviewRecapData(
  monthDate: Date,
  reviewData: MonthReviewData,
  moodsUI: TrackerItem[],
  spheresUI: TrackerItem[],
) {
  const monthName = useMemo(() => {
    return format(monthDate, 'MMMM yyyy', { locale: it }).toUpperCase();
  }, [monthDate]);

  const allMonthDays = useMemo(() => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth() + 1;
    const count = new Date(y, m, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [monthDate]);

  const safeMoods = useMemo(() => {
    return moodsUI && moodsUI.length > 0 ? moodsUI : DEFAULT_MOODS;
  }, [moodsUI]);

  const safeSpheres = useMemo(() => {
    return spheresUI && spheresUI.length > 0 ? spheresUI : DEFAULT_SPHERES;
  }, [spheresUI]);

  // Normalizza eventi positivi e negativi con data
  const allPositive = useMemo(() => {
    return [
      ...reviewData.monthlyPositive
        .filter((e) => e.monthly_field?.trim())
        .map((e) => ({
          id: `mp-${e.id}`,
          text: e.monthly_field!.trim(),
          date: undefined as string | undefined,
        })),
      ...reviewData.weeklyPositive
        .filter((e) => e.testo?.trim())
        .map((e) => ({
          id: `wp-${e.id}`,
          text: e.testo!.trim(),
          date: formatShortDate(e.data_riferimento),
        })),
    ];
  }, [reviewData.monthlyPositive, reviewData.weeklyPositive]);

  const allNegative = useMemo(() => {
    return [
      ...reviewData.monthlyNegative
        .filter((e) => e.monthly_field?.trim())
        .map((e) => ({
          id: `mn-${e.id}`,
          text: e.monthly_field!.trim(),
          date: undefined as string | undefined,
        })),
      ...reviewData.weeklyNegative
        .filter((e) => e.testo?.trim())
        .map((e) => ({
          id: `wn-${e.id}`,
          text: e.testo!.trim(),
          date: formatShortDate(e.data_riferimento),
        })),
    ];
  }, [reviewData.monthlyNegative, reviewData.weeklyNegative]);

  // Filtra abitudini attive nel mese
  const activeHabitsInMonth = useMemo(() => {
    return getActiveHabitsInMonth(reviewData.habits, monthDate);
  }, [reviewData.habits, monthDate]);

  return {
    monthName,
    allMonthDays,
    safeMoods,
    safeSpheres,
    allPositive,
    allNegative,
    activeHabitsInMonth,
  };
}
