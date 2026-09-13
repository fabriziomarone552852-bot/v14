// src/components/shared/shopping/purchased/ShoppingPurchasedItemInfoSection.tsx
import React from 'react';
import type { ShoppingListItem, ItemBatchRecord } from '@/types/shopping';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  CloseIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '../ShoppingUnitSelect';
import { ShoppingItemNoteEditor } from '../ShoppingItemNoteEditor';
import { formatToItalianShortDate } from '@/utils/dateUtils';

export interface ShoppingPurchasedItemInfoSectionProps {
  item: ShoppingListItem;
  latestBatch: ItemBatchRecord | null;
  isLoadingHistory: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isEditingNote: boolean;
  setIsEditingNote: (editing: boolean) => void;
  noteText: string;
  setNoteText: (text: string) => void;
  isSavingNote: boolean;
  onSaveNote: () => Promise<void>;
  onCancelNote: () => void;
  onEditPurchase: (item: ShoppingListItem) => void;
  onOpenDelete: () => void;
  onClose: () => void;
}

const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const ShoppingPurchasedItemInfoSection: React.FC<ShoppingPurchasedItemInfoSectionProps> = ({
  item,
  latestBatch,
  isLoadingHistory,
  canEdit,
  canDelete,
  isEditingNote,
  setIsEditingNote,
  noteText,
  setNoteText,
  isSavingNote,
  onSaveNote,
  onCancelNote,
  onEditPurchase,
  onOpenDelete,
  onClose,
}) => {
  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  const purchasePrice =
    latestBatch?.purchasePrice != null
      ? latestBatch.purchasePrice
      : item.lastPrice != null
      ? item.lastPrice
      : null;

  const quantity = item.quantity ?? latestBatch?.quantityPurchased ?? 1;
  const unitPrice =
    latestBatch?.unitPrice != null
      ? latestBatch.unitPrice
      : purchasePrice != null && quantity > 0
      ? purchasePrice / quantity
      : null;

  const supplierName = latestBatch?.supplierName || item.lastSupplierName || 'Non specificato';
  const purchaseDate = latestBatch?.purchaseDate || item.lastPurchaseDate || null;
  const isOnSale = latestBatch?.isOnSale ?? false;

  return (
    <div className="pointer-events-auto flex-shrink-0 w-full md:w-96 flex flex-col justify-between gap-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 flex flex-col justify-between flex-1">
        <div className="space-y-4">
          {/* Header con Badge Acquistato ed Azioni */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Acquistato</span>
            </span>

            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditPurchase(item);
                  }}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Modifica acquisto e prodotto"
                >
                  <EditIcon className="w-4 h-4" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={onOpenDelete}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Elimina prodotto"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                title="Chiudi"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scheda Prodotto + Note Unificata */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h2 className="text-xl font-black text-gray-900 leading-tight truncate min-w-0 flex-1" title={formattedProductName}>
                  {formattedProductName}
                </h2>
                {item.brandName && (
                  <span className="text-sm px-2.5 py-0.5 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {item.brandName}
                  </span>
                )}
              </div>
              {item.groupName && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  Lista: <span className="font-semibold text-gray-600">{item.listName}</span> • Gruppo: <span className="font-semibold text-gray-600">{item.groupName}</span>
                </p>
              )}
            </div>

            {item.quantity != null && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Quantità Acquistata:
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                  {item.quantity} {unitLabel}
                </span>
              </div>
            )}

            {/* Note del Prodotto */}
            <div className="pt-2 border-t border-gray-100">
              <ShoppingItemNoteEditor
                notes={item.notes}
                isEditing={isEditingNote}
                setIsEditing={setIsEditingNote}
                noteText={noteText}
                setNoteText={setNoteText}
                isSaving={isSavingNote}
                onSave={onSaveNote}
                onCancel={onCancelNote}
                canEdit={canEdit}
              />
            </div>
          </div>

          {/* Scheda Dettagli Acquisto (Smeraldo) */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200/80 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Dettagli Acquisto
              </span>
              {isOnSale ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <TagIcon className="w-3 h-3 text-amber-600" />
                  In Offerta
                </span>
              ) : (
                <span className="text-[11px] font-medium text-gray-500">Prezzo Standard</span>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-1 border-t border-emerald-100">
              <span className="text-xs text-gray-600">Prezzo Pagato:</span>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-700">
                  {purchasePrice != null
                    ? `${purchasePrice.toFixed(2)} ${item.lastCurrencyCodeName || 'EUR'}`
                    : isLoadingHistory
                    ? 'Caricamento...'
                    : 'N/D'}
                </span>
                {unitPrice != null && quantity > 1 && (
                  <span className="block text-[11px] text-gray-400">
                    ({unitPrice.toFixed(2)} € / {formatUnitForQuantity(item.unitCodeName, 1) || 'unità'})
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
              <span className="text-gray-600">Negozio / Supermercato:</span>
              <span className="font-bold text-gray-800 flex items-center gap-1">
                <span>🏬</span>
                <span>{supplierName}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-emerald-100">
              <span className="text-gray-600">Data d'Acquisto:</span>
              <span className="font-semibold text-gray-700">
                📅 {purchaseDate ? formatToItalianShortDate(purchaseDate) : (isLoadingHistory ? 'Caricamento...' : 'N/D')}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
