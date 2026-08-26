// src/components/shared/shopping/ShoppingItemsColumn.tsx
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { useModal } from '@/hooks/useModals';
import { useConfirm } from '@/context/ConfirmContext';
import { getLocalTodayStr } from '@/utils/dateUtils';
import { AddButton } from '@/components/shared/utils/AddButton';

import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';

import {
  emptyItemForm,
  emptyPurchaseForm,
  getEurCurrencyId,
} from './shoppingItems.utils';
import type {
  ItemFormState,
  PurchaseFormState,
} from './shoppingItems.utils';

import ShoppingItemCreateModal from './ShoppingItemCreateModal';
import ShoppingItemEditModal from './ShoppingItemEditModal';
import ShoppingItemDetailModal from './ShoppingItemDetailModal';
import ShoppingPurchaseModal from './ShoppingPurchaseModal';
import ShoppingItemsList from './ShoppingItemsList';
import ShoppingQuickAddBar from './ShoppingQuickAddBar';
import ShoppingPriceHistoryModal from './ShoppingPriceHistoryModal';
import { ShoppingItemsEmptyState } from './ShoppingItemsEmptyState';
import { ShoppingActiveListHeader, type FiltroStato } from './ShoppingActiveListHeader';
import { ShoppingListSearchInput } from './ShoppingListSearchInput';

export interface ShoppingItemsColumnHandle {
  openCreateModal: () => void;
}

interface ShoppingItemsColumnProps {
  items: ShoppingListItem[];
  suppliers: ShoppingSupplierOption[];
  brands?: ShoppingSupplierOption[];
  products?: ShoppingProductOption[];
  unitOptions: ConfigOption[];
  currencyOptions: ConfigOption[];
  offerFlagOptions: ConfigOption[];
  loading: boolean;
  activeListId: number | null;
  activeList?: ShoppingListSummary | null;
  searchQuery: string;
  userRole?: string;
  onEditList?: (list: ShoppingListSummary) => void;
  onDeleteList?: (list: ShoppingListSummary) => void;
  onToggleCompleteList?: (list: ShoppingListSummary, isCompleted: boolean) => void;
  onQuickPriceAdd?: () => void;
}

const ShoppingItemsColumn = forwardRef<
  ShoppingItemsColumnHandle,
  ShoppingItemsColumnProps
