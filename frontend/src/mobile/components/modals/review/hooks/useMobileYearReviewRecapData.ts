// src/mobile/components/modals/review/hooks/useMobileYearReviewRecapData.ts
import { useState, useMemo, useRef, useEffect } from 'react';
import type { TrackerItem } from '@/types/monthlyentries';
import type { Category } from '@/types/categories';
import type { Habit } from '@/types/habits';
import type { DailyEntry } from '@/types/dailyentries';
import { useCategories } from '@/hooks/useCategories';
import {
  DEFAULT_MOODS,
  DEFAULT_SPHERES,
  getHabitActiveDaysInYear,
  getLongestStreak,
} from '../yearReview.utils';
import type { ActiveHabitInYear } from '../YearReviewHabitsRecap';

export function useMobileYearReviewRecapData(
  year: number,
  moodsUI: TrackerItem[],
  spheresUI: TrackerItem[],
  habits: Habit[],
  dailyEntries: DailyEntry[] = [],
  allCategories?: Category[],
) {
  const [selectedPixelInfo, setSelectedPixelInfo] = useState<{
    date: string;
    moodName: string;
    color: string;
  } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = allCategories && allCategories.length > 0 ? allCategories : dbCategories;

  const safeMoods = useMemo(() => {
    return moodsUI && moodsUI.length > 0 ? moodsUI : DEFAULT_MOODS;
  }, [moodsUI]);

  const safeSpheres = useMemo(() => {
    return spheresUI && spheresUI.length > 0 ? spheresUI : DEFAULT_SPHERES;
  }, [spheresUI]);

  // Calcolo delle abitudini e routine attive nell'anno selezionato
  const activeHabitsInYear: ActiveHabitInYear[] = useMemo(() => {
    return habits
      .map((habit) => {
        const activeDays = getHabitActiveDaysInYear(habit, year);
        const yearLogs = habit.logs.filter((l) => {
          if (l.count <= 0) return false;
          const dStr = l.data_riferimento.split('T')[0];
          const y = parseInt(dStr.split('-')[0], 10);
          return y === year;
        });
        const completedDays = yearLogs.length;
        const longestStreak = getLongestStreak(yearLogs);
        const pct = activeDays > 0 ? (completedDays / activeDays) * 100 : 0;

        return {
          habit,
          activeDays,
          completedDays,
          longestStreak,
          pct,
        };
      })
      .filter((h) => h.activeDays > 0);
  }, [habits, year]);

  const daysInMonths = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => new Date(year, m + 1, 0).getDate());
  }, [year]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    categoriesToUse.forEach((c) => {
      if (c.id != null) map.set(c.id, c);
    });
    return map;
  }, [categoriesToUse]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DailyEntry>();
    (dailyEntries || []).forEach((entry) => {
      if (entry.tipo === 'PX' && entry.data_riferimento) {
        const dStr = String(entry.data_riferimento).split('T')[0];
        map.set(dStr, entry);
      }
    });
    return map;
  }, [dailyEntries]);

  // Gestione tocco pixel con nuvoletta temporanea al centro
  const handlePixelClick = (dateStr: string, moodName: string, color: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setSelectedPixelInfo({ date: dateStr, moodName, color });
    toastTimeoutRef.current = window.setTimeout(() => {
      setSelectedPixelInfo(null);
      toastTimeoutRef.current = null;
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  return {
    safeMoods,
    safeSpheres,
    activeHabitsInYear,
    daysInMonths,
    categoriesById,
    entriesByDate,
    selectedPixelInfo,
    setSelectedPixelInfo,
    handlePixelClick,
  };
}
