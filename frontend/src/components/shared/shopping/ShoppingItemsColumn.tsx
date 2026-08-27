import React, { forwardRef, useImperativeHandle } from 'react';
import { AddButton } from '@/components/shared/utils/AddButton';

import type {
  ConfigOption,
  ShoppingListItem,
  ShoppingListSummary,
  ShoppingProductOption,
  ShoppingSupplierOption,
} from '@/types/shopping';

import ShoppingItemsList from './ShoppingItemsList';
import ShoppingQuickAddBar from './ShoppingQuickAddBar';
import { ShoppingItemsEmptyState } from './ShoppingItemsEmptyState';
import { ShoppingActiveListHeader } from './ShoppingActiveListHeader';
import { ShoppingListSearchInput } from './ShoppingListSearchInput';

import { useShoppingItemsColumn } from './useShoppingItemsColumn';
import { ShoppingItemsColumnModals } from './ShoppingItemsColumnModals';

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
    const containerRef = React.useRef<HTMLDivElement>(null);

    const columnLogic = useShoppingItemsColumn({
      items,
      currencyOptions,
      activeListId,
      activeList,
      searchQuery,
    });

    useImperativeHandle(
      ref,
      () => ({
        openCreateModal: columnLogic.handleOpenCreate,
      }),
      [columnLogic.handleOpenCreate]
    );

    const canCreateItem = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
    const canEditItem   = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
    const canEditPurchasedItem = userRole === 'owner' || userRole === 'admin';
    const canDeleteItem = userRole === 'owner' || userRole === 'admin';
    const canEditList   = userRole === 'owner' || userRole === 'admin';

    if (!activeListId || !activeList) {
      return <ShoppingItemsEmptyState onQuickPriceAdd={onQuickPriceAdd} />;
    }

    return (
      <div className="flex h-full min-h-0 flex-col justify-between">
        <div className="flex flex-col flex-1 min-h-0 w-full gap-3.5">
          <ShoppingActiveListHeader
            activeList={activeList}
            items={items}
            filtroStato={columnLogic.filtroStato}
            onFiltroStatoChange={columnLogic.setFiltroStato}
            canEditList={canEditList}
            onToggleCompleteList={onToggleCompleteList}
            onEditList={onEditList}
            onDeleteList={onDeleteList}
          />

          <ShoppingListSearchInput
            value={columnLogic.filterQuery}
            onChange={columnLogic.setFilterQuery}
          />

          {canCreateItem && (
            <ShoppingQuickAddBar
              activeListId={activeListId}
              unitOptions={unitOptions}
              quickName={columnLogic.quickName}
              quickQuantity={columnLogic.quickQuantity}
              quickUnitId={columnLogic.quickUnitId}
              products={products}
              onQuickNameChange={columnLogic.setQuickName}
              onQuickQuantityChange={columnLogic.setQuickQuantity}
              onQuickUnitChange={columnLogic.setQuickUnitId}
              onSubmit={columnLogic.handleQuickAdd}
              loading={columnLogic.quickAdding}
            />
          )}

          <div className="min-h-0 flex-1 overflow-hidden">
            <ShoppingItemsList
              items={columnLogic.filteredItems}
              loading={loading && items.length === 0}
              containerRef={containerRef}
              onToggle={columnLogic.handleTogglePurchased}
              onOpenDetail={(item) => columnLogic.detailModal.open(item)}
              userRole={userRole}
            />
          </div>
        </div>

        {canCreateItem && (
          <div className="flex flex-col gap-2 mt-3 shrink-0 w-full">
            <AddButton
              label="Nuovo Prodotto"
              onClick={columnLogic.handleOpenCreate}
            />
          </div>
        )}

        <ShoppingItemsColumnModals
          detailModal={columnLogic.detailModal}
          editModal={columnLogic.editModal}
          purchaseModal={columnLogic.purchaseModal}
          isCreateOpen={columnLogic.isCreateOpen}
          historyModalItem={columnLogic.historyModalItem}
          itemForm={columnLogic.itemForm}
          setItemForm={columnLogic.setItemForm}
          editForm={columnLogic.editForm}
          setEditForm={columnLogic.setEditForm}
          purchaseForm={columnLogic.purchaseForm}
          setPurchaseForm={columnLogic.setPurchaseForm}
          activeListId={activeListId}
          unitOptions={unitOptions}
          products={products}
          brands={brands}
          suppliers={suppliers}
          currencyOptions={currencyOptions}
          offerFlagOptions={offerFlagOptions}
          handleCloseCreate={columnLogic.handleCloseCreate}
          handleCreate={columnLogic.handleCreate}
          handleCloseEdit={columnLogic.handleCloseEdit}
          handleEdit={columnLogic.handleEdit}
          handleClosePurchase={columnLogic.handleClosePurchase}
          handlePurchase={columnLogic.handlePurchase}
          handleOpenEdit={columnLogic.handleOpenEdit}
          handleDelete={columnLogic.handleDelete}
          setHistoryModalItem={columnLogic.setHistoryModalItem}
          canEditItem={canEditItem}
          canEditPurchasedItem={canEditPurchasedItem}
          canDeleteItem={canDeleteItem}
        />
      </div>
    );
  }
);

ShoppingItemsColumn.displayName = 'ShoppingItemsColumn';

export default ShoppingItemsColumn;