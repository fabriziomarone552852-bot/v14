// src/mobile/hooks/useLongPress.ts
import { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  delay?: number;
  onLongPress: () => void;
  onClick?: () => void;
}

export function useLongPress({
  delay = 400,
  onLongPress,
  onClick,
}: UseLongPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      isLongPressRef.current = false;
      if ('touches' in e && e.touches.length > 0) {
        startPosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if ('clientX' in e) {
        startPosRef.current = { x: e.clientX, y: e.clientY };
      }

      timerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {
            // Ignora se non permesso
          }
        }
        onLongPress();
      }, delay);
    },
    [onLongPress, delay]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleMove = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (!startPosRef.current || !timerRef.current) return;
      let currentX = 0;
      let currentY = 0;
      if ('touches' in e && e.touches.length > 0) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        currentX = e.clientX;
        currentY = e.clientY;
      }
      const dx = Math.abs(currentX - startPosRef.current.x);
      const dy = Math.abs(currentY - startPosRef.current.y);
      // Se l'utente si è spostato di oltre 10px (sta scrollando), annulla il long press
      if (dx > 10 || dy > 10) {
        cancel();
      }
    },
    [cancel]
  );

  const end = useCallback(() => {
    cancel();
  }, [cancel]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isLongPressRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isLongPressRef.current = false;
        return;
      }
      if (onClick) {
        onClick();
      }
    },
    [onClick]
  );

  return {
    onTouchStart: start,
    onTouchEnd: end,
    onTouchMove: handleMove,
    onMouseDown: start,
    onMouseUp: end,
    onMouseLeave: cancel,
    onClick: handleClick,
  };
}

export default useLongPress;
