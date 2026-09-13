// src/mobile/components/modals/shopping/group/useMobileShoppingGroupDetailLogic.ts
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ShoppingGroupSummary, ShoppingGroupMember } from '@/types/shopping';
import { fetchGroupMembers, updateGroupMemberRole, removeGroupMember, shoppingQueryKeys } from '@/api/shoppingApi';
import { extractErrorMessage } from '@/utils/errorUtils';

export interface UseMobileShoppingGroupDetailLogicProps {
  isOpen: boolean;
  group: ShoppingGroupSummary | null;
  onDeleteClick?: (group: ShoppingGroupSummary) => void;
  onClose: () => void;
}

export function useMobileShoppingGroupDetailLogic({
  isOpen,
  group,
  onDeleteClick,
  onClose,
}: UseMobileShoppingGroupDetailLogicProps) {
  const queryClient = useQueryClient();
  const [memberError, setMemberError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [filterListStatus, setFilterListStatus] = useState<'all' | 'open' | 'completed'>('all');

  const groupId = group?.id ?? 0;
  const membersQuery = useQuery<ShoppingGroupMember[]>({
    queryKey: shoppingQueryKeys.groupMembers(groupId),
    queryFn: () => (groupId ? fetchGroupMembers(groupId) : Promise.resolve([])),
    enabled: isOpen && Boolean(group?.id),
    staleTime: 5_000,
  });

  const members = membersQuery.data ?? [];
  const isLoadingMembers = membersQuery.isLoading;

  const handleRoleChange = useCallback(
    async (userId: number, newRoleCode: string) => {
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
    },
    [group, queryClient]
  );

  const handleRemoveMember = useCallback(
    async (userId: number) => {
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
    },
    [group, queryClient]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!group) return;
    onDeleteClick?.(group);
    setIsDeleteDialogOpen(false);
    onClose();
  }, [group, onDeleteClick, onClose]);

  return {
    members,
    isLoadingMembers,
    memberError,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    filterListStatus,
    setFilterListStatus,
    handleRoleChange,
    handleRemoveMember,
    handleDeleteConfirm,
  };
}
