// src/components/AppErrorBoundary.tsx
import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error Boundary React globale.
 * Cattura qualsiasi crash di rendering non gestito e mostra una schermata di recupero
 * invece della temuta "schermata bianca" (White Screen of Death).
 *
 * Deve essere un class component perché React non supporta
 * componentDidCatch / getDerivedStateFromError nei function components.
 */
class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log dell'errore per debugging (console in dev, eventualmente Sentry in prod)
    console.error('[AppErrorBoundary] Errore React non gestito:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            {/* Icona */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-4xl mb-5">
              💥
            </div>

            {/* Titolo */}
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Si è verificato un errore imprevisto
            </h1>

            {/* Messaggio */}
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Qualcosa nei circuiti ha fatto scintilla, ma niente paura: i tuoi dati sono al sicuro.
            </p>

            {/* Pulsante Riavvio */}
            <button
              type="button"
              onClick={this.handleReload}
              className="px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              🔄 Riavvia Applicazione
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
