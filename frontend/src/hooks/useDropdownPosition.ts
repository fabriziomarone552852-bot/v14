import { useState, useEffect, useCallback, type RefObject } from 'react';

interface UseDropdownPositionOptions {
  threshold?: number;
  isOpen?: boolean;
}

export interface DropdownPositionCoords {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

export const useDropdownPosition = (
  triggerRef: RefObject<HTMLElement | null>,
  options: UseDropdownPositionOptions = {}
) => {
  const { threshold = 220, isOpen = false } = options;

  const [openUpwards, setOpenUpwards] = useState<boolean>(false);
  const [coords, setCoords] = useState<DropdownPositionCoords>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
  });

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      setOpenUpwards(spaceBelow < threshold);
      setCoords({
        top: rect.bottom,
        bottom: window.innerHeight - rect.top,
        left: rect.left,
        right: rect.right,
        width: rect.width,
      });
    }
  }, [triggerRef, threshold]);

  useEffect(() => {
    if (!isOpen) return;
    
    updatePosition();
    
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return { openUpwards, coords, updatePosition };
};
