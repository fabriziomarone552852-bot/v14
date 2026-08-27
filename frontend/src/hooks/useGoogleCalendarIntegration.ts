import { useState, useEffect } from 'react';
import { api } from '@/api/apiService';
import type { GoogleCalendarStatus } from '@/types/settings';

export interface IntegrationMessage {
  type: 'success' | 'error';
  text: string;
}

export const useGoogleCalendarIntegration = () => {
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [toggling, setToggling] = useState<boolean>(false);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);

  const [message, setMessage] = useState<IntegrationMessage | null>(null);

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

  return {
    status,
    loading,
    connecting,
    toggling,
    syncingAll,
    disconnecting,
    message,
    handleConnect,
    handleToggleSync,
    handleSyncAll,
    handleDisconnect
  };
};
