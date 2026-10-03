// src/mobile/views/MobileShoppingView.tsx
import React from 'react';
import { useMobileShoppingLogic } from '../hooks/useMobileShoppingLogic';
import MobileShoppingListSelector from '../components/shopping/MobileShoppingListSelector';
import { MobileShoppingActiveListCard } from '../components/shopping/MobileShoppingActiveListCard';
import { MobileShoppingQuickCatalog } from '../components/shopping/MobileShoppingQuickCatalog';
import { MobileShoppingModalsContainer } from '../components/shopping/MobileShoppingModalsContainer';
import PageLoadingState from '@/components/shared/feedback/PageLoadingState';
import PageErrorState from '@/components/shared/feedback/PageErrorState';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '@/data/loadingMessages';

export const MobileShoppingView: React.FC = () => {
  const {
    lists,
    groups,
    activeListId,
    setActiveListId,
    activeList,
    activeGroup,
    items,
    suppliers,
    brands,
    products,
    unitOptions,
    currencyOptions,
    offerFlagOptions,
    openItems,
    purchasedItems,
    isInitialLoading,
    isError,
    queryClient,
    mutations,
    isQuickCatalogOpen,
    setIsQuickCatalogOpen,
    handleToggleQuickCatalog,
    handleToggleCatalogItem,
    canCreateItem,
    canEditItem,
    canEditPurchasedItem,
    canDeleteItem,
    columnLogic,
    groupActions,
    quickPriceModal,
    editListModal,
    listEditForm,
    setListEditForm,
    isPickerModalOpen,
    setIsPickerModalOpen,
    isOmniSearchOpen,
    setIsOmniSearchOpen,
    selectionState,
    isShoppingItemsSelection,
    clearSelection,
    handleToggleSelectShoppingItem,
    isMoveOrCopyModalOpen,
    setIsMoveOrCopyModalOpen,
    moveOrCopyAction,
    handleConfirmMoveOrCopyMobile,
    handleOpenEditList,
    handleSaveEditList,
    handleDeleteList,
    handleToggleCompleteList,
    handleOpenCreateGroupList,
  } = useMobileShoppingLogic();

  if (isInitialLoading) {
    return <PageLoadingState messages={LOADING_MESSAGES.shopping} />;
  }

  if (isError) {
    return (
      <PageErrorState
        message={ERROR_MESSAGES.shopping}
        onRetry={() => queryClient.refetchQueries()}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col justify-between gap-2 overflow-hidden animate-fadeIn relative select-none">
      {/* 1. SELETTORE GRUPPO / LISTA FISSO (CON LONG PRESS SU ICONA) */}
      <MobileShoppingListSelector
        activeList={activeList}
        activeGroup={activeGroup}
        onOpenPicker={() => setIsPickerModalOpen(true)}
        onLongPressIcon={handleToggleQuickCatalog}
        onEditList={handleOpenEditList}
        onDeleteList={handleDeleteList}
        onToggleCompleteList={handleToggleCompleteList}
        onOpenGroupDetail={(group) => groupActions.setDetailGroup(group)}
      />

      {/* 2. CARD LISTA ATTIVA OPPURE INSERIMENTO RAPIDO CATALOGO */}
      {isQuickCatalogOpen ? (
        <MobileShoppingQuickCatalog
          products={products}
          items={items}
          activeList={activeList}
          unitOptions={unitOptions}
          onToggleItem={handleToggleCatalogItem}
          onClose={() => setIsQuickCatalogOpen(false)}
        />
      ) : (
        <MobileShoppingActiveListCard
          activeListId={activeListId}
          activeList={activeList}
          canCreateItem={canCreateItem}
          columnLogic={columnLogic}
          unitOptions={unitOptions}
          products={products}
          openItems={openItems}
          purchasedItems={purchasedItems}
          isShoppingItemsSelection={isShoppingItemsSelection}
          selectedIds={selectionState.selectedIds}
          onOpenPicker={() => setIsPickerModalOpen(true)}
          onOpenQuickPrice={() => quickPriceModal.open(null)}
          onToggleSelectShoppingItem={handleToggleSelectShoppingItem}
        />
      )}

      {/* 3. MODALI UNIFICATI */}
      <MobileShoppingModalsContainer
        isPickerModalOpen={isPickerModalOpen}
        setIsPickerModalOpen={setIsPickerModalOpen}
        clearSelection={clearSelection}
        lists={lists}
        groups={groups}
        activeListId={activeListId}
        setActiveListId={setActiveListId}
        groupActions={groupActions}
        handleOpenEditList={handleOpenEditList}
        handleDeleteList={handleDeleteList}
        handleToggleCompleteList={handleToggleCompleteList}
        handleOpenCreateGroupList={handleOpenCreateGroupList}
        isOmniSearchOpen={isOmniSearchOpen}
        setIsOmniSearchOpen={setIsOmniSearchOpen}
        products={products}
        items={items}
        mutations={mutations}
        quickPriceModal={quickPriceModal}
        brands={brands}
        suppliers={suppliers}
        unitOptions={unitOptions}
        currencyOptions={currencyOptions}
        offerFlagOptions={offerFlagOptions}
        columnLogic={columnLogic}
        canEditItem={canEditItem}
        canEditPurchasedItem={canEditPurchasedItem}
        canDeleteItem={canDeleteItem}
        editListModal={editListModal}
        listEditForm={listEditForm}
        setListEditForm={setListEditForm}
        handleSaveEditList={handleSaveEditList}
        isMoveOrCopyModalOpen={isMoveOrCopyModalOpen}
        setIsMoveOrCopyModalOpen={setIsMoveOrCopyModalOpen}
        moveOrCopyAction={moveOrCopyAction}
        selectedItemCount={selectionState.selectedIds.length}
        handleConfirmMoveOrCopy={handleConfirmMoveOrCopyMobile}
      />
    </div>
  );
};

export default MobileShoppingView;
