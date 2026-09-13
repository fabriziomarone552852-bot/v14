// frontend/src/components/year/review/useYearReviewPixelsLogic.ts
import { useMemo, useState } from 'react';
import type { DailyEntry } from '@/types/dailyentries';
import type { Category } from '@/types/categories';
import { useCategories } from '@/hooks/useCategories';

export interface MonthInfo {
  short: string;
  full: string;
}

export const MESI: MonthInfo[] = [
  { short: 'GEN', full: 'Gennaio' },
  { short: 'FEB', full: 'Febbraio' },
  { short: 'MAR', full: 'Marzo' },
  { short: 'APR', full: 'Aprile' },
  { short: 'MAG', full: 'Maggio' },
  { short: 'GIU', full: 'Giugno' },
  { short: 'LUG', full: 'Luglio' },
  { short: 'AGO', full: 'Agosto' },
  { short: 'SET', full: 'Settembre' },
  { short: 'OTT', full: 'Ottobre' },
  { short: 'NOV', full: 'Novembre' },
  { short: 'DIC', full: 'Dicembre' },
];

export const pad = (n: number): string => String(n).padStart(2, '0');

export const formatMoodName = (name: string | null | undefined): string => {
  if (!name) return 'Nessun umore';
  const trimmed = name.trim();
  if (!trimmed) return 'Nessun umore';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export interface MoodStatItem {
  category: Category;
  count: number;
  percentage: number;
}

export interface MoodStats {
  list: MoodStatItem[];
  totalTracked: number;
  pctYear: number;
  topMood: MoodStatItem | null;
}

interface UseYearReviewPixelsLogicProps {
  year: number;
  dailyEntries?: DailyEntry[];
  allCategories?: Category[];
}

export const useYearReviewPixelsLogic = ({
  year,
  dailyEntries = [],
  allCategories,
}: UseYearReviewPixelsLogicProps) => {
  const { data: dbCategories = [] } = useCategories();
  const categoriesToUse = allCategories && allCategories.length > 0 ? allCategories : dbCategories;

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Mappa delle categorie MOOD (genere 4)
  const moodCategories = useMemo(() => {
    return categoriesToUse.filter((c: Category) => {
      if (!c) return false;
      const g = (c as unknown as { genre?: unknown }).genre;
      return g === 4 || g === '4' || g === 'MOOD' || String(g).toUpperCase() === 'MOOD' || Number(g) === 4;
    });
  }, [categoriesToUse]);

  const categoriesById = useMemo(() => {
    const map = new Map<number, Category>();
    categoriesToUse.forEach((c) => {
      if (c.id != null) map.set(c.id, c);
    });
    return map;
  }, [categoriesToUse]);

  // Mappa delle voci PX per data 'YYYY-MM-DD'
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

  // Calcolo giorni totali e giorni per mese
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;

  const daysPerMonth = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => new Date(year, m + 1, 0).getDate());
  }, [year]);

  // Statistiche Mood per la legenda
  const moodStats: MoodStats = useMemo(() => {
    const counts = new Map<number, number>();
    let totalTracked = 0;

    entriesByDate.forEach((entry) => {
      if (entry.category_id != null) {
        counts.set(entry.category_id, (counts.get(entry.category_id) || 0) + 1);
        totalTracked++;
      }
    });

    const list: MoodStatItem[] = moodCategories
      .map((cat) => {
        const count = counts.get(cat.id!) || 0;
        const pct = totalTracked > 0 ? (count / totalTracked) * 100 : 0;
        return {
          category: cat,
          count,
          percentage: pct,
        };
      })
      .sort((a, b) => b.count - a.count);

    // Identifichiamo il mood predominante
    const topMood = list.length > 0 && list[0].count > 0 ? list[0] : null;

    return {
      list,
      totalTracked,
      pctYear: (totalTracked / daysInYear) * 100,
      topMood,
    };
  }, [entriesByDate, moodCategories, daysInYear]);

  return {
    categoriesById,
    entriesByDate,
    daysInYear,
    daysPerMonth,
    moodStats,
    hoveredKey,
    setHoveredKey,
  };
};
