// src/types/settings.ts

export type SettingsTabId = 'profile' | 'tasks' | 'integrations' | 'memory' | 'danger';

export interface GoogleCalendarStatus {
  is_connected: boolean;
  google_email: string | null;
  sync_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserServerSettings {
  id: number;
  username: string;
  email: string;
  max_subtask_depth_user: number | null;
  is_superuser: boolean;
  must_change_password: boolean;
}

export interface UserSettingsFormState {
  email: string;
  maxDepth: number | '';
}

export interface UserSettingsUpdatePayload {
  email?: string;
  max_subtask_depth_user?: number | null;
  current_password?: string;
  new_password?: string;
  confirm_new_password?: string;
}

export interface MemoryDiagnostics {
  localStorageUsedKb: number;
  localStorageKeysCount: number;
  cachedHotDataCount: number;
  lastInspectionTime: string;
}
