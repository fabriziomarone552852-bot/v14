// src/mobile/hooks/useMobileShoppingLogic.ts
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Hooks Condivisi
import { useShoppingCoreListLogic } from '@/hooks/shopping/useShoppingCoreListLogic';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';
import { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';
import { useShoppingModals } from '@/context/ShoppingModalContext';
import { useMobileSelection } from '../context/MobileSelectionContext';

export const useMobileShoppingLogic = () => {
  const queryClient = useQueryClient();
  const core = useShoppingCoreListLogic();

  const {
    activeListId,
    activeList,
    items,
    currencyOptions,
    refreshGroups,
    refreshLists,
    mutations,
    quickPriceModal,
    handleOpenCreatePersonalList,
    handleOpenCreateGroupList,
    isCompleted,
  } = core;

  // 1. GESTIONE GRUPPI (Condiviso)
  const groupActions = useShoppingGroupActions({ refreshGroups, refreshLists, queryClient });

  // 2. GESTIONE ARTICOLI E COLONNA
  const columnLogic = useShoppingItemsColumn({
    items,
    currencyOptions,
    activeListId,
    activeList,
    searchQuery: '',
    initialFiltroStato: 'tutti',
  });

  // 3. STATI MODALI SPECIFICI PER MOBILE (Picker & OmniSearch)
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);
  const { registerHandlers, isOmniSearchOpen, setIsOmniSearchOpen } = useShoppingModals();

  useEffect(() => {
    registerHandlers({
      openOmniSearch: () => setIsOmniSearchOpen((prev) => !prev),
      openQuickPrice: () => quickPriceModal.open(null),
      openCreateItem: () => {
        if (activeListId) {
          columnLogic.handleOpenCreate();
        } else {
          setIsPickerModalOpen(true);
        }
      },
      openCreateList: (groupId) => {
        if (groupId) {
          handleOpenCreateGroupList(groupId);
        } else {
          handleOpenCreatePersonalList();
        }
      },
      openCreateGroup: () => groupActions.setIsGroupCreateOpen(true),
    });
  }, [
    registerHandlers,
    setIsOmniSearchOpen,
    activeListId,
    columnLogic.handleOpenCreate,
    handleOpenCreateGroupList,
    handleOpenCreatePersonalList,
    groupActions.setIsGroupCreateOpen,
    quickPriceModal,
  ]);

  // 4. GESTIONE SELEZIONE MULTIPLA ARTICOLI E SPOSTA/COPIA (Mobile Only)
  const {
    state: selectionState,
    isSelectionActive,
    startSelection,
    toggleItem,
    clearSelection,
    updateAllIds,
  } = useMobileSelection();

  const isShoppingItemsSelection = isSelectionActive && selectionState.activeSection === 'shopping-items';

  const [isMoveOrCopyModalOpen, setIsMoveOrCopyModalOpen] = useState(false);
  const [moveOrCopyAction, setMoveOrCopyAction] = useState<'move' | 'copy'>('move');

  const allItemIds = useMemo(() => {
    return columnLogic.filteredItems.map((item) => item.id);
  }, [columnLogic.filteredItems]);

  useEffect(() => {
    if (isShoppingItemsSelection) {
      updateAllIds(allItemIds);
    }
  }, [allItemIds, isShoppingItemsSelection, updateAllIds]);

  const handleDeleteSelectedShoppingItems = useCallback(
    async (ids: (number | string)[]) => {
      if (!ids || ids.length === 0) return;
      const numIds = ids.map(Number);
      const itemsToDelete = columnLogic.filteredItems.filter((item) => numIds.includes(item.id));
      await Promise.all(
        itemsToDelete.map((item) => mutations.deleteItem({ id: item.id, listId: item.shoppingListId }))
      );
      clearSelection();
    },
    [columnLogic.filteredItems, mutations, clearSelection]
  );

  const handleOpenMoveSelectedShoppingItems = useCallback(() => {
    setMoveOrCopyAction('move');
    setIsMoveOrCopyModalOpen(true);
  }, []);

  const handleOpenCopySelectedShoppingItems = useCallback(() => {
    setMoveOrCopyAction('copy');
    setIsMoveOrCopyModalOpen(true);
  }, []);

  const handleConfirmMoveOrCopyMobile = useCallback(
    async (targetListId: number) => {
      const selectedIds = selectionState.selectedIds.map(Number);
      if (!activeListId || selectedIds.length === 0) return;
      const itemsToProcess = items.filter((it) => selectedIds.includes(it.id));

      if (moveOrCopyAction === 'move') {
        await Promise.all(
          itemsToProcess.map((item) =>
            mutations.updateItem({
              id: item.id,
              listId: activeListId,
              data: { shoppingListId: targetListId },
            })
          )
        );
      } else {
        await Promise.all(
          itemsToProcess.map((item) =>
            mutations.createItem({
              shoppingListId: targetListId,
              productName: item.productName,
              brandId: item.brandId ?? undefined,
              brandName: item.brandName ?? undefined,
              unitId: item.unitId ?? undefined,
              quantity: item.quantity ?? 1,
              notes: item.notes ?? undefined,
            })
          )
        );
      }

      setIsMoveOrCopyModalOpen(false);
      clearSelection();
    },
    [activeListId, selectionState.selectedIds, items, moveOrCopyAction, mutations, clearSelection]
  );

  const handleToggleSelectShoppingItem = useCallback(
    (itemId: number) => {
      if (isShoppingItemsSelection) {
        toggleItem(itemId);
      } else {
        const onDeleteHandler = isCompleted ? null : handleDeleteSelectedShoppingItems;
        const onMoveHandler = isCompleted ? null : handleOpenMoveSelectedShoppingItems;
        const onCopyHandler = handleOpenCopySelectedShoppingItems;

        startSelection(
          'shopping-items',
          itemId,
          allItemIds,
          onDeleteHandler,
          null,
          onMoveHandler,
          onCopyHandler
        );
      }
    },
    [
      isShoppingItemsSelection,
      toggleItem,
      startSelection,
      allItemIds,
      isCompleted,
      handleDeleteSelectedShoppingItems,
      handleOpenMoveSelectedShoppingItems,
      handleOpenCopySelectedShoppingItems,
    ]
  );

  // Calcolo articoli divisi per stato (Da Comprare vs Nel Carrello)
  const openItems = useMemo(() => {
    return columnLogic.filteredItems.filter((item) => !item.isPurchased);
  }, [columnLogic.filteredItems]);

  const purchasedItems = useMemo(() => {
    return columnLogic.filteredItems.filter((item) => item.isPurchased);
  }, [columnLogic.filteredItems]);

  return {
    queryClient,
    ...core,

    // Logiche Colonna & Gruppi
    columnLogic,
    groupActions,

    // Modali & Viste Mobile
    isPickerModalOpen,
    setIsPickerModalOpen,
    isOmniSearchOpen,
    setIsOmniSearchOpen,
    openItems,
    purchasedItems,

    // Selezione & Sposta / Copia Mobile
    selectionState,
    isShoppingItemsSelection,
    clearSelection,
    handleToggleSelectShoppingItem,
    isMoveOrCopyModalOpen,
    setIsMoveOrCopyModalOpen,
    moveOrCopyAction,
    handleConfirmMoveOrCopyMobile,
  };
};
