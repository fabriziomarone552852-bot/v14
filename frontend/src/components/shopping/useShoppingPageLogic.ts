// src/components/shopping/useShoppingPageLogic.ts
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';
import { makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import type { ConfigOption, ShoppingListSummary } from '@/types/shopping';

export const useShoppingPageLogic = () => {
  const queryClient = useQueryClient();
  const mutations = useShoppingMutations();

  // Modals state
  const quickPriceModal = useModal<null>();

  // Edit list modal state
  const editListModal = useModal<ShoppingListSummary>();
  const [listEditForm, setListEditForm] = useState<ListFormState>(() => makeEmptyForm(''));

  const {
    lists,
    groups,
    activeListId,
    setActiveListId,
    items,
    suppliers,
    brands,
    products,
    config,
    listsLoading,
    itemsLoading,
    isInitialLoading,
    isError,
    refreshLists,
    refreshGroups,
  } = useShoppingData();

  const [searchParams] = useSearchParams();
  const paramListId = searchParams.get('listId');

  useEffect(() => {
    if (paramListId) {
      const parsed = parseInt(paramListId, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setActiveListId(parsed);
      }
    }
  }, [paramListId, setActiveListId]);

  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = useMemo(() => config?.visibilityOptions ?? [], [config?.visibilityOptions]);
  const listStatusOptions = config?.listStatusOptions ?? [];

  const groupVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o: ConfigOption) => o.codeValue?.toLowerCase() === 'group' || o.codeName?.toLowerCase() === 'group'
    );
    return opt ? Number(opt.id) : 2;
  }, [listVisibilityOptions]);

  const privateVisibilityId = useMemo(() => {
    const opt = listVisibilityOptions.find(
      (o: ConfigOption) => o.codeValue?.toLowerCase() === 'private' || o.codeName?.toLowerCase() === 'private'
    );
    return opt ? Number(opt.id) : 1;
  }, [listVisibilityOptions]);

  const activeList = useMemo(() => {
    return lists.find((l) => l.id === activeListId) ?? null;
  }, [lists, activeListId]);

  const activeGroup = useMemo(() => {
    if (!activeList?.groupId) return null;
    return groups.find((g) => g.id === activeList.groupId) ?? null;
  }, [activeList, groups]);

  const activeUserRole = useMemo(() => {
    if (!activeList?.groupId) return 'owner';
    return activeGroup?.userRole || 'reader';
  }, [activeList, activeGroup]);

  const {
    isGroupCreateOpen,
    setIsGroupCreateOpen,
    editingGroup,
    setEditingGroup,
    detailGroup,
    setDetailGroup,
    activeInviteGroup,
    setActiveInviteGroup,
    groupMembersRefreshKey,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleArchiveGroup,
    handleUnarchiveGroup,
    handleInviteMembers,
  } = useShoppingGroupActions({ refreshGroups, refreshLists, queryClient });

  const handleOpenEditList = (list: ShoppingListSummary) => {
    setListEditForm({
      name: list.name,
      description: list.description ?? '',
      destinationValue: list.groupId ? String(list.groupId) : '',
    });
    editListModal.open(list);
  };

  const handleSaveEditList = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editListModal.data) return;
    const trimmedName = listEditForm.name.trim();
    if (!trimmedName) return;

    const isGroup = Boolean(listEditForm.destinationValue);
    const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
    const groupId = isGroup ? Number(listEditForm.destinationValue) : null;

    await mutations.updateList({
      id: editListModal.data.id,
      data: {
        name: trimmedName,
        description: listEditForm.description.trim() || undefined,
        groupId,
        visibilityId,
      },
    });

    editListModal.close();
  };

  const handleDeleteList = async (list: ShoppingListSummary) => {
    await mutations.deleteList(list.id);
    if (activeListId === list.id) {
      const remaining = lists.filter((l) => l.id !== list.id);
      setActiveListId(remaining[0]?.id ?? null);
    }
  };

  const handleToggleCompleteList = async (list: ShoppingListSummary, isCompleted: boolean) => {
    await mutations.updateList({
      id: list.id,
      data: { isCompleted },
    });
  };

  const handleCreateListInGroupModal = (groupId: number) => {
    setListEditForm(makeEmptyForm(String(groupId)));
    editListModal.open({
      id: 0,
      name: '',
      visibilityId: groupVisibilityId,
      groupId,
      openItemsCount: 0,
      purchasedItemsCount: 0,
      totalItemsCount: 0,
      isCompleted: false,
      canEdit: true,
      canDelete: true,
    });
  };

  const handleSaveModalListSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (editListModal.data?.id === 0) {
      e.preventDefault();
      const trimmedName = listEditForm.name.trim();
      if (!trimmedName) return;
      const isGroup = Boolean(listEditForm.destinationValue);
      const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
      const groupId = isGroup ? Number(listEditForm.destinationValue) : null;
      const newList = await mutations.createList({
        name: trimmedName,
        description: listEditForm.description.trim() || undefined,
        groupId,
        visibilityId,
        isCompleted: false,
      });
      if (newList?.id) {
        setActiveListId(newList.id);
      }
      editListModal.close();
    } else {
      await handleSaveEditList(e);
    }
  };

  return {
    queryClient,
    lists,
    groups,
    activeListId,
    setActiveListId,
    items,
    suppliers,
    brands,
    products,
    listsLoading,
    itemsLoading,
    isInitialLoading,
    isError,
    unitOptions,
    currencyOptions,
    offerFlagOptions,
    listVisibilityOptions,
    listStatusOptions,
    activeList,
    activeUserRole,
    quickPriceModal,
    editListModal,
    listEditForm,
    setListEditForm,
    isGroupCreateOpen,
    setIsGroupCreateOpen,
    editingGroup,
    setEditingGroup,
    detailGroup,
    setDetailGroup,
    activeInviteGroup,
    setActiveInviteGroup,
    groupMembersRefreshKey,
    handleCreateGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    handleArchiveGroup,
    handleUnarchiveGroup,
    handleInviteMembers,
    handleOpenEditList,
    handleDeleteList,
    handleToggleCompleteList,
    handleCreateListInGroupModal,
    handleSaveModalListSubmit,
  };
};
