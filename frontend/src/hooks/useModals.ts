import { useState, useCallback, useRef, useEffect } from 'react';

export function useModal<T = unknown>(initialData: T | null = null) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(initialData);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // AGGIUNTA LA MAGIA QUI: modalData?: T | null
  const open = useCallback((modalData?: T | null) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (modalData !== undefined) {
      setData(modalData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setData(initialData), 300);
  }, [initialData]);

  return { isOpen, data, open, close };
}