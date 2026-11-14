// src/api/broadcastApi.ts
import { api } from '@/api/apiService';
import type { SystemBroadcastResponse, SystemBroadcastCreate } from '@/types/broadcast';

export async function fetchActiveBroadcast(): Promise<SystemBroadcastResponse | null> {
  try {
    const res = await api.get<SystemBroadcastResponse | null>('/interactions/broadcast/active');
    return res || null;
  } catch {
    return null;
  }
}

export async function fetchAdminBroadcasts(): Promise<SystemBroadcastResponse[]> {
  const res = await api.get<SystemBroadcastResponse[]>('/admin/broadcasts');
  return Array.isArray(res) ? res : [];
}

export async function createAdminBroadcast(payload: SystemBroadcastCreate): Promise<SystemBroadcastResponse> {
  const res = await api.post<SystemBroadcastResponse>('/admin/broadcasts', payload);
  if (!res) throw new Error('Risposta vuota dal server');
  return res;
}

export async function deactivateAdminBroadcast(broadcastId: number): Promise<SystemBroadcastResponse> {
  const res = await api.post<SystemBroadcastResponse>(`/admin/broadcasts/${broadcastId}/deactivate`);
  if (!res) throw new Error('Risposta vuota dal server');
  return res;
}

export async function deleteAdminBroadcast(broadcastId: number): Promise<void> {
  await api.delete(`/admin/broadcasts/${broadcastId}`);
}
