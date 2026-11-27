// src/services/pushNotificationsService.ts
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Channel } from '@capacitor/push-notifications';
import { api } from '@/api/apiService';
import { logger } from '@/utils/logger';
import type {
  PushPermissionState,
  PushPlatform,
  PushStatusResponse,
  PushTestResponse,
  PushTokenDevice,
} from '@/types/pushNotifications';

export const PUSH_TOKEN_STORAGE_KEY = 'vita_fcm_token';
export const PUSH_PROMPTED_STORAGE_KEY = 'vita_push_prompted';
export const PUSH_REGISTER_REQUEST_EVENT = 'vita-push-request-register';

const ANDROID_CHANNELS: Channel[] = [
  {
    id: 'vita_general',
    name: 'Notifiche Generali',
    description: 'Avvisi generali e test delle notifiche di Vita',
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: '#10B981',
  },
  {
    id: 'vita_shopping',
    name: 'Spesa e Gruppi',
    description: 'Nuove liste della spesa e inviti ai gruppi condivisi',
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: '#10B981',
  },
  {
    id: 'vita_social',
    name: 'Amici, Commenti e Messaggi',
    description: 'Richieste di amicizia, commenti, menzioni e messaggi effimeri',
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: '#3B82F6',
  },
  {
    id: 'vita_alerts',
    name: 'Avvisi di Sistema',
    description: 'Comunicazioni importanti e avvisi amministrativi di Vita',
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: '#F59E0B',
  },
];

export const isNativePushSupported = (): boolean => {
  return Capacitor.isNativePlatform() && (Capacitor.getPlatform() === 'android' || Capacitor.getPlatform() === 'ios');
};

export const getCurrentPushPlatform = (): PushPlatform => {
  const platform = Capacitor.getPlatform();
  if (platform === 'android' || platform === 'ios') return platform;
  return 'web';
};

export const getStoredPushToken = (): string | null => {
  try {
    return localStorage.getItem(PUSH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const setStoredPushToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Storage non disponibile
  }
};

export const getDeviceDisplayName = (): string => {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const androidMatch = ua.match(/Android\s+([\d.]+);\s*([^;)]+)/i);
  if (androidMatch) {
    return `${androidMatch[2].trim()} (Android ${androidMatch[1]})`.slice(0, 115);
  }
  return Capacitor.getPlatform() === 'android' ? 'Dispositivo Android' : 'Dispositivo Mobile';
};

export const ensureAndroidNotificationChannels = async (): Promise<void> => {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return;
  for (const channel of ANDROID_CHANNELS) {
    try {
      await PushNotifications.createChannel(channel);
    } catch (err) {
      logger.warn(`[Push] Impossibile creare canale Android ${channel.id}:`, err);
    }
  }
};

export const checkPushPermission = async (): Promise<PushPermissionState> => {
  if (!isNativePushSupported()) return 'unsupported';
  try {
    const status = await PushNotifications.checkPermissions();
    return status.receive;
  } catch (err) {
    logger.warn('[Push] Errore lettura permessi notifiche:', err);
    return 'unsupported';
  }
};

export const requestPushPermission = async (): Promise<PushPermissionState> => {
  if (!isNativePushSupported()) return 'unsupported';
  try {
    const status = await PushNotifications.requestPermissions();
    return status.receive;
  } catch (err) {
    logger.warn('[Push] Errore richiesta permessi notifiche:', err);
    return 'denied';
  }
};

export const triggerNativePushRegistration = async (): Promise<void> => {
  if (!isNativePushSupported()) return;
  await ensureAndroidNotificationChannels();
  await PushNotifications.register();
};

export const registerPushTokenOnServer = async (token: string): Promise<PushTokenDevice | null> => {
  const cleaned = token.trim();
  if (!cleaned) return null;
  setStoredPushToken(cleaned);
  return api.post<PushTokenDevice>('/interactions/push-tokens', {
    token: cleaned,
    platform: getCurrentPushPlatform(),
    device_name: getDeviceDisplayName(),
  });
};

export const unregisterStoredPushTokenFromServer = async (): Promise<void> => {
  const stored = getStoredPushToken();
  setStoredPushToken(null);
  if (!stored) return;
  try {
    await api.delete(`/interactions/push-tokens?token=${encodeURIComponent(stored)}`);
  } catch (err) {
    logger.warn('[Push] Errore deregistrazione token al logout:', err);
  }
};

export const fetchPushStatus = async (): Promise<PushStatusResponse> => {
  const res = await api.get<PushStatusResponse>('/interactions/push-tokens/status');
  return (
    res ?? {
      firebase_configured: false,
      registered_devices_count: 0,
      devices: [],
    }
  );
};

export const sendTestPushNotification = async (token?: string | null): Promise<PushTestResponse> => {
  const res = await api.post<PushTestResponse>('/interactions/push-tokens/test', {
    token: token || undefined,
  });
  if (!res) {
    throw new Error('Nessuna risposta dal server durante il test delle notifiche.');
  }
  return res;
};
