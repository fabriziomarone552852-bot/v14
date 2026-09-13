// src/views/ShoppingPage.tsx
import React from 'react';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';
import { ShoppingIcon } from '@/components/shared/utils/Icons';
import ShoppingGroupsAndListsColumn from '@/components/shared/shopping/ShoppingGroupsAndListsColumn';
import ShoppingItemsColumn from '@/components/shared/shopping/ShoppingItemsColumn';
import { useShoppingPageLogic } from '@/components/shopping/useShoppingPageLogic';
import { ShoppingPageModals } from '@/components/shopping/ShoppingPageModals';

export const ShoppingPage: React.FC = () => {
  const logic = useShoppingPageLogic();

  if (logic.isInitialLoading) {
    return <PageLoadingState messages={LOADING_MESSAGES.shopping} />;
  }

  if (logic.isError) {
    return <PageErrorState message={ERROR_MESSAGES.shopping} onRetry={() => logic.queryClient.refetchQueries()} />;
  }

  return (
    <div className="mx-auto flex h-full max-w-[1600px] flex-col min-h-0 relative pb-1">
      {/* Layout a 8 Colonne: 3/8 per Header + Gruppi & Liste, 5/8 per Prodotti (a tutta altezza) */}
      <div className="grid grid-cols-1 xl:grid-cols-8 gap-4 flex-1 min-h-0 items-stretch">
        {/* Colonna Sinistra (3/8): Header compatto centrato + Gruppi & Liste Spesa */}
        <div className="xl:col-span-3 flex flex-col gap-3.5 h-[500px] xl:h-full min-h-0 min-w-0">
          <div className="shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-3.5 text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
              <ShoppingIcon className="w-5 h-5 text-blue-600" />
              <span>Shopping & Spesa</span>
            </h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-1 min-h-0 min-w-0 flex flex-col justify-between relative overflow-hidden">
            <ShoppingGroupsAndListsColumn
              groups={logic.groups}
              lists={logic.lists}
              loadingGroups={logic.listsLoading}
              loadingLists={logic.listsLoading}
              activeListId={logic.activeListId}
              setActiveListId={logic.setActiveListId}
              listVisibilityOptions={logic.listVisibilityOptions}
              listStatusOptions={logic.listStatusOptions}
              onCreateGroup={() => logic.setIsGroupCreateOpen(true)}
              onOpenGroupDetail={(group) => logic.setDetailGroup(group)}
            />
          </div>
        </div>

        {/* Colonna Destra (5/8): Articoli e Prodotti Spesa */}
        <div className="xl:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[500px] xl:h-full min-h-0 min-w-0 flex flex-col overflow-hidden">
          <ShoppingItemsColumn
            items={logic.items}
            suppliers={logic.suppliers}
            brands={logic.brands}
            products={logic.products}
            lists={logic.lists}
            loading={logic.itemsLoading}
            activeListId={logic.activeListId}
            activeList={logic.activeList}
            unitOptions={logic.unitOptions}
            currencyOptions={logic.currencyOptions}
            offerFlagOptions={logic.offerFlagOptions}
            searchQuery=""
            userRole={logic.activeUserRole}
            onEditList={logic.handleOpenEditList}
            onDeleteList={logic.handleDeleteList}
            onToggleCompleteList={logic.handleToggleCompleteList}
            onQuickPriceAdd={() => logic.quickPriceModal.open(null)}
          />
        </div>
      </div>

      {/* Modali Gestione Gruppi, Liste e Prezzi */}
      <ShoppingPageModals
        groups={logic.groups}
        lists={logic.lists}
        products={logic.products}
        brands={logic.brands}
        suppliers={logic.suppliers}
        unitOptions={logic.unitOptions}
        detailGroup={logic.detailGroup}
        setDetailGroup={logic.setDetailGroup}
        isGroupCreateOpen={logic.isGroupCreateOpen}
        setIsGroupCreateOpen={logic.setIsGroupCreateOpen}
        editingGroup={logic.editingGroup}
        setEditingGroup={logic.setEditingGroup}
        activeInviteGroup={logic.activeInviteGroup}
        setActiveInviteGroup={logic.setActiveInviteGroup}
        editListModal={logic.editListModal}
        listEditForm={logic.listEditForm}
        setListEditForm={logic.setListEditForm}
        quickPriceModal={logic.quickPriceModal}
        groupMembersRefreshKey={logic.groupMembersRefreshKey}
        handleCreateGroup={logic.handleCreateGroup}
        handleUpdateGroup={logic.handleUpdateGroup}
        handleDeleteGroup={logic.handleDeleteGroup}
        handleArchiveGroup={logic.handleArchiveGroup}
        handleUnarchiveGroup={logic.handleUnarchiveGroup}
        handleInviteMembers={logic.handleInviteMembers}
        setActiveListId={logic.setActiveListId}
        handleCreateListInGroupModal={logic.handleCreateListInGroupModal}
        handleSaveModalListSubmit={logic.handleSaveModalListSubmit}
      />
    </div>
  );
};

export default ShoppingPage;