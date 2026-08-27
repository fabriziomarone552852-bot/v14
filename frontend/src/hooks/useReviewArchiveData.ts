// src/hooks/useReviewArchiveData.ts
import { useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import type { MonthlyEntryResponse } from '@/types/monthlyentries';
import type { DbYearlyEntry } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';
import { paginate } from '@/utils/paginationUtils';

export type ReviewTabType = 'months' | 'years';

export interface MonthReviewItem {
  id: string;
  year: number;
  month: number;
  title: string;
  monthDate: Date;
  completedQuestionsCount: number;
  isCompleted: boolean;
  answers: Record<string, string>;
  tags: string[];
}

export interface YearReviewItem {
  id: string;
  year: number;
  title: string;
  yearDate: Date;
  completedQuestionsCount: number;
  isCompleted: boolean;
  answers: Record<string, string>;
  tags: string[];
}

export interface ReviewFilterState {
  keyword: string;
  tag: string;
  status: 'all' | 'completed' | 'pending';
}

interface UseReviewArchiveDataOptions {
  rawMonthlyEntries: MonthlyEntryResponse[];
  rawYearlyEntries: DbYearlyEntry[];
  categories: Category[];
  activeTab: ReviewTabType;
  filters: ReviewFilterState;
  currentPage: number;
  pageSize?: number;
}

const QUESTION_KEYS = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'] as const;

export const useReviewArchiveData = ({
  rawMonthlyEntries,
  rawYearlyEntries,
  categories,
  activeTab,
  filters,
  currentPage,
  pageSize = 8,
}: UseReviewArchiveDataOptions) => {
  return useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Mappa ID categoria -> Nome del Tag (es. 12 -> "sport")
    const categoryMap = new Map<number, string>();
    categories.forEach((c) => {
      categoryMap.set(c.id, c.category_name);
    });

    // Helper per risolvere il nome effettivo del tag
    const resolveTagName = (fieldVal: string | null | undefined): string | null => {
      if (!fieldVal || !fieldVal.trim()) return null;
      const clean = fieldVal.trim();
      const numId = parseInt(clean, 10);
      if (!isNaN(numId) && categoryMap.has(numId)) {
        return categoryMap.get(numId)!;
      }
      return clean;
    };

    // --- 1. COSTRUZIONE REVIEW MENSILI IN RAM ---
    const monthlyMap = new Map<string, { answers: Record<string, string>; tags: string[] }>();

    rawMonthlyEntries.forEach((entry) => {
      const key = `${entry.year}-${entry.month}`;
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { answers: {}, tags: [] });
      }
      const group = monthlyMap.get(key)!;
      if (QUESTION_KEYS.includes(entry.monthly_type as (typeof QUESTION_KEYS)[number])) {
        if (entry.monthly_field && entry.monthly_field.trim()) {
          group.answers[entry.monthly_type] = entry.monthly_field.trim();
        }
      } else if (entry.monthly_type === 'TG') {
        const tagName = resolveTagName(entry.monthly_field);
        if (tagName && !group.tags.includes(tagName)) {
          group.tags.push(tagName);
        }
      }
    });

    // Il mese corrente è sempre presente nell'archivio.
    // I mesi passati compaiono SOLO se l'utente ha effettivamente compilato risposte o tag.
    const monthKeys = new Set<string>();
    monthKeys.add(`${currentYear}-${currentMonth}`);

    monthlyMap.forEach((group, key) => {
      const hasContent = Object.keys(group.answers).length > 0 || group.tags.length > 0;
      if (hasContent) {
        monthKeys.add(key);
      }
    });

    const sortedMonthKeys = Array.from(monthKeys).sort((a, b) => {
      const [yA, mA] = a.split('-').map(Number);
      const [yB, mB] = b.split('-').map(Number);
      if (yA !== yB) return yB - yA;
      return mB - mA;
    });

    const allMonths: MonthReviewItem[] = [];
    sortedMonthKeys.forEach((key) => {
      const [y, m] = key.split('-').map(Number);
      const group = monthlyMap.get(key) || { answers: {}, tags: [] };
      const completedCount = QUESTION_KEYS.filter((k) => Boolean(group.answers[k])).length;
      const monthDate = new Date(y, m - 1, 1);
      const monthName = format(monthDate, 'MMMM', { locale: it }).toUpperCase();

      allMonths.push({
        id: key,
        year: y,
        month: m,
        title: `Revisione di ${monthName} ${y}`,
        monthDate,
        completedQuestionsCount: completedCount,
        isCompleted: completedCount === 6,
        answers: group.answers,
        tags: group.tags,
      });
    });

    // --- 2. COSTRUZIONE REVIEW ANNUALI IN RAM ---
    const yearlyMap = new Map<number, { answers: Record<string, string>; tags: string[] }>();

    rawYearlyEntries.forEach((entry) => {
      if (!yearlyMap.has(entry.year)) {
        yearlyMap.set(entry.year, { answers: {}, tags: [] });
      }
      const group = yearlyMap.get(entry.year)!;
      if (QUESTION_KEYS.includes(entry.yearly_type as (typeof QUESTION_KEYS)[number])) {
        if (entry.yearly_field && entry.yearly_field.trim()) {
          group.answers[entry.yearly_type] = entry.yearly_field.trim();
        }
      } else if (entry.yearly_type === 'TG') {
        const tagName = resolveTagName(entry.yearly_field);
        if (tagName && !group.tags.includes(tagName)) {
          group.tags.push(tagName);
        }
      }
    });

    // L'anno corrente è sempre presente nell'archivio.
    // Gli anni passati compaiono SOLO se hanno effettivamente risposte o tag registrati.
    const yearKeys = new Set<number>();
    yearKeys.add(currentYear);

    yearlyMap.forEach((group, y) => {
      const hasContent = Object.keys(group.answers).length > 0 || group.tags.length > 0;
      if (hasContent) {
        yearKeys.add(y);
      }
    });

    const sortedYearKeys = Array.from(yearKeys).sort((a, b) => b - a);

    const allYears: YearReviewItem[] = [];
    sortedYearKeys.forEach((y) => {
      const group = yearlyMap.get(y) || { answers: {}, tags: [] };
      const completedCount = QUESTION_KEYS.filter((k) => Boolean(group.answers[k])).length;
      const yearDate = new Date(y, 0, 1);

      allYears.push({
        id: String(y),
        year: y,
        title: `Revisione dell'anno ${y}`,
        yearDate,
        completedQuestionsCount: completedCount,
        isCompleted: completedCount === 6,
        answers: group.answers,
        tags: group.tags,
      });
    });

    // --- 3. RACCOLTA DI TUTTI I TAG DISPONIBILI PER AUTOCOMPLETE ---
    const availableTagsSet = new Set<string>();
    allMonths.forEach((m) => m.tags.forEach((t) => availableTagsSet.add(t)));
    allYears.forEach((y) => y.tags.forEach((t) => availableTagsSet.add(t)));
    const availableTags = Array.from(availableTagsSet).sort();

    // --- 4. FILTRAGGIO IN RAM IN BASE ALLA TAB ATTIVA ---
    const currentList = activeTab === 'months' ? allMonths : allYears;

    const filtered = currentList.filter((item) => {
      // Filtro per Stato Completamento
      if (filters.status === 'completed' && !item.isCompleted) return false;
      if (filters.status === 'pending' && item.isCompleted) return false;

      // Filtro per Parola Chiave (nel titolo o nelle risposte Q1..Q6)
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchAnswers = Object.values(item.answers).some((ans) =>
          ans.toLowerCase().includes(q)
        );
        if (!matchTitle && !matchAnswers) return false;
      }

      // Filtro per Tag
      if (filters.tag.trim()) {
        const tagQ = filters.tag.toLowerCase().trim();
        const matchTag = item.tags.some((t) => t.toLowerCase().includes(tagQ));
        if (!matchTag) return false;
      }

      return true;
    });

    // --- 5. PAGINAZIONE ---
    const { paginatedItems, totalPages: totalPagesCount } = paginate(filtered, currentPage, pageSize);

    return {
      monthsCount: allMonths.length,
      yearsCount: allYears.length,
      filteredItems: filtered,
      paginatedItems,
      totalPages: totalPagesCount,
      totalCount: filtered.length,
      availableTags,
    };
  }, [rawMonthlyEntries, rawYearlyEntries, categories, activeTab, filters, currentPage, pageSize]);
};
