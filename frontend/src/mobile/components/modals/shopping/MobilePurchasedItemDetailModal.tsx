// src/mobile/components/modals/shopping/MobilePurchasedItemDetailModal.tsx
import React from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from '@/components/shared/shopping/ShoppingItemNoteEditor';
import {
  useMobilePurchasedItemDetailLogic,
  MobilePurchasedItemPurchaseInfoCard,
} from './purchased';

export interface MobilePurchasedItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingListItem | null;
  onEditPurchase: (item: ShoppingListItem) => void;
  onDeleteClick: (item: ShoppingListItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const MobilePurchasedItemDetailModal: React.FC<MobilePurchasedItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditPurchase,
  onDeleteClick,
  canEdit = true,
  canDelete = true,
}) => {
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingHistory,
    isEditingNote,
    setIsEditingNote,
    noteText,
    setNoteText,
    isSavingNote,
    currentStats,
    purchasePrice,
    unitPrice,
    supplierName,
    purchaseDate,
    isOnSale,
    handleDeleteConfirm,
    handleSaveNote,
    handleCancelNote,
  } = useMobilePurchasedItemDetailLogic({
    isOpen,
    item,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !item) return null;

  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  const statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircleIcon className="w-3.5 h-3.5" />
      <span>Prodotto Acquistato</span>
    </span>
  );

  const headerActions = (
    <div className="flex items-center gap-1">
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onEditPurchase(item);
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Modifica Acquisto"
        >
          <EditIcon className="w-5 h-5" />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Elimina"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <>
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={statusBadge}
        headerActions={headerActions}
      >
        <div className="space-y-4 max-w-lg mx-auto pb-4">
          {/* 1. Scheda Principale Articolo (Nome, Brand, Quantità e Note) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                  {formattedProductName}
                </h2>
                {item.brandName && (
                  <span className="text-xs font-semibold text-gray-500 block mt-0.5">
                    {item.brandName}
                  </span>
                )}
              </div>

              {item.quantity != null && (
                <div className="px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-100 text-right shrink-0">
                  <span className="text-xs font-bold text-blue-700">
                    {item.quantity} {unitLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Note / Indicazioni integrate nel medesimo riquadro */}
            <div className="pt-2 border-t border-gray-100">
              <ShoppingItemNoteEditor
                notes={item.notes}
                isEditing={isEditingNote}
                setIsEditing={setIsEditingNote}
                noteText={noteText}
                setNoteText={setNoteText}
                isSaving={isSavingNote}
                canEdit={canEdit}
                onSave={handleSaveNote}
                onCancel={handleCancelNote}
              />
            </div>
          </div>

          {/* 2. Scheda Riepilogo Acquisto Effettuato */}
          <MobilePurchasedItemPurchaseInfoCard
            item={item}
            purchasePrice={purchasePrice}
            unitPrice={unitPrice}
            supplierName={supplierName}
            purchaseDate={purchaseDate}
            isOnSale={isOnSale}
            isLoadingHistory={isLoadingHistory}
          />

          {/* 3. Storico & Analisi Prezzi in un unico riquadro */}
          <ShoppingItemPriceHistoryPanel
            view={view}
            onViewChange={setView}
            personalBatches={personalBatches}
            communityPrices={communityPrices}
            isLoading={isLoadingHistory}
            currentStats={currentStats}
          />
        </div>
      </MobileBaseModal>

      {/* Dialog Conferma Eliminazione */}
      {isDeleteDialogOpen && (
        <ConfirmDialog
          isOpen={isDeleteDialogOpen}
          title="Elimina Articolo"
          message={`Vuoi davvero rimuovere "${item.productName}" dalla lista?`}
          confirmText="Elimina"
          cancelText="Annulla"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setIsDeleteDialogOpen(false)}
        />
      )}
    </>
  );
};

export default MobilePurchasedItemDetailModal;
