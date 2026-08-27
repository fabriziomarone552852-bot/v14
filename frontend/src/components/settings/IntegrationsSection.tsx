// src/components/settings/IntegrationsSection.tsx
import React, { useEffect, useState } from 'react';
import { api } from '@/api/apiService';
import { CalendarIcon, CheckCircleIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import type { GoogleCalendarStatus } from '@/types/settings';

export const IntegrationsSection: React.FC = () => {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.get<GoogleCalendarStatus>('/google-calendar/status');
      if (data) {
        setStatus(data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Impossibile verificare lo stato di Google Calendar.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Listener per i messaggi postMessage dal popup OAuth
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setMessage({
          type: 'success',
          text: `Google Calendar collegato con successo all'account ${event.data.email || ''}!`,
        });
        fetchStatus();
      } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
        setMessage({
          type: 'error',
          text: `Errore durante il collegamento a Google: ${event.data.error || 'Autenticazione non riuscita.'}`,
        });
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setMessage(null);
      const res = await api.get<{ url: string }>('/google-calendar/auth-url');
      if (!res?.url) {
        throw new Error('URL di autorizzazione non disponibile.');
      }

      // Apertura popup OAuth centrato
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      window.open(
        res.url,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante la richiesta di connessione.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setConnecting(false);
    }
  };

  const handleToggleSync = async () => {
    if (!status) return;
    try {
      setToggling(true);
      setMessage(null);
      const updated = await api.post<GoogleCalendarStatus>('/google-calendar/toggle-sync', {
        sync_enabled: !status.sync_enabled,
      });
      if (updated) {
        setStatus(updated);
        setMessage({
          type: 'success',
          text: updated.sync_enabled
            ? 'Sincronizzazione automatica attivata.'
            : 'Sincronizzazione automatica disattivata.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Impossibile aggiornare le impostazioni di sincronizzazione.' });
    } finally {
      setToggling(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      setMessage(null);
      const res = await api.post<{ message: string }>(
        '/google-calendar/sync'
      );
      if (res) {
        setMessage({ type: 'success', text: res.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Errore durante la sincronizzazione.' });
    } finally {
      setSyncingAll(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Sei sicuro di voler scollegare Google Calendar? I nuovi eventi non verranno più sincronizzati.')) {
      return;
    }

    try {
      setDisconnecting(true);
      setMessage(null);
      await api.post('/google-calendar/disconnect');
      setStatus({ is_connected: false, google_email: null, sync_enabled: false });
      setMessage({ type: 'success', text: 'Google Calendar scollegato con successo.' });
    } catch {
      setMessage({ type: 'error', text: 'Errore durante la disconnessione di Google Calendar.' });
    } finally {
      setDisconnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-500">
        <LoadingIcon className="w-5 h-5 animate-spin mr-2" />
        <span>Caricamento integrazioni...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Integrazioni Esterne</h2>
        <p className="mt-1 text-xs text-slate-500">
          Collega i tuoi account e servizi esterni per sincronizzare automaticamente i dati della tua agenda.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Card Google Calendar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Google Calendar</h3>
                {status?.is_connected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
                    <CheckCircleIcon className="w-3 h-3 text-emerald-600" />
                    Connesso
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                    Non collegato
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-xl">
                Sincronizza in tempo reale tutti gli eventi e appuntamenti creati nella tua Smart Agenda direttamente sul tuo calendario personale di Google.
              </p>
              {status?.is_connected && status.google_email && (
                <div className="mt-2 text-xs font-semibold text-slate-700">
                  Account collegato: <span className="text-blue-600">{status.google_email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            {status?.is_connected ? (
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition shadow-sm disabled:opacity-40"
              >
                {disconnecting ? 'Disconnessione...' : 'Scollega'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={connecting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-sm flex items-center gap-2 disabled:opacity-40"
              >
                {connecting ? (
                  <>
                    <LoadingIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Connessione...</span>
                  </>
                ) : (
                  <span>Connetti Google Calendar</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Opzioni avanzate se connesso */}
        {status?.is_connected && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Sincronizzazione automatica</div>
                <div className="text-[11px] text-slate-500">
                  Invia automaticamente a Google Calendar ogni evento appena creato, modificato o rimosso.
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleSync}
                disabled={toggling}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  status.sync_enabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    status.sync_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs font-bold text-slate-800">Sincronizzazione manuale massiva</div>
                <div className="text-[11px] text-slate-500">
                  Carica su Google Calendar tutti gli eventi già presenti nel tuo database locale.
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncAll}
                disabled={syncingAll}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition disabled:opacity-40"
              >
                {syncingAll ? 'Sincronizzazione in corso...' : 'Sincronizza tutti gli eventi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntegrationsSection;
