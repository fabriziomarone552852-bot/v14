import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { App, type URLOpenListenerEvent } from '@capacitor/app';
import { api } from '@/api/apiService';
import { GoogleAuthNative } from '@/utils/googleAuthNative';
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

    // 1. Listener per Web Popup Desktop (postMessage)
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
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

    // 2. Listener per Mobile Deep Link (Fallback per Capacitor App appUrlOpen)
    let appUrlListenerHandle: { remove: () => void } | null = null;
    if (Capacitor.isNativePlatform()) {
      App.addListener('appUrlOpen', async (data: URLOpenListenerEvent) => {
        if (!data.url) return;
        if (
          data.url.includes('callback') ||
          data.url.includes('oauth2redirect') ||
          data.url.includes('code=')
        ) {
          try {
            await Browser.close().catch(() => {});

            // Parsing dei parametri code & state sia da schema https che custom
            const urlString = data.url.replace(/^com\.smartagenda\.app:\/?\/?/, 'http://localhost/');
            const parsed = new URL(urlString);
            const code = parsed.searchParams.get('code');
            const state = parsed.searchParams.get('state');
            const error = parsed.searchParams.get('error');

            if (error) {
              setMessage({ type: 'error', text: `Errore Google: ${error}` });
              return;
            }

            if (code) {
              setConnecting(true);
              const exchangeRes = await api.post<{ success: boolean; google_email?: string }>(
                '/google-calendar/exchange-code',
                {
                  code,
                  state,
                }
              );

              if (exchangeRes?.success) {
                setMessage({
                  type: 'success',
                  text: `Google Calendar collegato con successo all'account ${exchangeRes.google_email || ''}!`,
                });
                await fetchStatus();
              }
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Errore durante il collegamento a Google.';
            setMessage({ type: 'error', text: msg });
          } finally {
            setConnecting(false);
          }
        }
      }).then((handle) => {
        appUrlListenerHandle = handle;
      });
    }

    return () => {
      window.removeEventListener('message', handleAuthMessage);
      if (appUrlListenerHandle) {
        appUrlListenerHandle.remove();
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      setMessage(null);

      const isNative = Capacitor.isNativePlatform();

      const res = await api.get<{ url: string; client_id?: string }>('/google-calendar/auth-url');

      if (!res) {
        throw new Error('Impossibile ottenere i dettagli di autenticazione dal server.');
      }

      if (isNative) {
        // Accesso nativo tramite Google Play Services (senza browser né redirect_uri pubblici)
        const serverClientId = res.client_id || '948133104741-hsv9jk7ujtsavhq315m6j0oklcabu995.apps.googleusercontent.com';

        const authResult = await GoogleAuthNative.signIn({ serverClientId });
        if (!authResult?.serverAuthCode) {
          throw new Error('Codice di autorizzazione Google non ricevuto.');
        }

        const exchangeRes = await api.post<{ success: boolean; google_email?: string }>(
          '/google-calendar/exchange-code',
          {
            code: authResult.serverAuthCode,
            is_native: true,
          }
        );

        if (exchangeRes?.success) {
          setMessage({
            type: 'success',
            text: `Google Calendar collegato con successo all'account ${exchangeRes.google_email || authResult.email || ''}!`,
          });
          await fetchStatus();
        }
      } else {
        if (!res.url) {
          throw new Error('URL di autorizzazione non disponibile.');
        }
        // Su desktop web: apertura popup centrato standard
        const width = 500;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        window.open(
          res.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );
      }
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

      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleAuthNative.signOut();
        } catch {
          // Ignora errori minori di signout nativo
        }
      }

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
