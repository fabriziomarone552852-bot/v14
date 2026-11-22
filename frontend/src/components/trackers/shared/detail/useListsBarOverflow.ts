import { useLayoutEffect, useState, type RefObject } from 'react';

const DEFAULT_POSTER_GAP_PX = 20;

export interface UseListsBarOverflowParams {
  anchorRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  posterRef?: RefObject<HTMLElement | null>;
  headerRef?: RefObject<HTMLElement | null>;
  listsCount: number;
  listsSignature: string;
  posterGapPx?: number;
}

/**
 * Misura lo spazio disponibile tra il margine destro della barra liste e il bordo destro
 * della locandina (poster). Se le pillole delle liste superano tale spazio (rischiando di
 * finire dietro o davanti alla locandina), restituisce `true` per raccoglierle nel
 * pulsante compatto con le tre lineette.
 */
export function useListsBarOverflow({
  anchorRef,
  contentRef,
  posterRef,
  headerRef,
  listsCount,
  listsSignature,
  posterGapPx = DEFAULT_POSTER_GAP_PX,
}: UseListsBarOverflowParams): boolean {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useLayoutEffect(() => {
    let isCancelled = false;

    const measure = () => {
      if (isCancelled) return;

      if (listsCount === 0) {
        setIsCollapsed((prev) => (prev ? false : prev));
        return;
      }

      const anchorEl = anchorRef.current;
      const contentEl = contentRef.current;
      if (!anchorEl || !contentEl) return;

      const contentWidth = contentEl.getBoundingClientRect().width;
      if (contentWidth <= 0) return;

      let availableWidth: number | null = null;
      const posterEl = posterRef?.current;

      if (posterEl) {
        const posterRect = posterEl.getBoundingClientRect();
        const anchorRect = anchorEl.getBoundingClientRect();
        if (posterRect.width > 0 && anchorRect.right > 0) {
          availableWidth = anchorRect.right - (posterRect.right + posterGapPx);
        }
      }

      if (availableWidth === null) {
        const headerEl = headerRef?.current;
        if (headerEl) {
          const headerWidth = headerEl.getBoundingClientRect().width;
          if (headerWidth > 0) {
            availableWidth = headerWidth - 340;
          }
        }
      }

      if (availableWidth === null) return;

      const shouldCollapse = Math.ceil(contentWidth) > Math.floor(availableWidth);
      setIsCollapsed((prev) => (prev === shouldCollapse ? prev : shouldCollapse));
    };

    measure();
    const rafId = window.requestAnimationFrame(measure);

    const observer = new ResizeObserver(measure);
    const observedElements = new Set<Element>();

    const candidates: Array<Element | null | undefined> = [
      headerRef?.current,
      posterRef?.current,
      posterRef?.current?.parentElement,
      contentRef.current,
      anchorRef.current,
    ];

    candidates.forEach((el) => {
      if (el && !observedElements.has(el)) {
        observedElements.add(el);
        observer.observe(el);
      }
    });

    window.addEventListener('resize', measure);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => undefined);
    }

    return () => {
      isCancelled = true;
      window.cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [anchorRef, contentRef, posterRef, headerRef, listsCount, listsSignature, posterGapPx]);

  return isCollapsed;
}
