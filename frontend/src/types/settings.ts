// src/types/settings.ts

export type SettingsTabId = 'profile' | 'tasks' | 'memory' | 'danger';

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
