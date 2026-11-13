// src/components/trackers/TrackerToast.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export type TrackerToastType = 'info' | 'success' | 'warning';

export interface TrackerToastPayload {
  message: string;
  type?: TrackerToastType;
  duration?: number;
}

type ToastListener = (payload: TrackerToastPayload) => void;
const listeners = new Set<ToastListener>();

/**
 * Funzione helper per lanciare un avviso temporaneo non bloccante.
 * Elimina la necessità di invocare window.alert() nei flussi di tracking.
 */
export const showTrackerToast = (message: string, type: TrackerToastType = 'info', duration: number = 2500) => {
  listeners.forEach((listener) => listener({ message, type, duration }));
};

export const TrackerToast: React.FC = () => {
  const [toast, setToast] = useState<TrackerToastPayload | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleShowToast = useCallback((payload: TrackerToastPayload) => {
    setToast(payload);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    listeners.add(handleShowToast);
    return () => {
      listeners.delete(handleShowToast);
    };
  }, [handleShowToast]);

  useEffect(() => {
    if (!isVisible || !toast) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, toast.duration || 2500);

    return () => clearTimeout(timer);
  }, [isVisible, toast]);

  if (!toast || !isVisible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-16 left-1/2 -translate-x-1/2 z-[10070] pointer-events-none transition-all duration-300 ease-out transform animate-fadeIn max-w-[90vw] sm:max-w-md"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gray-900/95 text-white text-xs sm:text-sm font-medium shadow-2xl backdrop-blur-md border border-white/10 select-none">
        {getIcon()}
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
};
