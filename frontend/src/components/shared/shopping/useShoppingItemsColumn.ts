// src/components/shared/shopping/useShoppingItemsColumn.ts
import { useState, useMemo } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import type { FiltroStato } from './ShoppingActiveListHeader';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
} from '@/types/shopping';
import {
  emptyItemForm,
  getEurCurrencyId,
  type ItemFormState,
} from './shoppingItems.utils';
import { useShoppingItemsFilter } from './useShoppingItemsFilter';
import { useShoppingItemsPurchase } from './useShoppingItemsPurchase';

export interface UseShoppingItemsColumnProps {
  items: ShoppingListItem[];
  currencyOptions: ConfigOption[];
  activeListId: number | null;
  activeList?: ShoppingListSummary | null;
  searchQuery: string;
  initialFiltroStato?: FiltroStato;
}

export function useShoppingItemsColumn({
  items,
  currencyOptions,
  activeListId,
  activeList: _activeList,
  searchQuery,
  initialFiltroStato = 'aperti',
}: UseShoppingItemsColumnProps) {
  const mutations = useShoppingMutations();

  // 1. Modali Generiche & Create/Edit Form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const editModal = useModal<ShoppingListItem>();
  const detailModal = useModal<ShoppingListItem>();
  const [historyModalItem, setHistoryModalItem] = useState<ShoppingListItem | null>(null);

  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm());
  const [editForm, setEditForm] = useState<ItemFormState>(emptyItemForm());

  const eurCurrencyId = useMemo(
    () => getEurCurrencyId(currencyOptions),
    [currencyOptions]
  );

  // 2. Filtri, Ricerca e Quick Add
  const filterLogic = useShoppingItemsFilter({
    items,
    activeListId,
    searchQuery,
    initialFiltroStato,
  });

  // 3. Acquisti e Gestione Lotti
  const purchaseLogic = useShoppingItemsPurchase({
    activeListId,
    eurCurrencyId,
    mutations,
  });

  // 4. Form Creazione / Modifica
  const buildCreateForm = (): ItemFormState => {
    const form = emptyItemForm();
    if (activeListId != null) {
      form.shoppingListId = String(activeListId);
    }
    return form;
  };

  const handleOpenCreate = () => {
    setItemForm(buildCreateForm());
    setIsCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setItemForm(buildCreateForm());
    setIsCreateOpen(false);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!itemForm.productName.trim() || !itemForm.shoppingListId) return;

    await mutations.createItem({
      shoppingListId: Number(itemForm.shoppingListId),
      productName: itemForm.productName.trim(),
      brandName: itemForm.brandName.trim() || undefined,
      brandId: itemForm.brandId ? Number(itemForm.brandId) : undefined,
      quantity: itemForm.quantity ? Number(itemForm.quantity) : undefined,
      unitId: itemForm.unitId ? Number(itemForm.unitId) : undefined,
      notes: itemForm.notes?.trim() || undefined,
    });
    handleCloseCreate();
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeListId || !filterLogic.quickName.trim() || filterLogic.quickAdding) return;
    filterLogic.setQuickAdding(true);
    try {
      await mutations.createItem({
        shoppingListId: activeListId,
        productName: filterLogic.quickName.trim(),
        quantity: filterLogic.quickQuantity ? Number(filterLogic.quickQuantity) : undefined,
        unitId: filterLogic.quickUnitId ? Number(filterLogic.quickUnitId) : undefined,
      });
      filterLogic.resetQuickAdd();
    } finally {
      filterLogic.setQuickAdding(false);
    }
  };

  const handleOpenEdit = (item: ShoppingListItem) => {
    setEditForm({
      shoppingListId: item.shoppingListId != null ? String(item.shoppingListId) : '',
      productName: item.productName ?? '',
      brandName: item.brandName ?? '',
      brandId: item.brandId != null ? String(item.brandId) : '',
      quantity: item.quantity != null ? String(item.quantity) : '',
      unitId: item.unitId != null ? String(item.unitId) : '',
      notes: item.notes ?? '',
    });
    editModal.open(item);
  };

  const handleCloseEdit = () => {
    setEditForm(emptyItemForm());
    editModal.close();
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editModal.data) return;
    await mutations.updateItem({
      id: editModal.data.id,
      listId: editModal.data.shoppingListId,
      data: {
        shoppingListId: editForm.shoppingListId ? Number(editForm.shoppingListId) : undefined,
        productName: editForm.productName.trim() || undefined,
        brandName: editForm.brandName.trim() || undefined,
        brandId: editForm.brandId ? Number(editForm.brandId) : undefined,
        quantity: editForm.quantity ? Number(editForm.quantity) : undefined,
        unitId: editForm.unitId ? Number(editForm.unitId) : undefined,
        notes: editForm.notes?.trim() || undefined,
      },
    });
    handleCloseEdit();
  };

  const handleDelete = async (item: ShoppingListItem) => {
    return mutations.deleteItem({ id: item.id, listId: item.shoppingListId });
  };

  return {
    isCreateOpen,
    setIsCreateOpen,
    editModal,
    detailModal,
    purchasedDetailModal: purchaseLogic.purchasedDetailModal,
    purchasedEditModal: purchaseLogic.purchasedEditModal,
    purchaseModal: purchaseLogic.purchaseModal,
    historyModalItem,
    setHistoryModalItem,
    filtroStato: filterLogic.filtroStato,
    setFiltroStato: filterLogic.setFiltroStato,
    filterQuery: filterLogic.filterQuery,
    setFilterQuery: filterLogic.setFilterQuery,
    itemForm,
    setItemForm,
    editForm,
    setEditForm,
    purchaseForm: purchaseLogic.purchaseForm,
    setPurchaseForm: purchaseLogic.setPurchaseForm,
    quickName: filterLogic.quickName,
    setQuickName: filterLogic.setQuickName,
    quickQuantity: filterLogic.quickQuantity,
    setQuickQuantity: filterLogic.setQuickQuantity,
    quickUnitId: filterLogic.quickUnitId,
    setQuickUnitId: filterLogic.setQuickUnitId,
    quickAdding: filterLogic.quickAdding,
    setQuickAdding: filterLogic.setQuickAdding,
    filteredItems: filterLogic.filteredItems,
    handleOpenCreate,
    handleCloseCreate,
    handleCreate,
    handleQuickAdd,
    handleOpenEdit,
    handleCloseEdit,
    handleEdit,
    handleDelete,
    handleTogglePurchased: purchaseLogic.handleTogglePurchased,
    handleOpenPurchase: purchaseLogic.handleOpenPurchase,
    handleClosePurchase: purchaseLogic.handleClosePurchase,
    handlePurchase: purchaseLogic.handlePurchase,
    handlePurchasedEdit: purchaseLogic.handlePurchasedEdit,
  };
}
