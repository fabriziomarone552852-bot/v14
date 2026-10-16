// src/api/adminTasksApi.ts
import { apiClient } from './client';

export type TaskPriority = 'Alta' | 'Media' | 'Bassa';

export interface AdminTaskItem {
  id: number;
  user_id: number;
  username: string;
  titolo: string;
  descrizione?: string | null;
  data_start: string;
  data_scadenza?: string | null;
  priorita: TaskPriority;
  fatto: boolean;
  data_fatto?: string | null;
  luogo?: string | null;
  user_category_id?: number | null;
  category_name?: string | null;
  parent_id?: number | null;
}

export interface AdminTaskUpdatePayload {
  titolo?: string;
  descrizione?: string | null;
  data_start?: string;
  data_scadenza?: string | null;
  priorita?: TaskPriority;
  fatto?: boolean;
  luogo?: string | null;
  user_category_id?: number | null;
  user_id?: number;
}

export async function fetchAdminTasks(userId?: number): Promise<AdminTaskItem[]> {
  const res = await apiClient.get<AdminTaskItem[]>('/admin/tasks', {
    params: userId ? { user_id: userId } : undefined,
  });
  return res.data;
}

export async function updateAdminTask(
  taskId: number,
  payload: AdminTaskUpdatePayload
): Promise<AdminTaskItem> {
  const res = await apiClient.patch<AdminTaskItem>(`/admin/tasks/${taskId}`, payload);
  return res.data;
}

export async function deleteAdminTask(taskId: number): Promise<void> {
  await apiClient.delete(`/admin/tasks/${taskId}`);
}
