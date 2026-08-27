import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createShoppingGroup,
  updateShoppingGroup,
  archiveShoppingGroup,
  unarchiveShoppingGroup,
  deleteShoppingGroup,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import type {
  ShoppingGroupCreatePayload,
  ShoppingGroupUpdatePayload,
} from '@/types/shopping';

export const useShoppingGroupMutations = () => {
  const queryClient = useQueryClient();

  const invalidateGroups = () =>
    queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.groups() });

  // 10. MUTAZIONI GRUPPI
  const createGroupMutation = useMutation({
    mutationFn: (payload: ShoppingGroupCreatePayload) => createShoppingGroup(payload),
    onSuccess: async () => invalidateGroups(),
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ShoppingGroupUpdatePayload }) => updateShoppingGroup(id, data),
    onSuccess: async () => invalidateGroups(),
  });

  const archiveGroupMutation = useMutation({
    mutationFn: (groupId: number) => archiveShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  const unarchiveGroupMutation = useMutation({
    mutationFn: (groupId: number) => unarchiveShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: number) => deleteShoppingGroup(groupId),
    onSuccess: async () => invalidateGroups(),
  });

  return {
    createGroup: (payload: ShoppingGroupCreatePayload) => createGroupMutation.mutateAsync(payload),
    updateGroup: (id: number, data: ShoppingGroupUpdatePayload) => updateGroupMutation.mutateAsync({ id, data }),
    archiveGroup: (groupId: number) => archiveGroupMutation.mutateAsync(groupId),
    unarchiveGroup: (groupId: number) => unarchiveGroupMutation.mutateAsync(groupId),
    deleteGroup: (groupId: number) => deleteGroupMutation.mutateAsync(groupId),
  };
};
