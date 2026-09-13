// src/mobile/components/modals/shopping/MobileShoppingListDetailModal.tsx
import React from 'react';
import MobileBaseModal from '../MobileBaseModal';
import {
  ShoppingIcon,
  CheckCircleIcon,
  ArchiveIcon,
  UsersIcon,
  LockIcon,
  ExternalLinkIcon,
} from '@/components/shared/utils/Icons';
import type { ShoppingListSummary } from '@/types/shopping';
import { MobileShoppingPurchaseModal } from './MobileShoppingPurchaseModal';
import {
  useMobileShoppingListDetailLogic,
  MobileShoppingListProgressBar,
  MobileShoppingListDetailItemsList,
} from './list';

export interface MobileShoppingListDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListSummary | null;
  zIndexClass?: string;
}

export const MobileShoppingListDetailModal: React.FC<MobileShoppingListDetailModalProps> = ({
  isOpen,
  onClose,
  list,
  zIndexClass = 'z-[10010]',
}) => {
  const {
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    purchaseModal,
    suppliers,
    currencyOptions,
    offerFlagOptions,
    purchaseForm,
    setPurchaseForm,
    isGroup,
    items,
    completedCount,
    totalCount,
    progressPercent,
    filteredItems,
    handleTogglePurchased,
    handlePurchaseSubmit,
    handleOpenShoppingPage,
  } = useMobileShoppingListDetailLogic({
    list,
    onClose,
  });

  if (!isOpen || !list) return null;

  const headerActions = (
    <button
      type="button"
      onClick={handleOpenShoppingPage}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-xl transition cursor-pointer"
      title="Apri nella Spesa"
    >
      <ExternalLinkIcon className="w-3.5 h-3.5" />
      <span>Apri</span>
    </button>
  );

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        zIndexClass={zIndexClass}
        title={
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs shrink-0 ${
                isGroup
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <ShoppingIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate block">{list.name}</span>
            </div>
          </div>
        }
        headerActions={headerActions}
      >
        <div className="space-y-3.5 text-xs max-w-lg mx-auto pb-6">
          {/* Badge Gruppo / Privata & Stato */}
          <div className="flex items-center gap-2 flex-wrap">
            {isGroup ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                <UsersIcon className="w-3 h-3" />
                <span>{list.groupName || 'Gruppo Condiviso'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md">
                <LockIcon className="w-3 h-3 text-slate-400" />
                <span>Lista Personale</span>
              </span>
            )}

            {list.isCompleted ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                <ArchiveIcon className="w-3 h-3" />
                <span>Completata</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Attiva</span>
              </span>
            )}
          </div>

          {/* Descrizione lista se presente */}
          {list.description && (
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {list.description}
            </p>
          )}

          {/* Barra di avanzamento */}
          <MobileShoppingListProgressBar
            completedCount={completedCount}
            totalCount={totalCount}
            progressPercent={progressPercent}
          />

          {/* Elenco e filtri */}
          <MobileShoppingListDetailItemsList
            items={items}
            filteredItems={filteredItems}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onTogglePurchased={handleTogglePurchased}
          />
        </div>
      </MobileBaseModal>

      {/* Modale Mobile Registrazione Acquisto */}
      {purchaseModal.isOpen && purchaseModal.data && (
        <MobileShoppingPurchaseModal
          open={true}
          itemName={purchaseModal.data.productName}
          itemTotalQuantity={purchaseModal.data.quantity}
          unitCodeName={purchaseModal.data.unitCodeName || purchaseModal.data.unitCode || undefined}
          purchaseForm={purchaseForm}
          setPurchaseForm={setPurchaseForm}
          suppliers={suppliers}
          currencyOptions={currencyOptions}
          offerFlagOptions={offerFlagOptions}
          onClose={purchaseModal.close}
          onSubmit={handlePurchaseSubmit}
          zIndexClass="z-[10020]"
        />
      )}
    </>
  );
};

export default MobileShoppingListDetailModal;
