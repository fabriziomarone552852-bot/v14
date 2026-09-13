import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  ArchiveIcon,
  ExternalLinkIcon,
} from '@/components/shared/utils/Icons';
import type { ShoppingListSummary } from '@/types/shopping';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import ShoppingPurchaseModal from '@/components/shared/shopping/ShoppingPurchaseModal';
import {
  useArchiveListDetailLogic,
  ArchiveListDetailHeaderInfo,
  ArchiveListDetailItemsSection,
} from './list';

export interface ShoppingListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListSummary | null;
}

export const ShoppingListDetailModal: React.FC<ShoppingListDetailModalProps> = ({
  isOpen,
  onClose,
  list,
}) => {
  const navigate = useNavigate();
  const { suppliers, config, brands, products } = useShoppingData();

  const {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    items,
    completedCount,
    totalCount,
    progressPercent,
    filteredItems,
    purchaseModal,
    purchaseForm,
    setPurchaseForm,
    handleTogglePurchased,
    handleConfirmPurchase,
    handleDeleteItem,
  } = useArchiveListDetailLogic({
    list,
  });

  if (!isOpen || !list) return null;

  const currencyOptions = config?.currencyOptions ?? [];
  const offerFlagOptions = config?.offerFlagOptions ?? [];

  const headerActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => {
          onClose();
          navigate(`/shopping?listId=${list.id}`);
        }}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
        title="Apri nella Vista Spesa"
      >
        <ExternalLinkIcon className="w-5 h-5" />
      </button>
    </div>
  );

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <span className="flex items-center gap-2 text-base font-bold text-gray-800">
            <ArchiveIcon className="w-5 h-5 text-blue-600" />
            <span>Dettaglio Lista Archiviata</span>
          </span>
        }
        headerActions={headerActions}
        maxWidthClass="max-w-2xl"
      >
        <div className="space-y-4">
          {/* Header Info & Barra Progresso */}
          <ArchiveListDetailHeaderInfo
            list={list}
            completedCount={completedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
          />

          {/* Elenco Articoli con Filtri e Ricerca */}
          <ArchiveListDetailItemsSection
            itemsCount={items.length}
            openCount={items.filter((it) => !it.isPurchased).length}
            completedCount={completedCount}
            filteredItems={filteredItems}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onTogglePurchased={handleTogglePurchased}
            onDeleteItem={handleDeleteItem}
          />
        </div>
      </BaseModal>

      {/* Modale d'Acquisto quando si spunta un articolo */}
      {purchaseModal.isOpen && (
        <ShoppingPurchaseModal
          open={purchaseModal.isOpen}
          onClose={purchaseModal.close}
          onSubmit={handleConfirmPurchase}
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
      )}
    </>
  );
};

export default ShoppingListDetailModal;
