// src/components/shared/feedback/PageErrorState.tsx
import React from 'react';

interface PageErrorStateProps {
  /** Titolo dell'errore (default: "Ops! Qualcosa è andato storto.") */
  title?: string;
  /** Frase specifica della pagina */
  message: string;
  /** Callback per il pulsante "Ricarica Dati" — se omesso, il pulsante non viene mostrato */
  onRetry?: () => void;
}

/**
 * Stato di errore condiviso per tutte le pagine.
 * Mostra icona, titolo, messaggio specifico e pulsante retry opzionale.
 */
const PageErrorState: React.FC<PageErrorStateProps> = ({
  title = 'Ops! Qualcosa è andato storto.',
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      {/* Icona */}
      <div className="text-4xl">
        ⚠️
      </div>

      {/* Titolo */}
      <h2 className="text-xl font-bold text-red-500">{title}</h2>

      {/* Messaggio specifico */}
      <p className="text-sm text-gray-500 text-center max-w-md">{message}</p>

      {/* Pulsante Retry */}
      {onRetry && (
        <div className="mt-2 p-1.5 bg-rose-50 border border-rose-200 rounded-2xl">
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2.5 text-sm font-bold text-red-700 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Ricarica Dati
          </button>
        </div>
      )}
    </div>
  );
};

export default PageErrorState;
