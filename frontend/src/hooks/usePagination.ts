// src/hooks/usePagination.ts
import { useState, useMemo, useEffect } from 'react';

export interface UsePaginationResult<T> {
  paginatedItems: T[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const usePagination = <T>(items: T[], pageSize: number): UsePaginationResult<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Auto-reset currentPage when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * pageSize;
    return items.slice(startIdx, startIdx + pageSize);
  }, [items, pageSize, currentPage, totalPages]);

  return {
    paginatedItems,
    currentPage,
    totalPages,
    setCurrentPage,
  };
};
