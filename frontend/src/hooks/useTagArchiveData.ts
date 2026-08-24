// src/hooks/useTagArchiveData.ts
import { useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CategoryGenre, type Category } from '@/types/categories';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';

export interface AssociatedReview {
  id: string;
  type: 'month' | 'year';
  title: string;
  date: Date;
  year: number;
  month?: number;
}

export interface EnrichedTagItem {
  id: number;
  name: string;
  color: string;
  genre: number;
  totalUsage: number;
  monthlyCount: number;
  yearlyCount: number;
  associatedReviews: AssociatedReview[];
  scale: number; // 1 (piccolo) a 5 (grande/prominente)
}

interface UseTagArchiveDataOptions {
  categories: Category[];
  rawMonthlyEntries: MonthlyEntryResponse[];
  rawYearlyEntries: DbYearlyEntry[];
  searchQuery: string;
  currentPage: number;
  pageSize?: number;
}

export interface TagArchiveDataResult {
  allTags: EnrichedTagItem[];
  filteredTags: EnrichedTagItem[];
  paginatedTags: EnrichedTagItem[];
  totalPages: number;
  totalCount: number;
  maxUsage: number;
}

export const useTagArchiveData = ({
  categories,
  rawMonthlyEntries,
  rawYearlyEntries,
  searchQuery,
  currentPage,
  pageSize = 8,
}: UseTagArchiveDataOptions): TagArchiveDataResult => {
  return useMemo(() => {
    // 1. Filtriamo solo i tag reali (genre === 5)
    const realTags = categories.filter(
      (c) => c.genre === CategoryGenre.TAG || c.genre === 5
    );

    const tagMap = new Map<number, Category>();
    realTags.forEach((t) => tagMap.set(t.id, t));

    const tagReviewsMap = new Map<number, AssociatedReview[]>();
    realTags.forEach((t) => tagReviewsMap.set(t.id, []));

    const findTagId = (fieldVal: string | null | undefined): number | null => {
      if (!fieldVal || !fieldVal.trim()) return null;
      const clean = fieldVal.trim();
      const numId = parseInt(clean, 10);
      if (!isNaN(numId) && tagMap.has(numId)) return numId;
      const lower = clean.toLowerCase();
      const found = realTags.find((t) => t.category_name.toLowerCase() === lower);
      return found ? found.id : null;
    };

    // Elaborazione utilizzi reali dalle revisioni mensili
    rawMonthlyEntries.forEach((entry) => {
      if (entry.monthly_type === 'TG') {
        const tagId = findTagId(entry.monthly_field);
        if (tagId !== null && tagReviewsMap.has(tagId)) {
          const list = tagReviewsMap.get(tagId)!;
          const monthDate = new Date(entry.year, entry.month - 1, 1);
          const monthName = format(monthDate, 'MMMM', { locale: it }).toUpperCase();
          const reviewId = `month-${entry.year}-${entry.month}`;
          if (!list.some((r) => r.id === reviewId)) {
            list.push({
              id: reviewId,
              type: 'month',
              title: `Revisione di ${monthName} ${entry.year}`,
              date: monthDate,
              year: entry.year,
              month: entry.month,
            });
          }
        }
      }
    });

    // Elaborazione utilizzi reali dalle revisioni annuali
    rawYearlyEntries.forEach((entry) => {
      if (entry.yearly_type === 'TG') {
        const tagId = findTagId(entry.yearly_field);
        if (tagId !== null && tagReviewsMap.has(tagId)) {
          const list = tagReviewsMap.get(tagId)!;
          const yearDate = new Date(entry.year, 0, 1);
          const reviewId = `year-${entry.year}`;
          if (!list.some((r) => r.id === reviewId)) {
            list.push({
              id: reviewId,
              type: 'year',
              title: `Revisione dell'anno ${entry.year}`,
              date: yearDate,
              year: entry.year,
            });
          }
        }
      }
    });

    // Costruzione lista tag reali arricchita
    const realEnrichedList: EnrichedTagItem[] = realTags.map((cat) => {
      const reviews = tagReviewsMap.get(cat.id) || [];
      const monthlyCount = reviews.filter((r) => r.type === 'month').length;
      const yearlyCount = reviews.filter((r) => r.type === 'year').length;
      return {
        id: cat.id,
        name: cat.category_name,
        color: cat.colore || '#8B5CF6',
        genre: cat.genre,
        totalUsage: monthlyCount + yearlyCount,
        monthlyCount,
        yearlyCount,
        associatedReviews: reviews,
        scale: 1,
      };
    });

    // Calcolo del valore massimo di utilizzi per determinare la scala (1..5)
    let maxUsageFound = 0;
    realEnrichedList.forEach((t) => {
      if (t.totalUsage > maxUsageFound) maxUsageFound = t.totalUsage;
    });

    realEnrichedList.forEach((item) => {
      if (maxUsageFound > 0 && item.totalUsage > 0) {
        // Scala da 1 a 5 proporzionale
        item.scale = Math.min(5, Math.max(1, 1 + Math.round((item.totalUsage / maxUsageFound) * 4)));
      } else {
        item.scale = 1;
      }
    });

    // Ordinamento alfabetico A-Z
    const sortedList = [...realEnrichedList].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    // Filtro di ricerca
    const query = searchQuery.trim().toLowerCase();
    const filtered = sortedList.filter((item) => {
      if (!query) return true;
      return item.name.toLowerCase().includes(query);
    });

    // Paginazione
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    return {
      allTags: sortedList,
      filteredTags: filtered,
      paginatedTags: paginated,
      totalPages,
      totalCount: filtered.length,
      maxUsage: maxUsageFound,
    };
  }, [categories, rawMonthlyEntries, rawYearlyEntries, searchQuery, currentPage, pageSize]);
};

export default useTagArchiveData;
