// src/components/shared/feedback/PageLoadingState.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';

interface PageLoadingStateProps {
  /** Array di frasi a rotazione da mostrare sotto lo spinner */
  messages: string[];
  /** Intervallo in ms tra una frase e l'altra (default: 2500ms) */
  intervalMs?: number;
}

/**
 * Stato di caricamento condiviso per tutte le pagine.
 * Mostra un spinner centrale con una frase a rotazione che cambia con dissolvenza.
 */
const PageLoadingState: React.FC<PageLoadingStateProps> = ({ messages, intervalMs = 2500 }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const cycleMessage = useCallback(() => {
    // Fase 1: fade-out
    setIsVisible(false);

    // Fase 2: dopo la transizione, cambiamo il testo e fade-in
    const swapTimer = window.setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
      setIsVisible(true);
    }, 300); // 300ms per il fade-out

    return swapTimer;
  }, [messages.length]);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = window.setInterval(() => {
      cycleMessage();
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [cycleMessage, intervalMs, messages.length]);

  const currentMessage = messages[currentIndex] ?? '';

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      <LoadingIcon className="w-8 h-8 text-blue-500 animate-spin" />
      <p
        className={`text-sm font-medium text-gray-500 text-center max-w-sm transition-all duration-300 ease-in-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
        }`}
      >
        {currentMessage}
      </p>
    </div>
  );
};

export default PageLoadingState;
