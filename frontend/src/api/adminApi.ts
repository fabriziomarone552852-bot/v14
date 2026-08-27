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
  deleted_at?: string | null;
  created_at?: string;
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
  payload: { username?: string; email?: string; is_superuser?: boolean }
): Promise<SystemUserItem> {
  const res = await apiClient.patch<SystemUserItem>(`/admin/users/${userId}`, payload);
  return res.data;
}

export async function resetSystemUserPassword(
  userId: number,
  newPassword: string
): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>(`/admin/users/${userId}/reset-password`, {
    new_password: newPassword,
  });
  return res.data;
}

export async function toggleSystemUserActive(userId: number): Promise<SystemUserItem> {
  const res = await apiClient.post<SystemUserItem>(`/admin/users/${userId}/toggle-active`);
  return res.data;
}
