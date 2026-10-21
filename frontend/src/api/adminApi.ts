// src/api/adminApi.ts
import { apiClient } from './client';

export interface SystemConfigItem {
  key: string;
  value: string;
  descrizione?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface SystemConfigCodeItem {
  id: number;
  code_type: string;
  code_value: string;
  code_name: string;
  display_name?: string | null;
  sort_order?: number | null;
  active: boolean;
  is_active?: boolean;
  description?: string | null;
  notes?: string | null;
}

export interface SystemUserItem {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  must_change_password: boolean;
  max_subtask_depth_user?: number | null;
  tasks_count: number;
  events_count: number;
  shopping_groups_count: number;
  deleted_at?: string | null;
  deleted_by_user_id?: number | null;
  deleted_by_username?: string | null;
  default_startup_page?: string | null;
  module_preferences?: Record<string, boolean> | null;
}

export interface OrphanedGroupMember {
  user_id: number;
  username: string;
  role_id: number;
}

export interface OrphanedGroupItem {
  id: number;
  name: string;
  owner_id: number;
  owner_username: string;
  owner_deleted_at?: string | null;
  members_count: number;
  members: OrphanedGroupMember[];
}

export interface SystemDiagnosticsData {
  db_status: string;
  db_dialect: string;
  db_latency_ms: number;
  users_total: number;
  users_active: number;
  users_deleted: number;
  system_max_subtask_depth: number;
  uploads_total_size_mb: number;
  uploads_files_count: number;
  server_time: string;
}

export async function fetchSystemConfigs(): Promise<SystemConfigItem[]> {
  const res = await apiClient.get<SystemConfigItem[]>('/catalogs/config');
  return res.data;
}

export async function updateSystemConfig(
  key: string,
  payload: { value: string; descrizione?: string }
): Promise<SystemConfigItem> {
  const res = await apiClient.patch<SystemConfigItem>(`/admin/catalogs/config/${key}`, payload);
  return res.data;
}

export async function fetchSystemCodes(codeType?: string): Promise<SystemConfigCodeItem[]> {
  const res = await apiClient.get<SystemConfigCodeItem[]>('/catalogs/codes', {
    params: codeType ? { code_type: codeType } : {},
  });
  return res.data;
}

export async function createSystemCode(payload: {
  code_type: string;
  code_value: string;
  code_name: string;
  description?: string;
  sort_order?: number;
  active?: boolean;
}): Promise<SystemConfigCodeItem> {
  const res = await apiClient.post<SystemConfigCodeItem>('/admin/catalogs/codes', {
    code_type: payload.code_type,
    code_value: payload.code_value,
    code_name: payload.code_name,
    description: payload.description,
    sort_order: payload.sort_order,
    active: payload.active ?? true,
  });
  return res.data;
}

export async function updateSystemCode(
  codeId: number,
  payload: {
    code_name?: string;
    description?: string;
    active?: boolean;
    sort_order?: number;
  }
): Promise<SystemConfigCodeItem> {
  const res = await apiClient.patch<SystemConfigCodeItem>(`/admin/catalogs/codes/${codeId}`, payload);
  return res.data;
}

export async function deactivateSystemCode(codeId: number): Promise<SystemConfigCodeItem> {
  const res = await apiClient.delete<SystemConfigCodeItem>(`/admin/catalogs/codes/${codeId}`);
  return res.data;
}

export async function pingAdmin(): Promise<{ message: string; timestamp: string }> {
  const res = await apiClient.get<{ message: string; timestamp: string }>('/admin/ping');
  return res.data;
}

export async function fetchSystemUsers(): Promise<SystemUserItem[]> {
  const res = await apiClient.get<SystemUserItem[]>('/admin/users');
  return res.data;
}

export async function updateSystemUser(
  userId: number,
  payload: {
    username?: string;
    email?: string;
    is_superuser?: boolean;
    max_subtask_depth_user?: number | null;
    must_change_password?: boolean;
    module_preferences?: Record<string, boolean>;
  }
): Promise<SystemUserItem> {
  const res = await apiClient.patch<SystemUserItem>(`/admin/users/${userId}`, payload);
  return res.data;
}

export async function resetSystemUserPassword(
  userId: number,
  newPassword: string,
  mustChangePassword = false
): Promise<{ message: string; must_change_password?: boolean }> {
  const res = await apiClient.post<{ message: string; must_change_password?: boolean }>(
    `/admin/users/${userId}/reset-password`,
    {
      new_password: newPassword,
      must_change_password: mustChangePassword,
    }
  );
  return res.data;
}

export async function toggleSystemUserActive(userId: number): Promise<SystemUserItem> {
  const res = await apiClient.post<SystemUserItem>(`/admin/users/${userId}/toggle-active`);
  return res.data;
}

export async function seedShoppingDataAdmin(): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>('/admin/seed-shopping-data');
  return res.data;
}

