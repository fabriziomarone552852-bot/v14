// src/types/settings.ts
import type { WeatherLocationPreference } from '@/types/weather';

export type SettingsTabId = 'profile' | 'preferences' | 'tasks' | 'integrations' | 'memory' | 'danger';

export interface UserModulePreferences {
  agenda?: boolean;
  shopping?: boolean;
  trackers?: boolean;
  weather?: WeatherLocationPreference;
  [key: string]: unknown;
}

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
  system_max_subtask_depth?: number;
  is_superuser: boolean;
  must_change_password: boolean;
  profile_picture_url: string | null;
  default_startup_page: string | null;
  module_preferences: UserModulePreferences | null;
}

export interface UserSettingsFormState {
  email: string;
  maxDepth: number | '';
  defaultStartupPage: string;
  modulePreferences: Record<string, boolean>;
}

export interface UserSettingsUpdatePayload {
  email?: string;
  max_subtask_depth_user?: number | null;
  current_password?: string;
  new_password?: string;
  confirm_new_password?: string;
  profile_picture_url?: string | null;
  default_startup_page?: string | null;
  module_preferences?: UserModulePreferences | null;
}

export interface MemoryDiagnostics {
  localStorageUsedKb: number;
  localStorageKeysCount: number;
  cachedHotDataCount: number;
  lastInspectionTime: string;
}
