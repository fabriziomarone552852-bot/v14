// src/views/NotFoundPage.tsx
import React from 'react';

/**
 * Pagina 404 — "Not Found"
 * Si monta dentro AppShellLayout, quindi la sidebar resta visibile.
 * Nessun pulsante di navigazione necessario.
 */
const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 select-none">
      {/* Badge 404 con gradiente */}
      <h1 className="text-8xl sm:text-9xl font-extrabold tracking-tighter bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
        404
      </h1>

      {/* Titolo */}
      <h2 className="text-2xl font-bold text-slate-800">Pagina non trovata</h2>

      {/* Sottotitolo */}
      <p className="text-sm text-slate-500 text-center max-w-md leading-relaxed">
        La pagina che stai cercando non è segnata in questa agenda,
        è stata spostata o si trova in un'altra dimensione.
      </p>
    </div>
  );
};

export default NotFoundPage;