export interface DumpSeedsResult {
  status: string;
  message: string;
  data: {
    timestamp: string;
    counts: Record<string, number>;
    seeds_dir: string;
    snapshot_dir: string;
    zip_filename: string;
  };
}

export async function dumpSeedsAdmin(): Promise<DumpSeedsResult> {
  const res = await apiClient.post<DumpSeedsResult>('/admin/maintenance/dump-seeds');
  return res.data;
}

export async function downloadSeedsZipAdmin(): Promise<void> {
  const res = await apiClient.get('/admin/maintenance/download-seeds-zip', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `seeds_snapshot_${new Date().toISOString().slice(0, 10)}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export interface DatabaseBackupItem {
  filename: string;
  created_at: string;
  size_kb: number;
  total_records?: number | null;
  note?: string | null;
}

export interface DatabaseRestoreResult {
  status: string;
  message: string;
  restored_tables_count: number;
  total_restored_records: number;
  synced_sequences_count: number;
  restored_counts: Record<string, number>;
}

export async function fetchDatabaseBackupsAdmin(): Promise<DatabaseBackupItem[]> {
  const res = await apiClient.get<DatabaseBackupItem[]>('/admin/maintenance/database-backups');
  return res.data;
}

export async function createDatabaseBackupAdmin(note?: string): Promise<{
  status: string;
  message: string;
  data: {
    filename: string;
    path: string;
    created_at: string;
    size_kb: number;
    total_records: number;
    table_counts: Record<string, number>;
  };
}> {
  const res = await apiClient.post('/admin/maintenance/database-backup', { note });
  return res.data;
}

export async function deleteDatabaseBackupAdmin(filename: string): Promise<{ message: string }> {
  const res = await apiClient.delete(`/admin/maintenance/database-backups/${filename}`);
  return res.data;
}

export async function downloadDatabaseBackupAdmin(filename: string): Promise<void> {
  const res = await apiClient.get(`/admin/maintenance/database-backups/${filename}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function restoreDatabaseBackupAdmin(filename: string): Promise<DatabaseRestoreResult> {
  const res = await apiClient.post<DatabaseRestoreResult>('/admin/maintenance/database-restore', {
    filename,
  });
  return res.data;
}



export async function syncSequencesAdmin(): Promise<{
  status: string;
  message: string;
  synced_tables: string[];
}> {
  const res = await apiClient.post<{
    status: string;
    message: string;
    synced_tables: string[];
  }>('/admin/maintenance/sync-sequences');
  return res.data;
}

export async function fetchOrphanedGroupsAdmin(): Promise<OrphanedGroupItem[]> {
  const res = await apiClient.get<OrphanedGroupItem[]>('/admin/maintenance/orphaned-groups');
  return res.data;
}

export async function transferGroupOwnershipAdmin(
  groupId: number,
  newOwnerId: number
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(
    '/admin/maintenance/transfer-group-ownership',
    {
      group_id: groupId,
      new_owner_id: newOwnerId,
    }
  );
  return res.data;
}

export async function purgeDeletedUserAdmin(userId: number): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(
    `/admin/maintenance/purge-user/${userId}`
  );
  return res.data;
}

export async function fetchSystemDiagnosticsAdmin(): Promise<SystemDiagnosticsData> {
  const res = await apiClient.get<SystemDiagnosticsData>('/admin/health/diagnostics');
  return res.data;
}
