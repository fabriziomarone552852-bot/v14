import React, { useEffect, useState, useCallback } from 'react';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { TailscaleNative, openTailscaleAuthUrl, type TailscaleAuthUrlEvent, type TailscaleReadyEvent, type TailscaleErrorEvent, type TailscaleStatusEvent } from '@/utils/tailscale';
import { extractErrorMessage } from '@/utils/errorUtils';
import { Shield, ExternalLink, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';

interface TailscaleGateProps {
  children: React.ReactNode;
}

export const TailscaleGate: React.FC<TailscaleGateProps> = ({ children }) => {
  const isNative = Capacitor.isNativePlatform();

  const [isReady, setIsReady] = useState(!isNative);
  const [authUrl, setAuthUrl] = useState<string>('');
  const [statusText, setStatusText] = useState<string>('Inizializzazione Tailscale...');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!isNative) {
      setIsReady(true);
      return;
    }

    try {
      setIsChecking(true);
      const res = await TailscaleNative.getStatus();
      console.log('[TailscaleGate] Status update:', res);
      
      if (res.ready) {
        setIsReady(true);
        setAuthUrl('');
        setErrorMsg('');
      } else {
        setIsReady(false);
        if (res.authUrl) {
          setAuthUrl(res.authUrl);
        }
        if (res.status) {
          setStatusText(res.status);
        }
      }
    } catch (err: unknown) {
      console.error('[TailscaleGate] getStatus error:', err);
      setErrorMsg(extractErrorMessage(err) || 'Impossibile comunicare con il modulo nativo Tailscale');
    } finally {
      setIsChecking(false);
    }
  }, [isNative]);

  const handleStart = async () => {
    try {
      setErrorMsg('');
      setStatusText('Riavvio Tailscale in corso...');
      await TailscaleNative.start();
      await checkStatus();
    } catch (err: unknown) {
      setErrorMsg(extractErrorMessage(err) || 'Errore durante l\'avvio di Tailscale');
    }
  };

  useEffect(() => {
    if (!isNative) {
      setIsReady(true);
      return;
    }

    // 1. Initial check
    checkStatus();

    // 2. Event listeners
    const handleAuthUrl = (data: TailscaleAuthUrlEvent) => {
      console.log('[TailscaleGate] onAuthURL:', data.authUrl);
      setAuthUrl(data.authUrl);
      setIsReady(false);
      // Try to open automatically via Capacitor Browser
      if (data.authUrl) {
        openTailscaleAuthUrl(data.authUrl);
      }
    };

    const handleReady = (data: TailscaleReadyEvent) => {
      console.log('[TailscaleGate] onReady:', data);
      setIsReady(true);
      setAuthUrl('');
      setErrorMsg('');
    };

    const handleError = (data: TailscaleErrorEvent) => {
      console.log('[TailscaleGate] onError:', data.error);
      setErrorMsg(data.error);
    };

    const handleStatus = (data: TailscaleStatusEvent) => {
      console.log('[TailscaleGate] onStatus:', data.status);
      setStatusText(data.status);
    };

    const l1 = TailscaleNative.addListener('tailscale:auth-url', handleAuthUrl);
    const l2 = TailscaleNative.addListener('tailscale:ready', handleReady);
    const l3 = TailscaleNative.addListener('tailscale:error', handleError);
    const l4 = TailscaleNative.addListener('tailscale:status', handleStatus);

    // 3. Polling fallback every 2 seconds if not ready
    const interval = setInterval(() => {
      if (!isReady) {
        checkStatus();
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      l1?.then((h: PluginListenerHandle) => h?.remove?.());
      l2?.then((h: PluginListenerHandle) => h?.remove?.());
      l3?.then((h: PluginListenerHandle) => h?.remove?.());
      l4?.then((h: PluginListenerHandle) => h?.remove?.());
    };
  }, [isNative, isReady, checkStatus]);

  // If running on PC/Web or if Tailscale is ready, render the regular app
  if (!isNative || isReady) {
    return <>{children}</>;
  }

  const handleCopy = () => {
    if (authUrl) {
      navigator.clipboard?.writeText(authUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl flex flex-col items-center text-center">
        
        {/* Top Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5 text-indigo-400">
          <Shield className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-white mb-2">
          Smart Agenda Security
        </h1>

        {authUrl ? (
          /* AUTH REQUIRED SCREEN */
          <div className="w-full flex flex-col items-center mt-2">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-4 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Primo Accesso Richiesto
            </div>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Per connettere l'app al server NAS in modo sicuro, è necessario autenticarsi una sola volta con il tuo account Tailscale.
            </p>

            {/* Main Action Button: Open Auth in Browser */}
            <button
              onClick={() => openTailscaleAuthUrl(authUrl)}
              className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition font-semibold text-white rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mb-3"
            >
              <ExternalLink className="w-5 h-5" />
              Accedi con Tailscale
            </button>

            {/* Copy Link Button */}
            <button
              onClick={handleCopy}
              className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border border-slate-700/50 transition mb-6"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Link Copiato negli Appunti!' : 'Copia Link di Autenticazione'}
            </button>

            {/* Live Status indicator */}
            <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium">Stato Connessione:</span>
                <button
                  onClick={checkStatus}
                  disabled={isChecking}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  Verifica
                </button>
              </div>
              <p className="text-xs text-slate-300 font-mono truncate">
                {statusText || 'In attesa di autorizzazione nel browser...'}
              </p>
            </div>
          </div>
        ) : (
          /* CONNECTING / LOADING SCREEN */
          <div className="w-full flex flex-col items-center mt-2">
            <div className="my-6">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin" />
            </div>

            <p className="text-sm font-medium text-slate-200 mb-1">
              Connessione alla rete sicura in corso...
            </p>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              {statusText}
            </p>

            {errorMsg && (
              <div className="w-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-2xl p-3.5 mb-4 text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleStart}
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Riprova Connessione
            </button>
          </div>
        )}

      </div>

      <p className="text-[11px] text-slate-500 mt-6">
        Smart Agenda &bull; Crittografia End-to-End WireGuard
      </p>
    </div>
  );
};
