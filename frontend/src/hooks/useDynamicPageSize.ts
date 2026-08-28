// src/hooks/useDynamicPageSize.ts
import { useState, useEffect, useCallback } from 'react';

interface UseDynamicPageSizeOptions {
  rowHeight: number;
  headerHeight?: number;
  safetyBuffer?: number;
  columns?: number | ((width: number) => number);
  minItems?: number;
  maxItems?: number;
  defaultPageSize?: number;
}

export function useDynamicPageSize<T extends HTMLElement = HTMLDivElement>({
  rowHeight,
  headerHeight = 0,
  safetyBuffer = 4,
  columns = 1,
  minItems = 1,
  maxItems = 40,
  defaultPageSize = 8,
}: UseDynamicPageSizeOptions): { containerRef: (node: T | null) => void; pageSize: number } {
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [element, setElement] = useState<T | null>(null);

  const containerRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;

    const calculate = () => {
      const height = element.clientHeight;
      const width = element.clientWidth;
      if (height <= 0) return;

      // Misuriamo l'altezza effettiva del primo elemento figlio nel DOM se presente
      let effectiveRowHeight = rowHeight;
      const firstChild = element.firstElementChild as HTMLElement | null;
      if (firstChild && firstChild.offsetHeight > 0) {
        effectiveRowHeight = firstChild.offsetHeight;
      }

      const availableHeight = Math.max(0, height - headerHeight - safetyBuffer);
      const rows = Math.floor(availableHeight / effectiveRowHeight);

      let cols = 1;
      if (typeof columns === 'function') {
        cols = columns(width);
      } else if (typeof columns === 'number') {
        cols = columns;
      }

      const calculated = Math.max(minItems, Math.min(maxItems, Math.max(1, rows) * cols));
      setPageSize((prev) => (prev !== calculated ? calculated : prev));
    };

    // Esecuzione immediata
    calculate();

    const resizeObserver = new ResizeObserver(() => {
      calculate();
    });

    resizeObserver.observe(element);

    // Osserva anche modifiche alla lista figli per calcolare l'altezza esatta
    const mutationObserver = new MutationObserver(() => {
      calculate();
    });
    mutationObserver.observe(element, { childList: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [element, rowHeight, headerHeight, safetyBuffer, columns, minItems, maxItems]);

  return { containerRef, pageSize };
}

export default useDynamicPageSize;
