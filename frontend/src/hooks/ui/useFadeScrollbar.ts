// src/hooks/ui/useFadeScrollbar.ts
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook riutilizzabile per gestire scrollbar a scomparsa:
 * la scrollbar rimane invisibile a riposo e compare solo durante lo scorrimento attivo dell'utente.
 */
export function useFadeScrollbar(timeoutMs: number = 800) {
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, timeoutMs);
  }, [timeoutMs]);

  const scrollbarClass = `fade-scrollbar ${isScrolling ? 'is-scrolling' : ''}`;

  return { isScrolling, handleScroll, scrollbarClass };
}

export default useFadeScrollbar;
