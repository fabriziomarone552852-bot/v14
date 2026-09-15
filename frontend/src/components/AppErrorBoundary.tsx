// src/components/AppErrorBoundary.tsx
import React from 'react';
import { recordTelemetryError } from '@/utils/telemetry';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isFeedbackOpen: boolean;
}

/**
 * Error Boundary React globale.
 * Cattura qualsiasi crash di rendering non gestito e mostra una schermata di recupero
 * invece della temuta "schermata bianca" (White Screen of Death).
 */
class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isFeedbackOpen: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[AppErrorBoundary] Errore React non gestito:', error, errorInfo);
    this.setState({ error, errorInfo });

    recordTelemetryError({
      type: 'react_crash',
      message: error.message,
      stack: error.stack,
      meta: {
        componentStack: errorInfo.componentStack,
      },
    });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'Errore imprevisto di rendering React';
      const diagnosticContext = {
        errorMessage: errorMsg,
        errorStack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
      };

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-8 text-center space-y-5">
            {/* Icona */}
            <div className="flex items-center justify-center w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 text-4xl shadow-xs">
              💥
            </div>

            {/* Titolo */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-black text-slate-900">
                Si è verificato un errore imprevisto
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Qualcosa nei circuiti ha fatto scintilla, ma niente paura: i tuoi dati sono al sicuro.
              </p>
            </div>

            {/* Dettaglio Errore compatto */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-2xl text-left">
              <div className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Dettaglio Errore</div>
              <div className="text-xs font-mono font-bold text-rose-800 break-words mt-0.5">
                {errorMsg}
              </div>
            </div>

            {/* Pulsanti Azione */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full px-5 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-colors shadow-md shadow-blue-500/20 cursor-pointer"
              >
                🔄 Riavvia Applicazione
              </button>

              <button
                type="button"
                onClick={() => this.setState({ isFeedbackOpen: true })}
                className="w-full px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer"
              >
                🚨 Invia Segnalazione all'Amministratore
              </button>
            </div>
          </div>

          <FeedbackModal
            isOpen={this.state.isFeedbackOpen}
            onClose={() => this.setState({ isFeedbackOpen: false })}
            initialType="bug"
            initialSeverity="critical"
            initialTitle={`Crash applicazione: ${errorMsg.slice(0, 60)}`}
            initialDescription={`Si è verificato un crash dell'applicazione mentre visualizzavo la pagina.\n\nMessaggio errore: ${errorMsg}`}
            initialErrorContext={diagnosticContext}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

