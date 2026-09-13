// src/mobile/hooks/useMobileSwipeTransition.ts
import { useState, useRef, useCallback, useEffect } from 'react';

export type SwipeDirection = 'down' | 'up' | null;

export interface UseMobileSwipeTransitionReturn {
  swipeDirection: SwipeDirection;
  triggerSwipeDown: (callback: () => void) => void;
  triggerSwipeUp: (callback: () => void) => void;
}

export const useMobileSwipeTransition = (durationMs = 720): UseMobileSwipeTransitionReturn => {
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const triggerSwipeDown = useCallback(
    (callback: () => void) => {
      clearTimer();
      setSwipeDirection('down');
      callback();
      timeoutRef.current = setTimeout(() => {
        setSwipeDirection(null);
      }, durationMs);
    },
    [clearTimer, durationMs]
  );

  const triggerSwipeUp = useCallback(
    (callback: () => void) => {
      clearTimer();
      setSwipeDirection('up');
      callback();
      timeoutRef.current = setTimeout(() => {
        setSwipeDirection(null);
      }, durationMs);
    },
    [clearTimer, durationMs]
  );

  return {
    swipeDirection,
    triggerSwipeDown,
    triggerSwipeUp,
  };
};

export default useMobileSwipeTransition;
