// src/mobile/components/settings/MobilePushNotificationsCard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, BellOff, BellRing, CheckCircle2, AlertCircle, Loader2, Send, Smartphone } from 'lucide-react';
import {
  PUSH_REGISTER_REQUEST_EVENT,
  checkPushPermission,
  fetchPushStatus,
  getStoredPushToken,
  isNativePushSupported,
  requestPushPermission,
  sendTestPushNotification,
  triggerNativePushRegistration,
} from '@/services/pushNotificationsService';
import type { PushPermissionState, PushStatusResponse } from '@/types/pushNotifications';

interface LocalBanner {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const MobilePushNotificationsCard: React.FC = () => {
  const queryClient = useQueryClient();
  const isNative = isNativePushSupported();

  const [permission, setPermission] = useState<PushPermissionState>(isNative ? 'prompt' : 'unsupported');
  const [localToken, setLocalToken] = useState<string | null>(() => getStoredPushToken());
  const [isActivating, setIsActivating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [banner, setBanner] = useState<LocalBanner | null>(null);

  const { data: pushStatus, isLoading: isLoadingStatus } = useQuery<PushStatusResponse>({
    queryKey: ['push-notifications', 'status'],
    queryFn: fetchPushStatus,
    staleTime: 30_000,
  });

  const refreshPermissionAndToken = useCallback(async () => {
    const perm = await checkPushPermission();
    setPermission(perm);
    setLocalToken(getStoredPushToken());
  }, []);

  useEffect(() => {
    void refreshPermissionAndToken();
  }, [refreshPermissionAndToken]);

  const handleActivatePush = async () => {
    if (!isNative) return;
    setIsActivating(true);
    setBanner(null);
    try {
      const perm = await requestPushPermission();
      setPermission(perm);

      if (perm === 'granted') {
        await triggerNativePushRegistration();
        window.dispatchEvent(new Event(PUSH_REGISTER_REQUEST_EVENT));
        // Attende brevemente il callback nativo di registrazione FCM prima di aggiornare lo stato
        setTimeout(() => {
          setLocalToken(getStoredPushToken());
          void queryClient.invalidateQueries({ queryKey: ['push-notifications', 'status'] });
        }, 1200);
        setBanner({
          type: 'success',
          message: 'Notifiche push Android attivate su questo dispositivo!',
        });
      } else {
        setBanner({
          type: 'error',
          message: 'Permesso negato. Abilita le notifiche in Impostazioni Android → App → Vita → Notifiche.',
        });
      }
    } catch {
      setBanner({
        type: 'error',
        message: 'Impossibile attivare le notifiche push. Riprova tra qualche secondo.',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    setBanner(null);
    try {
      const res = await sendTestPushNotification(localToken);
      if (res.ok) {
        setBanner({
          type: 'success',
          message:
            'Notifica di test inviata! Se hai l\'app aperta vedrai un avviso in alto; per vederla nella barra di Android prova anche a ridurre l\'app a icona.',
        });
      } else {
        setBanner({
          type: 'error',
          message: res.detail || 'Invio test non riuscito.',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore durante l\'invio della notifica di test.';
      setBanner({ type: 'error', message: msg });
    } finally {
      setIsSendingTest(false);
    }
  };

  const devicesCount = pushStatus?.registered_devices_count ?? 0;
  const firebaseConfigured = pushStatus?.firebase_configured ?? true;
  const isReadyOnThisDevice = isNative && permission === 'granted' && (!!localToken || devicesCount > 0);

  const renderStatusBadge = () => {
    if (!isNative) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
          Browser Web
        </span>
      );
    }
    if (isReadyOnThisDevice) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
          Attive
        </span>
      );
    }
    if (permission === 'denied') {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
          Bloccate
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
        Da attivare
      </span>
    );
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xs space-y-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            {permission === 'denied' ? <BellOff className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Notifiche Push Android</h3>
            <p className="text-xs text-gray-500">
              Avvisi nella barra di stato per spesa, amicizie, commenti, messaggi e broadcast
            </p>
          </div>
        </div>
        {renderStatusBadge()}
      </div>

      {/* Riepilogo dispositivi registrati */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200/80 text-xs">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <Smartphone className="w-3.5 h-3.5 text-gray-500" />
          <span>Dispositivi collegati al tuo account</span>
        </div>
        <span className="font-extrabold text-gray-900">
          {isLoadingStatus ? '…' : devicesCount}
        </span>
      </div>

      {!firebaseConfigured && !isLoadingStatus && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Server push non ancora configurato con la chiave Firebase (`firebase-service-account.json`).</span>
        </div>
      )}

      {banner && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 animate-fadeIn ${
            banner.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span>{banner.message}</span>
        </div>
      )}

      {isNative ? (
        <div className="flex flex-col gap-2">
          {!isReadyOnThisDevice && (
            <button
              type="button"
              onClick={handleActivatePush}
              disabled={isActivating}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {isActivating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              <span>{isActivating ? 'Attivazione in corso...' : 'Attiva Notifiche Push'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSendTest}
            disabled={isSendingTest || (!isReadyOnThisDevice && devicesCount === 0)}
            className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 active:scale-[0.99] text-gray-800 font-bold text-xs rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            {isSendingTest ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <Send className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{isSendingTest ? 'Invio test...' : 'Invia Notifica di Test'}</span>
          </button>

          {permission === 'denied' && (
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Hai rifiutato il permesso in precedenza: per riattivarlo apri{' '}
              <span className="font-semibold text-gray-700">Impostazioni Android → App → Vita → Notifiche</span>.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            La registrazione nella barra di stato funziona sull&apos;app Android (APK).
            {devicesCount > 0 && ' Puoi comunque inviare una notifica di test verso il tuo smartphone Android da qui:'}
          </p>
          {devicesCount > 0 && (
            <button
              type="button"
              onClick={handleSendTest}
              disabled={isSendingTest}
              className="w-full py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isSendingTest ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              ) : (
                <Send className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isSendingTest ? 'Invio al telefono...' : 'Invia Notifica di Test al Telefono'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobilePushNotificationsCard;
