// src/components/shared/shopping/group/useShoppingGroupDetailLogic.ts
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShoppingGroupSummary, ShoppingGroupMember, ShoppingListSummary } from '@/types/shopping';
import { fetchGroupMembers, updateGroupMemberRole, removeGroupMember, shoppingQueryKeys } from '@/api/shoppingApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface UseShoppingGroupDetailLogicProps {
  isOpen: boolean;
  group: ShoppingGroupSummary | null;
  lists?: ShoppingListSummary[];
  onDeleteClick?: (group: ShoppingGroupSummary) => void;
  onClose: () => void;
}

export type ListFilterStatus = 'all' | 'open' | 'completed';

export const useShoppingGroupDetailLogic = ({
  isOpen,
  group,
  lists = [],
  onDeleteClick,
  onClose,
}: UseShoppingGroupDetailLogicProps) => {
  const queryClient = useQueryClient();
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterListStatus, setFilterListStatus] = useState<ListFilterStatus>('all');

  const groupId = group?.id ?? 0;
  const membersQuery = useQuery<ShoppingGroupMember[]>({
    queryKey: shoppingQueryKeys.groupMembers(groupId),
    queryFn: () => (groupId ? fetchGroupMembers(groupId) : Promise.resolve([])),
    enabled: isOpen && Boolean(group?.id),
    staleTime: 5_000,
  });

  const members = membersQuery.data ?? [];
  const isLoadingMembers = membersQuery.isLoading;

  const groupLists = group ? lists.filter((l) => l.groupId === group.id) : [];

  const filteredGroupLists = groupLists.filter((l) => {
    if (filterListStatus === 'open') return !l.isCompleted;
    if (filterListStatus === 'completed') return l.isCompleted;
    return true;
  });

  const handleRoleChange = async (userId: number, newRoleCode: string) => {
    if (!group) return;
    setMemberError(null);
    queryClient.setQueriesData<ShoppingGroupMember[]>(
      { queryKey: shoppingQueryKeys.groupMembers(group.id) },
      (old) => (old || []).map((m) => (m.userId === userId ? { ...m, roleCode: newRoleCode } : m))
    );
    try {
      await updateGroupMemberRole(group.id, userId, newRoleCode);
    } catch (err: unknown) {
      setMemberError(extractErrorMessage(err, 'Errore nella modifica del ruolo.'));
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groupMembers(group.id) }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() }),
      ]);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!group) return;
    if (!window.confirm('Sei sicuro di voler rimuovere questo collaboratore dal gruppo?')) return;
    setMemberError(null);
    queryClient.setQueriesData<ShoppingGroupMember[]>(
      { queryKey: shoppingQueryKeys.groupMembers(group.id) },
      (old) => (old || []).filter((m) => m.userId !== userId)
    );
    try {
      await removeGroupMember(group.id, userId);
    } catch (err: unknown) {
      setMemberError(extractErrorMessage(err, 'Errore nella rimozione del membro.'));
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groupMembers(group.id) }),
        queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() }),
      ]);
    }
  };

  const handleDeleteConfirm = () => {
    if (group) {
      onDeleteClick?.(group);
    }
    setIsDeleteDialogOpen(false);
    onClose();
  };

  return {
    members,
    isLoadingMembers,
    memberError,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    filterListStatus,
    setFilterListStatus,
    groupLists,
    filteredGroupLists,
    handleRoleChange,
    handleRemoveMember,
    handleDeleteConfirm,
  };
};
