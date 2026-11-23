// src/types/pushNotifications.ts
// Tipi TypeScript espliciti per il sistema di notifiche push Android (FCM + Capacitor)

export type PushPermissionState = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied' | 'unsupported';

export type PushPlatform = 'android' | 'ios' | 'web';

export interface PushTokenRegisterPayload {
  token: string;
  platform: PushPlatform;
  device_name?: string | null;
}

export interface PushTokenDevice {
  id: number;
  user_id: number;
  platform: PushPlatform;
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

export interface PushStatusResponse {
  firebase_configured: boolean;
  registered_devices_count: number;
  devices: PushTokenDevice[];
}

export interface PushTestRequest {
  token?: string | null;
  title?: string | null;
  body?: string | null;
}

export interface PushTestResponse {
  ok: boolean;
  firebase_configured: boolean;
  sent_count: number;
  failed_count: number;
  detail: string;
}

export interface AndroidPushDataPayload {
  interaction_type?: string;
  interaction_id?: string;
  broadcast_id?: string;
  route?: string;
  open_notifications_sheet?: string;
  notifications_tab?: 'notifiche' | 'messaggi' | string;
  title?: string;
  body?: string;
  channel_id?: string;
}
