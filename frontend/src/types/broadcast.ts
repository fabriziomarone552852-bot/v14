// src/types/broadcast.ts
// Definizione tipi per gli avvisi di sistema broadcast

export type BroadcastLevel = 'INFO' | 'WARNING' | 'CRITICAL';

export interface SystemBroadcastResponse {
  id: number;
  title: string;
  message: string;
  level: BroadcastLevel;
  show_popup: boolean;
  is_active: boolean;
  created_at: string;
  expires_at?: string | null;
  created_by_id?: number | null;
  created_by_name?: string | null;
}

export interface SystemBroadcastCreate {
  title: string;
  message: string;
  level: BroadcastLevel;
  show_popup: boolean;
  send_inbox: boolean;
  expires_at?: string | null;
}
