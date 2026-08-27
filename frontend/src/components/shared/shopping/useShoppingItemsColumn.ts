import { useState, useMemo, useEffect } from 'react';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { useConfirm } from '@/context/ConfirmContext';
import { getLocalTodayStr } from '@/utils/dateUtils';
import type { FiltroStato } from './ShoppingActiveListHeader';
import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
} from '@/types/shopping';
import {
  emptyItemForm,
  emptyPurchaseForm,
  getEurCurrencyId,
  type ItemFormState,
  type PurchaseFormState,
} from './shoppingItems.utils';

export interface UseShoppingItemsColumnProps {
  items: ShoppingListItem[];
  currencyOptions: ConfigOption[];
  activeListId: number | null;
  activeList?: ShoppingListSummary | null;
  searchQuery: string;
}

export function useShoppingItemsColumn({
  items,
  currencyOptions,
  activeListId,
  activeList,
  searchQuery,
}: UseShoppingItemsColumnProps) {
  const mutations = useShoppingMutations();
  const { confirm } = useConfirm();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const editModal = useModal<ShoppingListItem>();
  const detailModal = useModal<ShoppingListItem>();
  const purchaseModal = useModal<ShoppingListItem>();
  const [historyModalItem, setHistoryModalItem] = useState<ShoppingListItem | null>(null);

  const [filtroStato, setFiltroStato] = useState<FiltroStato>('aperti');
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    setFiltroStato('aperti');
  }, [activeListId]);

  const [itemForm, setItemForm] = useState<ItemFormState>(emptyItemForm());
  const [editForm, setEditForm] = useState<ItemFormState>(emptyItemForm());
  const [purchaseForm, setPurchaseForm] = useState<PurchaseFormState>(
    emptyPurchaseForm()
  );

  const [quickName, setQuickName] = useState('');
  const [quickQuantity, setQuickQuantity] = useState('');
  const [quickUnitId, setQuickUnitId] = useState('');
  const [quickAdding, setQuickAdding] = useState(false);

  const eurCurrencyId = useMemo(
    () => getEurCurrencyId(currencyOptions),
    [currencyOptions]
  );

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

  const effectiveQuery = (searchQuery || filterQuery).toLowerCase().trim();

  const filteredItems = useMemo(() => {
    let result = items;
    if (filtroStato === 'aperti') result = result.filter((item) => !item.isPurchased);
    if (filtroStato === 'completati') result = result.filter((item) => item.isPurchased);
    if (effectiveQuery) {
      result = result.filter((item) => {
        const pMatch = item.productName.toLowerCase().includes(effectiveQuery);
        const bMatch = item.brandName ? item.brandName.toLowerCase().includes(effectiveQuery) : false;
        return pMatch || bMatch;
      });
    }
    return result;
  }, [items, filtroStato, effectiveQuery]);

  const resetQuickAdd = () => {
    setQuickName('');
    setQuickQuantity('');
    setQuickUnitId('');
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
    if (!activeListId || !quickName.trim() || quickAdding) return;
    setQuickAdding(true);
    try {
      await mutations.createItem({
        shoppingListId: activeListId, productName: quickName.trim(),
        quantity: quickQuantity ? Number(quickQuantity) : undefined,
        unitId: quickUnitId ? Number(quickUnitId) : undefined,
      });
      resetQuickAdd();
    } finally { setQuickAdding(false); }
  };

  const handleOpenEdit = (item: ShoppingListItem) => {
    setEditForm({
      shoppingListId: item.shoppingListId != null ? String(item.shoppingListId) : '',
      productName: item.productName ?? '', brandName: item.brandName ?? '',
      brandId: item.brandId != null ? String(item.brandId) : '',
      quantity: item.quantity != null ? String(item.quantity) : '',
      unitId: item.unitId != null ? String(item.unitId) : '',
      notes: item.notes ?? '',
    });
    editModal.open(item);
  };

  const handleCloseEdit = () => { setEditForm(emptyItemForm()); editModal.close(); };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editModal.data) return;
    await mutations.updateItem({
      id: editModal.data.id, listId: editModal.data.shoppingListId,
      data: {
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

  const handleDelete = async (item: ShoppingListItem) => mutations.deleteItem({ id: item.id, listId: item.shoppingListId });

  const handleOpenPurchase = (item: ShoppingListItem) => {
    setPurchaseForm({
      ...emptyPurchaseForm(eurCurrencyId, item.quantity != null ? String(item.quantity) : '1', item.brandName ?? '', item.brandId != null ? String(item.brandId) : ''),
      purchaseDate: getLocalTodayStr(),
    });
    purchaseModal.open(item);
  };

  const handleTogglePurchased = (item: ShoppingListItem) => {
    if (item.isPurchased) {
      confirm({
        title: 'Annulla Acquisto', message: `Vuoi segnare "${item.productName}" come non acquistato?`,
        confirmText: 'Conferma',
        onConfirm: async () => {
          await mutations.togglePurchased({ id: item.id, listId: item.shoppingListId, data: { isPurchased: false } });
        },
      });
    } else { handleOpenPurchase(item); }
  };

  const handleClosePurchase = () => { setPurchaseForm(emptyPurchaseForm(eurCurrencyId)); purchaseModal.close(); };

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!purchaseModal.data || activeListId == null || !purchaseForm.price) return;
    const targetItem = purchaseModal.data;
    const boughtQuantity = Number(purchaseForm.quantity) || 1;
    const originalQuantity = targetItem.quantity != null ? targetItem.quantity : 1;

    await mutations.addInventoryBatch({
      itemId: targetItem.id, listId: activeListId,
      data: {
        productId: targetItem.productId,
        supplierId: purchaseForm.supplierId ? Number(purchaseForm.supplierId) : undefined,
        brandId: purchaseForm.brandId ? Number(purchaseForm.brandId) : undefined,
        brandName: purchaseForm.brandName?.trim() || undefined,
        purchaseDate: purchaseForm.purchaseDate,
        purchasePrice: Number(purchaseForm.price.replace(',', '.')),
        quantity: boughtQuantity,
        currencyId: purchaseForm.currencyId ? Number(purchaseForm.currencyId) : undefined,
        isOnSale: purchaseForm.isOnSale,
        offerFlagId: purchaseForm.isOnSale ? (Number(purchaseForm.offerFlagId) || 1) : undefined,
      },
    });

    if (boughtQuantity < originalQuantity) {
      await mutations.updateItem({ id: targetItem.id, listId: activeListId, data: { quantity: originalQuantity - boughtQuantity } });
      await mutations.togglePurchased({ id: targetItem.id, listId: activeListId, data: { isPurchased: false } });
    } else {
      if (items.every((i) => i.id === targetItem.id ? true : i.isPurchased) && !activeList?.isCompleted) {
        confirm({
          title: 'Lista Completata!', message: 'Tutti gli articoli di questa lista sono stati acquistati. Vuoi segnare la lista come completata?',
          confirmText: 'Sì, completa lista', cancelText: 'Lascia aperta',
          onConfirm: async () => {
            await mutations.updateList({ id: activeListId, data: { isCompleted: true } });
          },
        });
      }
    }
    handleClosePurchase();
  };

  return {
    isCreateOpen, setIsCreateOpen,
    editModal, detailModal, purchaseModal,
    historyModalItem, setHistoryModalItem,
    filtroStato, setFiltroStato,
    filterQuery, setFilterQuery,
    itemForm, setItemForm,
    editForm, setEditForm,
    purchaseForm, setPurchaseForm,
    quickName, setQuickName,
    quickQuantity, setQuickQuantity,
    quickUnitId, setQuickUnitId,
    quickAdding, setQuickAdding,
    filteredItems,
    handleOpenCreate, handleCloseCreate, handleCreate,
    handleQuickAdd,
    handleOpenEdit, handleCloseEdit, handleEdit,
    handleDelete,
    handleTogglePurchased, handleOpenPurchase, handleClosePurchase, handlePurchase,
  };
}
