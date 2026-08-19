// src/views/ShoppingPage.tsx
import React, { useMemo, useState } from 'react';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import ShoppingGroupsColumn from '@/components/shared/shopping/ShoppingGroupsColumn';
import ShoppingListsColumn from '@/components/shared/shopping/ShoppingListsColumn';
import ShoppingItemsColumn from '@/components/shared/shopping/ShoppingItemsColumn';
import ShoppingBulkPurchasePanel from '@/components/shared/shopping/ShoppingBulkPurchasePanel';
import ShoppingSuppliersColumn from '@/components/shared/shopping/ShoppingSuppliersColumn';
import ShoppingGroupCreateModal from '@/components/shared/shopping/ShoppingGroupCreateModal';
import ShoppingGroupMembersModal from '@/components/shared/shopping/ShoppingGroupMembersModal';
import ShoppingGroupInviteModal from '@/components/shared/shopping/ShoppingGroupInviteModal';
import { createShoppingGroup, updateShoppingGroup, deleteShoppingGroup, inviteGroupMember, updateShoppingList } from '@/api/shoppingApi';
import { shoppingCardClass } from '@/components/shared/shopping/shoppingUi';
import type { ShoppingGroupSummary, ShoppingListSummary } from '@/types/shopping';

const ShoppingPage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [itemsViewMode, setItemsViewMode] = useState<'lista' | 'bulk'>('lista');

  // Modals state
  const [isGroupCreateOpen, setIsGroupCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ShoppingGroupSummary | null>(null);
  const [activeMembersGroup, setActiveMembersGroup] = useState<ShoppingGroupSummary | null>(null);
  const [activeInviteGroup, setActiveInviteGroup] = useState<ShoppingGroupSummary | null>(null);

  const {
    lists,
    groups,
    activeListId,
    setActiveListId,
    items,
    suppliers,
    config,
    listsLoading,
    itemsLoading,
    refreshLists,
    refreshGroups,
  } = useShoppingData();

  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = config?.visibilityOptions ?? [];
  const listStatusOptions = config?.listStatusOptions ?? [];
  const supplierStatusOptions = config?.supplierStatusOptions ?? [];

  const visibleLists = useMemo<ShoppingListSummary[]>(() => {
    if (selectedGroupId == null) {
      return lists;
    }
    return lists.filter((list) => list.groupId === selectedGroupId);
  }, [lists, selectedGroupId]);

  const activeList = useMemo(() => {
    return lists.find((l) => l.id === activeListId) ?? null;
  }, [lists, activeListId]);

  const activeGroup = useMemo(() => {
    const groupId = activeList?.groupId ?? selectedGroupId;
    if (!groupId) return null;
    return groups.find((g) => g.id === groupId) ?? null;
  }, [activeList, selectedGroupId, groups]);

  const activeUserRole = useMemo(() => {
    const groupId = activeList?.groupId ?? selectedGroupId;
    if (!groupId) return 'owner';
    return activeGroup?.userRole || 'reader';
  }, [activeList, selectedGroupId, activeGroup]);

  const handleSelectGroup = (groupId: number | null) => {
    setSelectedGroupId(groupId);
    const filtered = groupId == null ? lists : lists.filter((l) => l.groupId === groupId);
    setActiveListId(filtered[0]?.id ?? null);
  };

  const handleCreateGroup = async (data: { name: string; description?: string }) => {
    await createShoppingGroup(data);
    await Promise.all([refreshGroups(), refreshLists()]);
    setIsGroupCreateOpen(false);
  };

  const handleUpdateGroup = async (data: { name: string; description?: string }) => {
    if (!editingGroup) return;
    await updateShoppingGroup(editingGroup.id, data);
    await Promise.all([refreshGroups(), refreshLists()]);
    setEditingGroup(null);
  };

  const handleDeleteGroup = async (group: ShoppingGroupSummary) => {
    if (!window.confirm(`Sei sicuro di voler eliminare il gruppo spesa "${group.name}"?`)) {
      return;
    }
    await deleteShoppingGroup(group.id);
    if (selectedGroupId === group.id) {
      setSelectedGroupId(null);
    }
    await Promise.all([refreshGroups(), refreshLists()]);
  };

  const handleAssignListToGroup = async (listId: number, groupId: number | null) => {
    await updateShoppingList(listId, { groupId });
    await refreshLists();
  };

  const handleInviteMember = async (payload: { username?: string; email?: string; roleCode: string }) => {
    if (!activeInviteGroup) return;
    await inviteGroupMember(activeInviteGroup.id, payload);
    setActiveInviteGroup(null);
  };

  return (
    <div className="mx-auto flex min-h-full max-w-[1800px] flex-col gap-4 p-4 md:p-6 xl:h-full xl:overflow-hidden bg-slate-50">
      <div className="shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🛒 Gestione Shopping & Spesa</h1>
          <p className="text-sm text-gray-500">
            Liste spesa private e condivise, collaboratori di gruppo, fornitori e storico prezzi
          </p>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:min-h-0 xl:grid-cols-[280px_280px_minmax(0,1fr)_280px]">
        {/* Colonna Gruppi */}
        <div className={`${shoppingCardClass} flex h-full min-h-0 flex-col p-4`}>
          <ShoppingGroupsColumn
            groups={groups}
            loading={listsLoading}
            onSelectGroup={handleSelectGroup}
            selectedGroupId={selectedGroupId}
            onCreateGroup={() => setIsGroupCreateOpen(true)}
            onOpenMembers={(group) => setActiveMembersGroup(group)}
            onEditGroup={(group) => setEditingGroup(group)}
            onDeleteGroup={handleDeleteGroup}
            onInviteGroup={(group) => setActiveInviteGroup(group)}
          />
        </div>

        {/* Colonna Liste */}
        <div className={`${shoppingCardClass} flex h-full min-h-0 flex-col p-4`}>
          <ShoppingListsColumn
            lists={visibleLists}
            loadingLists={listsLoading}
            activeListId={activeListId}
            setActiveListId={(id) => setActiveListId(id)}
            groups={groups}
            listVisibilityOptions={listVisibilityOptions}
            listStatusOptions={listStatusOptions}
            onAssignGroup={handleAssignListToGroup}
          />
        </div>

        {/* Colonna Articoli & Acquisto Multiplo */}
        <div className={`${shoppingCardClass} flex h-full min-h-0 flex-col p-4`}>
          <div className="mb-3 shrink-0 flex items-center justify-end">
            <div className="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => setItemsViewMode('lista')}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  itemsViewMode === 'lista'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lista Articoli
              </button>
              <button
                type="button"
                onClick={() => setItemsViewMode('bulk')}
                className={`rounded-lg px-3 py-1.5 font-medium transition ${
                  itemsViewMode === 'bulk'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Acquisto Multiplo
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {itemsViewMode === 'lista' ? (
              <ShoppingItemsColumn
                items={items}
                suppliers={suppliers}
                loading={itemsLoading}
                activeListId={activeListId}
                activeList={activeList}
                unitOptions={unitOptions}
                currencyOptions={currencyOptions}
                offerFlagOptions={offerFlagOptions}
                searchQuery=""
                userRole={activeUserRole}
              />
            ) : (
              <ShoppingBulkPurchasePanel
                activeList={activeList}
                items={items.filter((i) => !i.isPurchased)}
                suppliers={suppliers}
                currencyOptions={currencyOptions}
                offerFlagOptions={offerFlagOptions}
              />
            )}
          </div>
        </div>

        {/* Colonna Fornitori */}
        <div className={`${shoppingCardClass} flex h-full min-h-0 flex-col p-4`}>
          <ShoppingSuppliersColumn
            suppliers={suppliers}
            supplierStatusOptions={supplierStatusOptions}
          />
        </div>
      </div>

      {/* Modale Creazione Gruppo */}
      <ShoppingGroupCreateModal
        isOpen={isGroupCreateOpen}
        onClose={() => setIsGroupCreateOpen(false)}
        onSubmit={handleCreateGroup}
      />

      {/* Modale Modifica Gruppo */}
      {editingGroup ? (
        <ShoppingGroupCreateModal
          isOpen={Boolean(editingGroup)}
          onClose={() => setEditingGroup(null)}
          onSubmit={handleUpdateGroup}
          initialData={editingGroup}
          title="✏️ Modifica Gruppo Spesa"
          submitLabel="Salva Modifiche"
        />
      ) : null}

      {/* Modale Membri Gruppo */}
      {activeMembersGroup ? (
        <ShoppingGroupMembersModal
          isOpen={Boolean(activeMembersGroup)}
          groupId={activeMembersGroup.id}
          groupName={activeMembersGroup.name}
          currentUserRole={activeMembersGroup.userRole || undefined}
          onClose={() => setActiveMembersGroup(null)}
          onOpenInvite={() => {
            const group = activeMembersGroup;
            setActiveMembersGroup(null);
            setActiveInviteGroup(group);
          }}
        />
      ) : null}

      {/* Modale Invito Collaboratori */}
      {activeInviteGroup ? (
        <ShoppingGroupInviteModal
          isOpen={Boolean(activeInviteGroup)}
          groupName={activeInviteGroup.name}
          currentUserRole={activeInviteGroup.userRole || undefined}
          onClose={() => setActiveInviteGroup(null)}
          onSubmit={handleInviteMember}
        />
      ) : null}
    </div>
  );
};

export default ShoppingPage;