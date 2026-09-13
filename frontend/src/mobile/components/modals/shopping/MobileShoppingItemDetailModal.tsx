// src/mobile/components/modals/shopping/MobileShoppingItemDetailModal.tsx
import React from 'react';
import type { ShoppingListItem } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  ShoppingIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import {
  useMobileShoppingItemDetailLogic,
  MobileShoppingItemDetailCard,
} from './item';

export interface MobileShoppingItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingListItem | null;
  onEditClick: (item: ShoppingListItem) => void;
  onDeleteClick: (item: ShoppingListItem) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const MobileShoppingItemDetailModal: React.FC<MobileShoppingItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditClick,
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
    handleDeleteConfirm,
    handleSaveNote,
    handleCancelNote,
  } = useMobileShoppingItemDetailLogic({
    isOpen,
    item,
    onDeleteClick,
    onClose,
  });

  if (!isOpen || !item) return null;

  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  const statusBadge = item.isPurchased ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <CheckCircleIcon className="w-3.5 h-3.5" />
      <span>Acquistato</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <ShoppingIcon className="w-3.5 h-3.5 text-amber-600" />
      <span>Da Comprare</span>
    </span>
  );

  const headerActions = (
    <div className="flex items-center gap-1">
      {canEdit && (
        <button
          type="button"
          onClick={() => {
            onClose();
            onEditClick(item);
          }}
          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Modifica"
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
          {/* Scheda Principale Articolo */}
          <MobileShoppingItemDetailCard
            item={item}
            formattedProductName={formattedProductName}
            unitLabel={unitLabel}
            isEditingNote={isEditingNote}
            setIsEditingNote={setIsEditingNote}
            noteText={noteText}
            setNoteText={setNoteText}
            isSavingNote={isSavingNote}
            canEdit={canEdit}
            onSaveNote={handleSaveNote}
            onCancelNote={handleCancelNote}
          />

          {/* Storico & Analisi Prezzi in un unico riquadro */}
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

export default MobileShoppingItemDetailModal;
