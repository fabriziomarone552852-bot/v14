// src/components/auth/AuthErrorAlert.tsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AuthErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
  /** Durata di permanenza in millisecondi (default 5000ms = 5 secondi) */
  durationMs?: number;
  title?: string;
}

export const AuthErrorAlert: React.FC<AuthErrorAlertProps> = ({
  error,
  onDismiss,
  durationMs = 5000,
  title = 'Accesso non riuscito',
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  const remainingMsRef = useRef<number>(durationMs);
  const lastTickRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Callback stabile per la chiusura
  const handleDismiss = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    onDismiss();
  }, [onDismiss]);

  // Al cambio di messaggio d'errore o durata, riavvia il timer a 5 secondi completi
  useEffect(() => {
    if (!error) {
      setProgress(100);
      remainingMsRef.current = durationMs;
      return;
    }

    remainingMsRef.current = durationMs;
    setProgress(100);
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      if (!isPaused) {
        const delta = now - lastTickRef.current;
        remainingMsRef.current = Math.max(0, remainingMsRef.current - delta);
        const nextPercent = (remainingMsRef.current / durationMs) * 100;
        setProgress(nextPercent);

        if (remainingMsRef.current <= 0) {
          handleDismiss();
          return;
        }
      }
      lastTickRef.current = now;
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [error, durationMs, isPaused, handleDismiss]);

  if (!error) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        lastTickRef.current = performance.now();
        setIsPaused(false);
      }}
      className="relative overflow-hidden rounded-xl border border-rose-500/50 bg-rose-950/85 backdrop-blur-md p-4 text-rose-100 shadow-xl shadow-rose-950/30 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
    >
      <div className="flex items-start gap-3">
        {/* Icona Errore */}
        <div className="mt-0.5 shrink-0 text-rose-400">
          <AlertCircle className="h-5 w-5" />
        </div>

        {/* Testo Errore */}
        <div className="flex-1 pr-1">
          <h4 className="text-sm font-semibold tracking-wide text-rose-200">
            {title}
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-rose-100/90 font-medium">
            {error}
          </p>
        </div>

        {/* Pulsante Chiusura Immediata */}
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-rose-400 hover:text-white hover:bg-rose-900/60 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/40 cursor-pointer"
          title="Chiudi avviso"
          aria-label="Chiudi avviso di errore"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Barra di avanzamento temporale (Countdown 5 secondi fluido) */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-900/40">
        <div
          className="h-full bg-rose-500/80 transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default AuthErrorAlert;
