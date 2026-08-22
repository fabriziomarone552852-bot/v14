// src/views/ShoppingPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';

import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import ShoppingGroupsAndListsColumn from '@/components/shared/shopping/ShoppingGroupsAndListsColumn';
import ShoppingItemsColumn from '@/components/shared/shopping/ShoppingItemsColumn';
import ShoppingGroupDetailModal from '@/components/shared/shopping/ShoppingGroupDetailModal';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingGroupInviteModal from '@/components/shared/shopping/ShoppingGroupInviteModal';
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

import type { ConfigOption, PendingGroupInvite, ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import { ShoppingListModal, makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';

const ShoppingPage: React.FC = () => {
  const queryClient = useQueryClient();
  const mutations = useShoppingMutations();

  // Modals state
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ShoppingGroupSummary | null>(null);
  const [detailGroup, setDetailGroup] = useState<ShoppingGroupSummary | null>(null);
  const [activeInviteGroup, setActiveInviteGroup] = useState<ShoppingGroupSummary | null>(null);

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
    products,
    config,
    listsLoading,
    itemsLoading,
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

  const [groupMembersRefreshKey, setGroupMembersRefreshKey] = useState(0);


  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = config?.visibilityOptions ?? [];
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
          console.error('Errore invio invito collaboratore:', err);
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
      console.error('Errore archiviazione gruppo:', err);
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
      console.error('Errore ripristino gruppo:', err);
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
        console.error('Errore aggiunta membro:', err);
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
    </div>
  );
};

export default ShoppingPage;