>(
  (
    {
      items,
      suppliers,
      brands = [],
      products = [],
      unitOptions,
      currencyOptions,
      offerFlagOptions,
      loading,
      activeListId,
      activeList,
      searchQuery,
      userRole = 'owner',
      onEditList,
      onDeleteList,
      onToggleCompleteList,
      onQuickPriceAdd,
    },
    ref
  ) => {

    const mutations = useShoppingMutations();
    const { confirm } = useConfirm();
    const containerRef = React.useRef<HTMLDivElement>(null);

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

    useImperativeHandle(
      ref,
      () => ({
        openCreateModal: handleOpenCreate,
      }),
      [handleOpenCreate]
    );

    const effectiveQuery = (searchQuery || filterQuery).toLowerCase().trim();

    const filteredItems = useMemo(() => {
      let result = items;

      if (filtroStato === 'aperti') {
        result = result.filter((item) => !item.isPurchased);
      }

      if (filtroStato === 'completati') {
        result = result.filter((item) => item.isPurchased);
      }

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
      if (!itemForm.productName.trim()) return;
      if (!itemForm.shoppingListId) return;

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
          shoppingListId: activeListId,
          productName: quickName.trim(),
          quantity: quickQuantity ? Number(quickQuantity) : undefined,
          unitId: quickUnitId ? Number(quickUnitId) : undefined,
        });
        resetQuickAdd();
      } finally {
        setQuickAdding(false);
      }
    };

    const handleOpenEdit = (item: ShoppingListItem) => {
      setEditForm({
        shoppingListId:
          item.shoppingListId != null ? String(item.shoppingListId) : '',
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
      await mutations.deleteItem({
        id: item.id,
        listId: item.shoppingListId,
      });
    };

    const handleTogglePurchased = (item: ShoppingListItem) => {
      if (item.isPurchased) {
        confirm({
          title: 'Annulla Acquisto',
          message: `Vuoi segnare "${item.productName}" come non acquistato?`,
          confirmText: 'Conferma',
          onConfirm: async () => {
            await mutations.togglePurchased({
              id: item.id,
              listId: item.shoppingListId,
              data: { isPurchased: false },
            });
          },
        });
      } else {
        handleOpenPurchase(item);
      }
    };

    const handleOpenPurchase = (item: ShoppingListItem) => {
      setPurchaseForm({
        ...emptyPurchaseForm(
          eurCurrencyId,
          item.quantity != null ? String(item.quantity) : '1',
          item.brandName ?? '',
          item.brandId != null ? String(item.brandId) : ''
        ),
        purchaseDate: getLocalTodayStr(),
      });
      purchaseModal.open(item);
    };

    const handleClosePurchase = () => {
      setPurchaseForm(emptyPurchaseForm(eurCurrencyId));
      purchaseModal.close();
    };

    const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!purchaseModal.data) return;
      if (activeListId == null) return;
      if (!purchaseForm.price) return;

      const targetItem = purchaseModal.data;
      const boughtQuantity = Number(purchaseForm.quantity) || 1;
      const originalQuantity = targetItem.quantity != null ? targetItem.quantity : 1;

      // 1. Registra il lotto di inventario
      await mutations.addInventoryBatch({
        itemId: targetItem.id,
        listId: activeListId,
        data: {
          productId: targetItem.productId,
          supplierId: purchaseForm.supplierId
            ? Number(purchaseForm.supplierId)
            : undefined,
          brandId: purchaseForm.brandId
            ? Number(purchaseForm.brandId)
            : undefined,
          brandName: purchaseForm.brandName?.trim() || undefined,
          purchaseDate: purchaseForm.purchaseDate,
          purchasePrice: Number(purchaseForm.price.replace(',', '.')),
          quantity: boughtQuantity,
          currencyId: purchaseForm.currencyId
            ? Number(purchaseForm.currencyId)
            : undefined,
          isOnSale: purchaseForm.isOnSale,
          offerFlagId: purchaseForm.isOnSale ? (Number(purchaseForm.offerFlagId) || 1) : undefined,
        },
      });



      // 2. Logica acquisto parziale o completamento lista
      if (boughtQuantity < originalQuantity) {
        const remainingQuantity = originalQuantity - boughtQuantity;
        await mutations.updateItem({
          id: targetItem.id,
          listId: activeListId,
          data: { quantity: remainingQuantity },
        });
        await mutations.togglePurchased({
          id: targetItem.id,
          listId: activeListId,
          data: { isPurchased: false },
        });
      } else {
        const isAllItemsPurchased = items.every((i) =>
          i.id === targetItem.id ? true : i.isPurchased
        );
        if (isAllItemsPurchased && !activeList?.isCompleted) {
          confirm({
            title: 'Lista Completata!',
            message: 'Tutti gli articoli di questa lista sono stati acquistati. Vuoi segnare la lista come completata?',
            confirmText: 'Sì, completa lista',
            cancelText: 'Lascia aperta',
            onConfirm: async () => {
              await mutations.updateList({
                id: activeListId,
                data: { isCompleted: true },
              });
            },
          });
        }
      }

      handleClosePurchase();
    };

    const canCreateItem = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
    const canEditItem   = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
    // Admin può modificare anche i prodotti già acquistati; editor no
    const canEditPurchasedItem = userRole === 'owner' || userRole === 'admin';
    const canDeleteItem = userRole === 'owner' || userRole === 'admin';
    const canEditList   = userRole === 'owner' || userRole === 'admin';


    if (!activeListId || !activeList) {
      return <ShoppingItemsEmptyState onQuickPriceAdd={onQuickPriceAdd} />;
    }

    return (
      <div className="flex h-full min-h-0 flex-col justify-between">
        <div className="flex flex-col flex-1 min-h-0 w-full gap-3.5">
          {/* Header della lista attiva */}
          <ShoppingActiveListHeader
            activeList={activeList}
            items={items}
            filtroStato={filtroStato}
            onFiltroStatoChange={setFiltroStato}
            canEditList={canEditList}
            onToggleCompleteList={onToggleCompleteList}
            onEditList={onEditList}
            onDeleteList={onDeleteList}
          />

          {/* Barra di ricerca a tutta larghezza */}
          <ShoppingListSearchInput
            value={filterQuery}
            onChange={setFilterQuery}
          />


          {/* Quick Add Bar */}
          {canCreateItem && (
            <ShoppingQuickAddBar
              activeListId={activeListId}
              unitOptions={unitOptions}
              quickName={quickName}
              quickQuantity={quickQuantity}
              quickUnitId={quickUnitId}
              products={products}
              onQuickNameChange={setQuickName}
              onQuickQuantityChange={setQuickQuantity}
              onQuickUnitChange={setQuickUnitId}
              onSubmit={handleQuickAdd}
              loading={quickAdding}
            />
          )}

          {/* ========================================================================= */}
          {/* 3. ELENCO ARTICOLI DELLA LISTA                                            */}
          {/* ========================================================================= */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <ShoppingItemsList
              items={filteredItems}
              loading={loading && items.length === 0}
              containerRef={containerRef}
              onToggle={handleTogglePurchased}
              onOpenDetail={(item) => detailModal.open(item)}
              userRole={userRole}
            />
          </div>
        </div>

        {/* Footer: Tasto Nuovo Prodotto nello stile TaskColumn / AddButton */}
        {canCreateItem && (
          <div className="flex flex-col gap-2 mt-3 shrink-0 w-full">
            <AddButton
              label="Nuovo Prodotto"
              onClick={handleOpenCreate}
            />
          </div>
        )}

        {/* Modal Dettaglio Singolo Prodotto */}
        <ShoppingItemDetailModal
          isOpen={detailModal.isOpen}
          onClose={detailModal.close}
          item={detailModal.data}
          onEditClick={handleOpenEdit}
          onDeleteClick={handleDelete}
          canEdit={detailModal.data?.isPurchased ? canEditPurchasedItem : canEditItem}
          canDelete={canDeleteItem}
        />

        {/* Modal Creazione Prodotto */}
        <ShoppingItemCreateModal
          open={isCreateOpen}
          onClose={handleCloseCreate}
          onSubmit={handleCreate}
          itemForm={itemForm}
          setItemForm={setItemForm}
          activeListId={activeListId}
          unitOptions={unitOptions}
          products={products}
          brands={brands}
        />


        {/* Modal Modifica Prodotto */}
        <ShoppingItemEditModal
          open={editModal.isOpen}
          onClose={handleCloseEdit}
          onSubmit={handleEdit}
          editForm={editForm}
          setEditForm={setEditForm}
          unitOptions={unitOptions}
          products={products}
          brands={brands}
        />


        {/* Modal Registra Acquisto */}
        <ShoppingPurchaseModal
          open={purchaseModal.isOpen}
          onClose={handleClosePurchase}
          onSubmit={handlePurchase}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          suppliers={suppliers}
          brands={brands}
          products={products}
          currencyOptions={currencyOptions}
          offerFlagOptions={offerFlagOptions}
          itemName={purchaseModal.data?.productName ?? ''}
          itemTotalQuantity={purchaseModal.data?.quantity ?? null}
          unitCodeName={purchaseModal.data?.unitCodeName ?? null}
        />

        {historyModalItem ? (
          <ShoppingPriceHistoryModal
            isOpen={Boolean(historyModalItem)}
            itemId={historyModalItem.id}
            productName={historyModalItem.productName}
            onClose={() => setHistoryModalItem(null)}
          />
        ) : null}
      </div>
    );
  }
);

ShoppingItemsColumn.displayName = 'ShoppingItemsColumn';

export default ShoppingItemsColumn;