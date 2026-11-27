// src/hooks/useAndroidPushNotifications.ts
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { PluginListenerHandle } from '@capacitor/core';
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications';
import { useAuth } from '@/context/AuthContext';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import { logger } from '@/utils/logger';
import {
  PUSH_PROMPTED_STORAGE_KEY,
  PUSH_REGISTER_REQUEST_EVENT,
  checkPushPermission,
  ensureAndroidNotificationChannels,
  isNativePushSupported,
  registerPushTokenOnServer,
  requestPushPermission,
  triggerNativePushRegistration,
} from '@/services/pushNotificationsService';
import type { AndroidPushDataPayload } from '@/types/pushNotifications';

export interface UseAndroidPushNotificationsOptions {
  onOpenNotificationsSheet?: (tab?: 'notifiche' | 'messaggi') => void;
}

const parsePushData = (raw: unknown): AndroidPushDataPayload => {
  if (!raw || typeof raw !== 'object') return {};
  const record = raw as Record<string, unknown>;
  const getStr = (key: string): string | undefined => {
    const val = record[key];
    return typeof val === 'string' && val.trim() ? val.trim() : undefined;
  };
  return {
    interaction_type: getStr('interaction_type'),
    interaction_id: getStr('interaction_id'),
    broadcast_id: getStr('broadcast_id'),
    route: getStr('route'),
    open_notifications_sheet: getStr('open_notifications_sheet'),
    notifications_tab: getStr('notifications_tab'),
    title: getStr('title'),
    body: getStr('body'),
    channel_id: getStr('channel_id'),
  };
};

/**
 * Inizializza e gestisce l'intero ciclo di vita delle notifiche push native su Android:
 * - Creazione canali Android (alta priorità + suono/vibrazione)
 * - Richiesta permesso su Android 13+ e registrazione token FCM sul backend
 * - Toast in-app non bloccante e refresh cache quando arriva una push in foreground
 * - Navigazione deep-link diretta al tap sulla notifica nella barra di stato Android
 */
export const useAndroidPushNotifications = (options?: UseAndroidPushNotificationsOptions): void => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onOpenSheetRef = useRef(options?.onOpenNotificationsSheet);
  onOpenSheetRef.current = options?.onOpenNotificationsSheet;

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !isNativePushSupported()) {
      return;
    }

    let isCancelled = false;
    const listenerHandles: PluginListenerHandle[] = [];

    const syncPermissionsAndRegister = async (forcePrompt: boolean): Promise<void> => {
      try {
        await ensureAndroidNotificationChannels();
        let perm = await checkPushPermission();

        if (perm === 'prompt' || perm === 'prompt-with-rationale') {
          const alreadyPrompted = localStorage.getItem(PUSH_PROMPTED_STORAGE_KEY) === 'true';
          if (forcePrompt || !alreadyPrompted) {
            localStorage.setItem(PUSH_PROMPTED_STORAGE_KEY, 'true');
            perm = await requestPushPermission();
          }
        }

        if (!isCancelled && perm === 'granted') {
          await triggerNativePushRegistration();
        }
      } catch (err) {
        logger.warn('[Push] Errore fase registrazione notifiche:', err);
      }
    };

    const setupListeners = async (): Promise<void> => {
      try {
        const regHandle = await PushNotifications.addListener('registration', async (token: Token) => {
          if (isCancelled || !token?.value) return;
          try {
            await registerPushTokenOnServer(token.value);
            queryClient.invalidateQueries({ queryKey: ['push-notifications', 'status'] });
          } catch (err) {
            logger.warn('[Push] Salvataggio token FCM sul server fallito:', err);
          }
        });
        listenerHandles.push(regHandle);

        const errHandle = await PushNotifications.addListener('registrationError', (err: unknown) => {
          logger.warn('[Push] Errore registrazione FCM nativa:', err);
        });
        listenerHandles.push(errHandle);

        const recvHandle = await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            if (isCancelled) return;
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });

            const data = parsePushData(notification.data);
            const title = notification.title || data.title || 'Vita';
            const body = notification.body || data.body || 'Nuova notifica ricevuta';
            const toastText = title && body ? `${title} — ${body}` : title || body;
            showTrackerToast(toastText, 'info', 4000);
          }
        );
        listenerHandles.push(recvHandle);

        const actionHandle = await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (action: ActionPerformed) => {
            if (isCancelled) return;
            queryClient.invalidateQueries({ queryKey: ['interactions'] });
            queryClient.invalidateQueries({ queryKey: ['friends'] });

            const data = parsePushData(action.notification?.data);

            if (data.open_notifications_sheet === 'true') {
              const targetTab = data.notifications_tab === 'messaggi' ? 'messaggi' : 'notifiche';
              onOpenSheetRef.current?.(targetTab);
              return;
            }

            if (data.route && data.route.startsWith('/')) {
              navigateRef.current(data.route);
              return;
            }

            onOpenSheetRef.current?.('notifiche');
          }
        );
        listenerHandles.push(actionHandle);

        await syncPermissionsAndRegister(false);
      } catch (err) {
        logger.warn('[Push] Impossibile collegare i listener Capacitor Push:', err);
      }
    };

    const handleManualRegisterEvent = () => {
      void syncPermissionsAndRegister(true);
    };

    window.addEventListener(PUSH_REGISTER_REQUEST_EVENT, handleManualRegisterEvent);
    void setupListeners();

    return () => {
      isCancelled = true;
      window.removeEventListener(PUSH_REGISTER_REQUEST_EVENT, handleManualRegisterEvent);
      listenerHandles.forEach((handle) => {
        void handle.remove();
      });
    };
  }, [isAuthenticated, user?.id, queryClient]);
};
