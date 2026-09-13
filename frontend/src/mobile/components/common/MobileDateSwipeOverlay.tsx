// src/mobile/components/common/MobileDateSwipeOverlay.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { SwipeDirection } from '../../hooks/useMobileSwipeTransition';

export interface MobileDateSwipeOverlayProps {
  swipeDirection: SwipeDirection;
  onSwipePrev: () => void;
  onSwipeNext: () => void;
  showDesktopControls?: boolean;
}

export const MobileDateSwipeOverlay: React.FC<MobileDateSwipeOverlayProps> = ({
  swipeDirection,
  onSwipePrev,
  onSwipeNext,
  showDesktopControls = false,
}) => {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* ========================================================================= */}
      {/* 1. ONDA LUMINOSA BLU CHIARO A TUTTO SCHERMO                               */}
      {/* ========================================================================= */}
      {swipeDirection && (
        <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none">
          <div
            className={`absolute left-0 right-0 h-72 w-full flex flex-col justify-center items-center pointer-events-none ${
              swipeDirection === 'down' ? 'animate-wave-down' : 'animate-wave-up'
            }`}
          >
            {/* Bagliore diffuso / Gradiente Onda Blu Chiaro Neon */}
            <div className="w-full h-full bg-gradient-to-b from-transparent via-sky-400/20 via-cyan-300/35 to-transparent blur-sm" />
            
            {/* Strato interno più concentrato */}
            <div className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-300/40 via-sky-300/30 to-transparent blur-[1px]" />

            {/* Cresta luminosa centrale dell'onda */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-gradient-to-r from-transparent via-cyan-100 via-sky-200 to-transparent shadow-[0_0_30px_#38bdf8,0_0_60px_#0ea5e9]" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FRECCE TEMPORANEE DI TEST PER DESKTOP                                 */}
      {/* ========================================================================= */}
      {showDesktopControls && (
        <div
          className="fixed right-3.5 bottom-20 z-[99998] flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border border-sky-200/90 dark:border-sky-700/70 transition-all select-none"
          title="Frecce temporanee per testare il cambio di data su desktop"
        >
          {/* Pulsante Avanti (+1) - Freccia Verso l'Alto */}
          <button
            type="button"
            onClick={onSwipeNext}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/70 active:scale-90 transition-all cursor-pointer shadow-2xs group"
            title="Avanza (+1): Domani / Settimana / Mese / Anno succ. (Onda verso l'alto)"
            aria-label="Avanza data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 transition-transform group-hover:-translate-y-0.5"
            >
              <path
                fillRule="evenodd"
                d="M10 17a1 1 0 01-1-1V5.414L5.707 8.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L11 5.414V16a1 1 0 01-1 1z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <span className="text-[8px] font-bold text-sky-600 dark:text-sky-300 tracking-tight text-center leading-none uppercase">
            Test
          </span>

          {/* Pulsante Indietro (-1) - Freccia Verso il Basso */}
          <button
            type="button"
            onClick={onSwipePrev}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/70 active:scale-90 transition-all cursor-pointer shadow-2xs group"
            title="Indietro (-1): Ieri / Settimana / Mese / Anno prec. (Onda verso il basso)"
            aria-label="Indietro data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 transition-transform group-hover:translate-y-0.5"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v10.586l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 111.414-1.414L9 14.586V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </>,
    document.body
  );
};

export default MobileDateSwipeOverlay;
