// src/views/ShoppingPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';

import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';
import ShoppingGroupsAndListsColumn from '@/components/shared/shopping/ShoppingGroupsAndListsColumn';
import ShoppingItemsColumn from '@/components/shared/shopping/ShoppingItemsColumn';
import ShoppingGroupDetailModal from '@/components/shared/shopping/ShoppingGroupDetailModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingGroupInviteModal from '@/components/shared/shopping/ShoppingGroupInviteModal';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';

import type { ConfigOption, ShoppingListSummary } from '@/types/shopping';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import { ShoppingListModal, makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import ShoppingQuickPriceModal from '@/components/archive/shopping/ShoppingQuickPriceModal';

const ShoppingPage: React.FC = () => {
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

  if (isInitialLoading) {
    return <PageLoadingState messages={LOADING_MESSAGES.shopping} />;
  }

  if (isError) {
    return <PageErrorState message={ERROR_MESSAGES.shopping} onRetry={() => queryClient.refetchQueries()} />;
  }

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col min-h-0 relative pb-1">
      {/* Layout a 8 Colonne: 3/8 per Header + Gruppi & Liste, 5/8 per Prodotti (a tutta altezza) */}
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-4 flex-1 min-h-0 items-stretch">
        
        {/* Colonna Sinistra (3/8): Header compatto centrato + Gruppi & Liste Spesa */}
        <div className="xl:col-span-3 flex flex-col gap-3.5 h-[500px] xl:h-full min-h-0 min-w-0">
          {/* Header centrato nello spazio */}
          <div className="shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-3.5 text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingIcon className="w-5 h-5 text-blue-600" />
              <span>Shopping & Spesa</span>
            </h1>
          </div>

          {/* Box Gruppi & Liste */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1 min-h-0 min-w-0 flex flex-col justify-between relative overflow-hidden">
            <ShoppingGroupsAndListsColumn
              groups={groups}
              lists={lists}
              loadingGroups={listsLoading}
              loadingLists={listsLoading}
              activeListId={activeListId}
              setActiveListId={setActiveListId}
              listVisibilityOptions={listVisibilityOptions}
              listStatusOptions={listStatusOptions}
              onCreateGroup={() => setIsGroupCreateOpen(true)}
              onOpenGroupDetail={(group) => setDetailGroup(group)}
            />
          </div>
        </div>

        {/* Colonna Destra (5/8): Articoli e Prodotti Spesa (a tutta altezza!) */}
        <div className="xl:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[500px] xl:h-full min-h-0 min-w-0 flex flex-col overflow-hidden">
          <ShoppingItemsColumn
            items={items}
            suppliers={suppliers}
            brands={brands}
            products={products}
            loading={itemsLoading}
            activeListId={activeListId}
            activeList={activeList}
            unitOptions={unitOptions}
            currencyOptions={currencyOptions}
            offerFlagOptions={offerFlagOptions}
            searchQuery=""
            userRole={activeUserRole}
            onEditList={handleOpenEditList}
            onDeleteList={handleDeleteList}
            onToggleCompleteList={handleToggleCompleteList}
            onQuickPriceAdd={() => quickPriceModal.open(null)}
          />
        </div>
      </div>

      {/* Modale Dettaglio Gruppo con SidePanel */}
      {detailGroup && (
        <ShoppingGroupDetailModal
          isOpen={Boolean(detailGroup)}
          onClose={() => setDetailGroup(null)}
          group={detailGroup}
          lists={lists}
          onEditClick={(group) => setEditingGroup(group)}
          onDeleteClick={handleDeleteGroup}
          onArchiveClick={handleArchiveGroup}
          onUnarchiveClick={handleUnarchiveGroup}
          onOpenInvite={(group) => setActiveInviteGroup(group)}
          onSelectList={(listId) => setActiveListId(listId)}

          onCreateListInGroup={(groupId) => {
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
          }}
          currentUserRole={detailGroup.userRole || undefined}
          refreshKey={groupMembersRefreshKey}
        />
      )}

      {/* Modale Creazione Gruppo (con BaseModal e Inviti integrati) */}
      <ShoppingGroupCreateModal
        isOpen={isGroupCreateOpen}
        onClose={() => setIsGroupCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />

      {/* Modale Modifica Gruppo */}
      {editingGroup && (
        <ShoppingGroupCreateModal
          isOpen={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          onSubmit={handleUpdateGroup}
          initialData={editingGroup}
          title="Modifica Gruppo Spesa"
          submitLabel="Salva Modifiche"
        />
      )}

      {/* Modale Invito Collaboratori */}
      {activeInviteGroup && (
        <ShoppingGroupInviteModal
          isOpen={Boolean(activeInviteGroup)}
          groupName={activeInviteGroup.name}
          currentUserRole={activeInviteGroup.userRole || undefined}
          onClose={() => setActiveInviteGroup(null)}
          onSubmit={handleInviteMembers}
        />
      )}


      {/* Modale Modifica/Creazione Lista */}
      {editListModal.isOpen && editListModal.data && (
        <ShoppingListModal
          title={editListModal.data.id === 0 ? 'Nuova Lista nel Gruppo' : 'Modifica Lista Spesa'}
          form={listEditForm}
          setForm={setListEditForm}
          groups={groups}
          onClose={editListModal.close}
          onSubmit={async (e) => {
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
          }}
          submitLabel={editListModal.data.id === 0 ? 'Crea Lista' : 'Salva Modifiche'}
        />
      )}

      {/* Modale Aggiunta Rapida Prezzi */}
      <ShoppingQuickPriceModal
        isOpen={quickPriceModal.isOpen}
        onClose={quickPriceModal.close}
        products={products}
        brands={brands}
        suppliers={suppliers}
        unitOptions={unitOptions}
      />
    </div>
  );
};

export default ShoppingPage;