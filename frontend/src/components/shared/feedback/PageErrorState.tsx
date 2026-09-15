// src/components/shared/feedback/PageErrorState.tsx
import React, { useState } from 'react';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

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
 * Mostra icona, titolo, messaggio specifico, pulsante retry e link per segnalazione.
 */
const PageErrorState: React.FC<PageErrorStateProps> = ({
  title = 'Ops! Qualcosa è andato storto.',
  message,
  onRetry,
}) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none p-4">
      {/* Icona */}
      <div className="text-4xl">
        ⚠️
      </div>

      {/* Titolo */}
      <h2 className="text-xl font-bold text-red-500">{title}</h2>

      {/* Messaggio specifico */}
      <p className="text-sm text-gray-500 text-center max-w-md">{message}</p>

      {/* Pulsanti Azione */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-bold text-red-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            🔄 Ricarica Dati
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsFeedbackOpen(true)}
          className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>🛠️</span>
          <span>Segnala Errore</span>
        </button>
      </div>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialType="bug"
        initialSeverity="high"
        initialTitle={`Errore pagina: ${title}`}
        initialDescription={message}
      />
    </div>
  );
};

export default PageErrorState;

