// src/mobile/hooks/useMobileShoppingLogic.ts
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

// Hooks Shopping
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useShoppingGroupActions } from '@/hooks/shopping/useShoppingGroupActions';
import { useShoppingItemsColumn } from '@/components/shared/shopping/useShoppingItemsColumn';
import { useShoppingModals } from '@/context/ShoppingModalContext';
import { useModal } from '@/hooks/useModals';
import { useMobileSelection } from '../context/MobileSelectionContext';

// Tipi & Form
import { makeEmptyForm, type ListFormState } from '@/components/shared/shopping/ShoppingListModal';
import type {
  ConfigOption,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingListItem,
} from '@/types/shopping';

export const useMobileShoppingLogic = () => {
  const queryClient = useQueryClient();
  const mutations = useShoppingMutations();

  // 1. DATA FETCHING PRINCIPALE
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
    isInitialLoading,
    isError,
    refreshLists,
    refreshGroups,
  } = useShoppingData();

  // Gestione query param ?listId=
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

  // Configurazioni & Opzioni
  const unitOptions = config?.unitOptions ?? [];
  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];
  const listVisibilityOptions = useMemo(() => config?.visibilityOptions ?? [], [config?.visibilityOptions]);

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

  const isCompleted = Boolean(activeList?.isCompleted);
  const isReader = Boolean(activeList?.groupId && activeUserRole === 'reader');

  const canCreateItem = !isCompleted && !isReader;
  const canEditItem = !isCompleted && !isReader;
  const canEditPurchasedItem = !isCompleted && !isReader;
  const canDeleteItem = !isCompleted && !isReader;

  // 2. HOOK GESTIONE ARTICOLI E MODALI ITEM
  const columnLogic = useShoppingItemsColumn({
    items,
    currencyOptions,
    activeListId,
    activeList,
    searchQuery: '',
    initialFiltroStato: 'tutti',
  });

  // 3. HOOK GESTIONE GRUPPI
  const groupActions = useShoppingGroupActions({ refreshGroups, refreshLists, queryClient });

  // 4. STATI MODALI LOCALI & PICKER
  const quickPriceModal = useModal<null>();
  const editListModal = useModal<ShoppingListSummary>();
  const [listEditForm, setListEditForm] = useState<ListFormState>(() => makeEmptyForm(''));
  const [isPickerModalOpen, setIsPickerModalOpen] = useState(false);

  // 5. REGISTRAZIONE HANDLERS PER MOBILEHEADER
  const { registerHandlers, isOmniSearchOpen, setIsOmniSearchOpen } = useShoppingModals();

  const handleOpenCreatePersonalList = useCallback(() => {
    setListEditForm(makeEmptyForm(''));
    editListModal.open({
      id: 0,
      name: '',
      visibilityId: privateVisibilityId,
      groupId: null,
      openItemsCount: 0,
      purchasedItemsCount: 0,
      totalItemsCount: 0,
      isCompleted: false,
      canEdit: true,
      canDelete: true,
    });
  }, [editListModal, privateVisibilityId]);

  const handleOpenCreateGroupList = useCallback(
    (groupId?: number) => {
      setListEditForm(makeEmptyForm(groupId ? String(groupId) : ''));
      editListModal.open({
        id: 0,
        name: '',
        visibilityId: groupId ? groupVisibilityId : privateVisibilityId,
        groupId: groupId ?? null,
        openItemsCount: 0,
        purchasedItemsCount: 0,
        totalItemsCount: 0,
        isCompleted: false,
        canEdit: true,
        canDelete: true,
      });
    },
    [editListModal, groupVisibilityId, privateVisibilityId]
  );

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

  // 6. GESTIONE SELEZIONE MULTIPLA ARTICOLI E SPOSTA/COPIA
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

  const handleOpenEditList = useCallback(
    (list: ShoppingListSummary) => {
      setListEditForm({
        name: list.name,
        description: list.description ?? '',
        destinationValue: list.groupId ? String(list.groupId) : '',
      });
      editListModal.open(list);
    },
    [editListModal]
  );

  const handleSaveEditList = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!editListModal.data) return;
      const trimmedName = listEditForm.name.trim();
      if (!trimmedName) return;

      const isGroup = Boolean(listEditForm.destinationValue);
      const visibilityId = isGroup ? groupVisibilityId : privateVisibilityId;
      const groupId = isGroup ? Number(listEditForm.destinationValue) : null;

      if (editListModal.data.id === 0) {
        const created = await mutations.createList({
          name: trimmedName,
          description: listEditForm.description.trim() || undefined,
          groupId,
          visibilityId,
          isCompleted: false,
        });
        if (created?.id) {
          setActiveListId(created.id);
        }
      } else {
        await mutations.updateList({
          id: editListModal.data.id,
          data: {
            name: trimmedName,
            description: listEditForm.description.trim() || undefined,
            groupId,
            visibilityId,
          },
        });
      }

      editListModal.close();
    },
    [editListModal, listEditForm, groupVisibilityId, privateVisibilityId, mutations, setActiveListId]
  );

  const handleDeleteList = useCallback(
    async (list: ShoppingListSummary) => {
      await mutations.deleteList(list.id);
      if (activeListId === list.id) {
        const remaining = lists.filter((l) => l.id !== list.id);
        setActiveListId(remaining[0]?.id ?? null);
      }
    },
    [activeListId, lists, mutations, setActiveListId]
  );

  const handleToggleCompleteList = useCallback(
    async (list: ShoppingListSummary, isCompleted: boolean) => {
      await mutations.updateList({
        id: list.id,
        data: { isCompleted },
      });
    },
    [mutations]
  );

  // Inserimento Rapido Catalogo Articoli (attivabile con Long-press su icona Spesa)
  const [isQuickCatalogOpen, setIsQuickCatalogOpen] = useState(false);

  const handleToggleQuickCatalog = useCallback(() => {
    setIsQuickCatalogOpen((prev) => {
      const next = !prev;
      if (next) {
        const defaultList =
          lists.find((l) => l.isDefault) ||
          lists.find((l) => l.name?.toLowerCase() === 'senza lista') ||
          lists[0];
        if (defaultList && activeListId !== defaultList.id) {
          setActiveListId(defaultList.id);
        }
      }
      return next;
    });
  }, [lists, activeListId, setActiveListId]);

  const handleToggleCatalogItem = useCallback(
    async (product: ShoppingProductOption, existingItem: ShoppingListItem | null) => {
      if (!activeListId) return;
      if (existingItem) {
        await mutations.deleteItem({ id: existingItem.id, listId: activeListId });
      } else {
        const displayName = (product.displayName || product.nameNormalized || '').trim();
        if (!displayName) return;
        await mutations.createItem({
          shoppingListId: activeListId,
          productName: displayName,
          brandId: product.brandId ?? undefined,
          brandName: product.brandName ?? undefined,
          unitId: product.defaultUnitId ?? undefined,
          quantity: 1,
        });
      }
    },
    [activeListId, mutations]
  );

  return {
    // Dati
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
    config,
    unitOptions,
    currencyOptions,
    offerFlagOptions,
    openItems,
    purchasedItems,
    isInitialLoading,
    isError,
    queryClient,
    mutations,

    // Inserimento Rapido Catalogo
    isQuickCatalogOpen,
    setIsQuickCatalogOpen,
    handleToggleQuickCatalog,
    handleToggleCatalogItem,

    // Permessi
    canCreateItem,
    canEditItem,
    canEditPurchasedItem,
    canDeleteItem,

    // Logiche
    columnLogic,
    groupActions,

    // Modali
    quickPriceModal,
    editListModal,
    listEditForm,
    setListEditForm,
    isPickerModalOpen,
    setIsPickerModalOpen,
    isOmniSearchOpen,
    setIsOmniSearchOpen,

    // Selezione & Sposta / Copia
    selectionState,
    isShoppingItemsSelection,
    clearSelection,
    handleToggleSelectShoppingItem,
    isMoveOrCopyModalOpen,
    setIsMoveOrCopyModalOpen,
    moveOrCopyAction,
    handleConfirmMoveOrCopyMobile,

    // Azioni Liste
    handleOpenEditList,
    handleSaveEditList,
    handleDeleteList,
    handleToggleCompleteList,
    handleOpenCreateGroupList,
  };
};
