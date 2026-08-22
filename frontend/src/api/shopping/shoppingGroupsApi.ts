// src/api/shopping/shoppingGroupsApi.ts
import type {
  ShoppingGroupSummary,
  ShoppingGroupMember,
  ShoppingGroupMemberInvitePayload,
  ShoppingGroupCreatePayload,
  ShoppingGroupUpdatePayload,
} from '@/types/shopping';
import { apiRequest } from './shoppingClient';

export type ShoppingGroupApi = {
  id: number;
  name: string;
  description?: string | null;
  icon?: string | null;
  owner_id: number;
  status_id: number;
  user_role?: string | null;
  created_at: string;
  archived_at?: string | null;
  deleted_at?: string | null;
};

export type ShoppingGroupMemberApi = {
  id: number;
  group_id: number;
  user_id: number;
  username?: string | null;
  user_username?: string | null;
  email?: string | null;
  user_email?: string | null;
  role_id: number;
  role_code?: string | null;
  role_display_name?: string | null;
  created_at: string;
};

export function normalizeShoppingGroup(group: ShoppingGroupApi): ShoppingGroupSummary {
  return {
    id: Number(group.id),
    name: group.name,
    description: group.description ?? null,
    icon: group.icon ?? null,
    ownerId: Number(group.owner_id),
    statusId: Number(group.status_id),
    userRole: group.user_role ?? null,
    archivedAt: group.archived_at ?? null,
    isArchived: Boolean(group.archived_at),
  };
}

export function normalizeShoppingGroupMember(m: ShoppingGroupMemberApi): ShoppingGroupMember {
  const roleCode = m.role_code ?? 'reader';
  const defaultRoleDisplay =
    roleCode === 'owner'
      ? 'Proprietario'
      : roleCode === 'admin'
      ? 'Amministratore'
      : roleCode === 'editor'
      ? 'Editor'
      : 'Lettore';

  return {
    id: Number(m.id),
    groupId: Number(m.group_id),
    userId: Number(m.user_id),
    username: m.username ?? m.user_username ?? `Utente #${m.user_id}`,
    email: m.email ?? m.user_email ?? '',
    roleId: Number(m.role_id),
    roleCode: roleCode,
    roleDisplayName: m.role_display_name ?? defaultRoleDisplay,
    createdAt: m.created_at,
  };
}

export async function fetchShoppingGroups(
  signal?: AbortSignal
): Promise<ShoppingGroupSummary[]> {
  const data = await apiRequest<ShoppingGroupApi[]>('/groups', {
    method: 'GET',
    signal,
  });

  return (data ?? []).map(normalizeShoppingGroup);
}

export async function createShoppingGroup(
  payload: ShoppingGroupCreatePayload
): Promise<ShoppingGroupSummary> {
  const data = await apiRequest<ShoppingGroupApi>('/groups', {
    method: 'POST',
    body: {
      name: payload.name,
      description: payload.description,
      icon: payload.icon,
    },
  });
  return normalizeShoppingGroup(data);
}

export async function updateShoppingGroup(
  groupId: number,
  payload: ShoppingGroupUpdatePayload
): Promise<ShoppingGroupSummary> {
  const data = await apiRequest<ShoppingGroupApi>(`/groups/${groupId}`, {
    method: 'PATCH',
    body: payload,
  });
  return normalizeShoppingGroup(data);
}

export async function deleteShoppingGroup(groupId: number): Promise<void> {
  await apiRequest<void>(`/groups/${groupId}`, {
    method: 'DELETE',
  });
}

export async function archiveShoppingGroup(groupId: number): Promise<ShoppingGroupSummary> {
  const data = await apiRequest<ShoppingGroupApi>(`/groups/${groupId}/archive`, {
    method: 'POST',
  });
  return normalizeShoppingGroup(data);
}

export async function unarchiveShoppingGroup(groupId: number): Promise<ShoppingGroupSummary> {
  const data = await apiRequest<ShoppingGroupApi>(`/groups/${groupId}/unarchive`, {
    method: 'POST',
  });
  return normalizeShoppingGroup(data);
}

export async function fetchGroupMembers(
  groupId: number,
  signal?: AbortSignal
): Promise<ShoppingGroupMember[]> {
  const data = await apiRequest<ShoppingGroupMemberApi[]>(`/groups/${groupId}/members`, {
    method: 'GET',
    signal,
  });
  return (data ?? []).map(normalizeShoppingGroupMember);
}

export async function inviteGroupMember(
  groupId: number,
  payload: ShoppingGroupMemberInvitePayload
): Promise<ShoppingGroupMember> {
  const data = await apiRequest<ShoppingGroupMemberApi>(`/groups/${groupId}/invite`, {
    method: 'POST',
    body: {
      username: payload.username || undefined,
      email: payload.email || undefined,
      role_code: payload.roleCode,
    },
  });
  return normalizeShoppingGroupMember(data);
}

export async function updateGroupMemberRole(
  groupId: number,
  userId: number,
  roleCode: string
): Promise<ShoppingGroupMember> {
  const data = await apiRequest<ShoppingGroupMemberApi>(`/groups/${groupId}/members/${userId}`, {
    method: 'PATCH',
    body: { role_code: roleCode },
  });
  return normalizeShoppingGroupMember(data);
}

export async function removeGroupMember(groupId: number, userId: number): Promise<void> {
  await apiRequest<void>(`/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
  });
}
