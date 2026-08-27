import { useState } from 'react';
import type { QueryClient } from '@tanstack/react-query';
import {
  createShoppingGroup,
  updateShoppingGroup,
  deleteShoppingGroup,
  archiveShoppingGroup,
  unarchiveShoppingGroup,
  inviteGroupMember,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import { extractErrorMessage } from '@/utils/errorUtils';
import { logger } from '@/utils/logger';
import type { PendingGroupInvite, ShoppingGroupSummary } from '@/types/shopping';

interface UseShoppingGroupActionsOptions {
  refreshGroups: () => Promise<void>;
  refreshLists: () => Promise<void>;
  queryClient: QueryClient;
}

export function useShoppingGroupActions({ refreshGroups, refreshLists, queryClient }: UseShoppingGroupActionsOptions) {
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ShoppingGroupSummary | null>(null);
  const [detailGroup, setDetailGroup] = useState<ShoppingGroupSummary | null>(null);
  const [activeInviteGroup, setActiveInviteGroup] = useState<ShoppingGroupSummary | null>(null);
  const [groupMembersRefreshKey, setGroupMembersRefreshKey] = useState(0);

  const handleCreateGroup = async (data: {
    name: string;
    description?: string;
    icon?: string;
    invites?: PendingGroupInvite[];
  }) => {
    const newGroup = await createShoppingGroup({
      name: data.name,
      description: data.description,
      icon: data.icon,
    });

    if (data.invites && data.invites.length > 0 && newGroup?.id) {
      for (const inv of data.invites) {
        try {
          await inviteGroupMember(newGroup.id, {
            username: inv.type === 'username' ? inv.value : undefined,
            email: inv.type === 'email' ? inv.value : undefined,
            roleCode: inv.roleCode,
          });
        } catch (err) {
          logger.error('Errore invio invito collaboratore:', err);
        }
      }
    }

    await Promise.all([refreshGroups(), refreshLists()]);
    setIsGroupCreateOpen(false);
  };

  const handleUpdateGroup = async (data: { name: string; description?: string; icon?: string }) => {
    if (!editingGroup) return;
    await updateShoppingGroup(editingGroup.id, data);
    await Promise.all([refreshGroups(), refreshLists()]);
    setEditingGroup(null);
    if (detailGroup && detailGroup.id === editingGroup.id) {
      setDetailGroup(null);
    }
  };

  const handleDeleteGroup = async (group: ShoppingGroupSummary) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il gruppo spesa "${group.name}"?`)) {
      return;
    }
    await deleteShoppingGroup(group.id);
    await Promise.all([refreshGroups(), refreshLists()]);
    if (detailGroup && detailGroup.id === group.id) {
      setDetailGroup(null);
    }
  };

  const handleArchiveGroup = async (group: ShoppingGroupSummary) => {
    try {
      await archiveShoppingGroup(group.id);
      await Promise.all([refreshGroups(), refreshLists()]);
      if (detailGroup && detailGroup.id === group.id) {
        setDetailGroup(null);
      }
    } catch (err) {
      logger.error('Errore archiviazione gruppo:', err);
    }
  };

  const handleUnarchiveGroup = async (group: ShoppingGroupSummary) => {
    try {
      await unarchiveShoppingGroup(group.id);
      await Promise.all([refreshGroups(), refreshLists()]);
      if (detailGroup && detailGroup.id === group.id) {
        setDetailGroup(null);
      }
    } catch (err) {
      logger.error('Errore ripristino gruppo:', err);
    }
  };

  const handleInviteMembers = async (invites: PendingGroupInvite[]) => {
    if (!activeInviteGroup) return;
    const errors: string[] = [];
    const groupId = activeInviteGroup.id;
    for (const inv of invites) {
      try {
        await inviteGroupMember(groupId, {
          username: inv.type === 'username' ? inv.value : undefined,
          email: inv.type === 'email' ? inv.value : undefined,
          roleCode: inv.roleCode,
        });
      } catch (err) {
        logger.error('Errore aggiunta membro:', err);
        errors.push(`${inv.value}: ${extractErrorMessage(err)}`);
      }
    }
    await Promise.all([
      refreshGroups(),
      refreshLists(),
      queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groupMembers(groupId) }),
      queryClient.refetchQueries({ queryKey: shoppingQueryKeys.groupMembers(groupId) }),
    ]);
    setGroupMembersRefreshKey((k) => k + 1);
    if (errors.length > 0) {
      throw new Error(errors.join(' | '));
    }
    setActiveInviteGroup(null);
  };

  return {
    isGroupCreateOpen,
    setIsGroupCreateOpen,
    editingGroup,
    setEditingGroup,
    detailGroup,
    setDetailGroup,
    activeInviteGroup,
    setActiveInviteGroup,
    groupMembersRefreshKey,
    setGroupMembersRefreshKey,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleArchiveGroup,
    handleUnarchiveGroup,
    handleInviteMembers,
  };
}
