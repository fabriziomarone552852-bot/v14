// src/hooks/useCategoryArchiveData.ts
import { useMemo } from 'react';
import { CategoryGenre, type Category } from '@/types/categories';
import type { CategoryFilterState } from '@/components/categories/CategoryFilterModal';
import type { CategorySortField, CategorySortDirection } from '@/components/categories/CategoryTableHeader';

export interface CategoryStats {
  total: number;
  tasks: number;
  events: number;
  common: number;
  mood: number;
}

interface UseCategoryArchiveDataOptions {
  rawCategories: Category[];
  filters: CategoryFilterState;
  sortField: CategorySortField;
  sortDirection: CategorySortDirection;
  currentPage: number;
  pageSize?: number;
}

export interface CategoryArchiveDataResult {
  filteredCategories: Category[];
  paginatedCategories: Category[];
  stats: CategoryStats;
  totalPages: number;
}

export const useCategoryArchiveData = ({
  rawCategories,
  filters,
  sortField,
  sortDirection,
  currentPage,
  pageSize = 12,
}: UseCategoryArchiveDataOptions): CategoryArchiveDataResult => {
  return useMemo(() => {
    // 1. Calcolo Statistiche Complessive in RAM
    const total = rawCategories.length;
    const tasks = rawCategories.filter(
      (c) => c.genre === CategoryGenre.TASKS || c.genre === 1
    ).length;
    const events = rawCategories.filter(
      (c) => c.genre === CategoryGenre.EVENTS || c.genre === 2
    ).length;
    const common = rawCategories.filter(
      (c) => c.genre === CategoryGenre.COMMON || c.genre === 3
    ).length;
    const mood = rawCategories.filter(
      (c) => c.genre === CategoryGenre.MOOD || c.genre === 4
    ).length;

    // 2. Filtro in RAM
    const filtered = rawCategories.filter((cat) => {
      // Filtro per tipologia / genere
      if (filters.genre !== 'all') {
        const targetGenre = Number(filters.genre);
        if (cat.genre !== targetGenre) return false;
      }

      // Filtro per parola chiave nel nome
      if (filters.keyword.trim()) {
        const q = filters.keyword.toLowerCase().trim();
        const matchName = cat.category_name
          ? cat.category_name.toLowerCase().includes(q)
          : false;
        if (!matchName) return false;
      }

      return true;
    });

    // 3. Ordinamento
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.category_name.localeCompare(b.category_name);
          break;
        case 'genre':
          comparison = (a.genre || 0) - (b.genre || 0);
          break;
        case 'color':
          comparison = (a.colore || '').localeCompare(b.colore || '');
          break;
        case 'created':
        default:
          comparison = (a.id || 0) - (b.id || 0);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    // 4. Paginazione
    const totalPagesCount = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = Math.min(currentPage, totalPagesCount);
    const startIdx = (safePage - 1) * pageSize;
    const paginated = sorted.slice(startIdx, startIdx + pageSize);

    return {
      filteredCategories: sorted,
      paginatedCategories: paginated,
      stats: {
        total,
        tasks,
        events,
        common,
        mood,
      },
      totalPages: totalPagesCount,
    };
  }, [rawCategories, filters, sortField, sortDirection, currentPage, pageSize]);
};
