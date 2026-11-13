// src/mobile/hooks/useMobileHorizontalSlidePages.ts
import { useState, useCallback } from 'react';
import type React from 'react';

export interface UseMobileHorizontalSlidePagesOptions<TPage extends number> {
  pageCount: number;
  initialPage: TPage;
  circular?: boolean;
  minSwipeDeltaPx?: number;
}

export interface UseMobileHorizontalSlidePagesReturn<TPage extends number> {
  activePageIndex: TPage;
  setActivePageIndex: React.Dispatch<React.SetStateAction<TPage>>;
  getSlideClass: (pageIdx: TPage) => string;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
}

export const useMobileHorizontalSlidePages = <TPage extends number>({
  pageCount,
  initialPage,
  circular = false,
  minSwipeDeltaPx = 45,
}: UseMobileHorizontalSlidePagesOptions<TPage>): UseMobileHorizontalSlidePagesReturn<TPage> => {
  const [activePageIndex, setActivePageIndex] = useState<TPage>(initialPage);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const getSlideClass = useCallback(
    (pageIdx: TPage): string => {
      const diff = pageIdx - activePageIndex;
      if (diff === 0) {
        return 'translate-x-0 pointer-events-auto z-10 opacity-100';
      }
      if (circular) {
        if (diff === 1 || diff === -(pageCount - 1)) {
          return 'translate-x-full pointer-events-none z-0 opacity-0';
        }
        return '-translate-x-full pointer-events-none z-0 opacity-0';
      }
      if (diff > 0) {
        return 'translate-x-full pointer-events-none z-0 opacity-0';
      }
      return '-translate-x-full pointer-events-none z-0 opacity-0';
    },
    [activePageIndex, circular, pageCount]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      setTouchStartX(null);
      setTouchStartY(null);

      // Ignora lo swipe orizzontale se prevale lo scroll verticale o sotto la soglia minima
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < minSwipeDeltaPx) return;

      if (deltaX < 0) {
        setActivePageIndex((prev) =>
          (circular ? (prev + 1) % pageCount : Math.min(pageCount - 1, prev + 1)) as TPage
        );
      } else if (deltaX > 0) {
        setActivePageIndex((prev) =>
          (circular ? (prev - 1 + pageCount) % pageCount : Math.max(0, prev - 1)) as TPage
        );
      }
    },
    [touchStartX, touchStartY, minSwipeDeltaPx, circular, pageCount]
  );

  return {
    activePageIndex,
    setActivePageIndex,
    getSlideClass,
    handleTouchStart,
    handleTouchEnd,
  };
};

export default useMobileHorizontalSlidePages;
