// src/components/shared/shopping/ShoppingPurchasedItemDetailModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  CloseIcon,
  TagIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from './ShoppingUnitSelect';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from './shoppingPriceUtils';
import { ShoppingItemPriceHistoryPanel } from './ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from './ShoppingItemNoteEditor';
import type { PriceStatsData } from './ShoppingItemPriceAnalysisCard';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface ShoppingPurchasedItemDetailModalProps {
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

export const ShoppingPurchasedItemDetailModal: React.FC<ShoppingPurchasedItemDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditPurchase,
  onDeleteClick,
  canEdit = true,
  canDelete = true,
}) => {
  const mutations = useShoppingMutations();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [view, setView] = useState<'personal' | 'community'>('personal');
  const [personalBatches, setPersonalBatches] = useState<ItemBatchRecord[]>([]);
  const [communityPrices, setCommunityPrices] = useState<CommunityPriceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (item) {
      setNoteText(item.notes || '');
      setIsEditingNote(false);
    }
  }, [item?.id, item?.notes]);

  useEffect(() => {
    if (!isOpen || !item) {
      setPersonalBatches([]);
      setCommunityPrices([]);
      return;
    }
    const load = async () => {
      setIsLoadingHistory(true);
      try {
        const [batches, community] = await Promise.all([
          fetchItemBatches(item.id),
          item.productId ? fetchCommunityPrices(item.productId) : Promise.resolve([]),
        ]);
        setPersonalBatches(batches);
        setCommunityPrices(community);
      } catch {
        // silently fail
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, [isOpen, item?.id, item?.productId, item?.brandId, item?.isPurchased]);

  const currentStats = useMemo<PriceStatsData | null>(() => {
    const rawList = view === 'personal' ? personalBatches : communityPrices;
    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - 365);

    const stats = computePriceStatistics(rawList, cutoffDate);
    if (stats.count === 0) return null;

    const defaultUnit = item ? formatUnitForQuantity(item.unitCodeName, 1) || 'unità' : 'unità';
    const unit = stats.bestUnit || defaultUnit;

    return {
      avg: stats.avg ?? 0,
      bestPrice: stats.bestPrice ?? 0,
      bestSupplier: stats.bestSupplier,
      bestDate: stats.bestDate,
      unit,
      count: stats.count,
    };
  }, [view, personalBatches, communityPrices, item]);

  if (!isOpen || !item) return null;

  const handleDeleteConfirm = () => {
    onDeleteClick(item);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const handleSaveNote = async () => {
    if (!item) return;
    const cleanNote = noteText.trim();
    setIsEditingNote(false);
    if (cleanNote === (item.notes || '').trim()) return;

    setIsSavingNote(true);
    try {
      await mutations.updateItem({
        id: item.id,
        listId: item.shoppingListId,
        data: { notes: cleanNote || undefined },
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleCancelNote = () => {
    setNoteText(item?.notes || '');
    setIsEditingNote(false);
  };

  const latestBatch = useMemo<ItemBatchRecord | null>(() => {
    if (personalBatches.length > 0) return personalBatches[0];
    const rawBatches = item?.inventoryBatches || [];
    if (rawBatches.length > 0) {
      const b = rawBatches[0];
      const purchasePrice = Number(b.purchase_price ?? b.purchasePrice ?? 0);
      const quantityPurchased = Number(b.quantity_purchased ?? b.quantityPurchased ?? item?.quantity ?? 1);
      const unitPrice =
        b.unit_price != null
          ? Number(b.unit_price)
          : quantityPurchased > 0
          ? purchasePrice / quantityPurchased
          : null;

      return {
        id: b.id ?? 0,
        productId: b.product_id ?? b.productId ?? item?.productId ?? null,
        productName: b.product_name ?? b.productName ?? item?.productName ?? null,
        brandId: b.brand_id ?? b.brandId ?? item?.brandId ?? null,
        brandName: b.brand_name ?? b.brandName ?? item?.brandName ?? null,
        purchaseDate: b.purchase_date ?? b.purchaseDate ?? item?.lastPurchaseDate ?? '',
        quantityPurchased,
        purchasePrice,
        unitPrice,
        supplierId: b.supplier_id ?? b.supplierId ?? item?.lastSupplierId ?? null,
        supplierName: b.supplier_name ?? b.supplierName ?? item?.lastSupplierName ?? null,
        unitName: b.unit_name ?? b.unitName ?? item?.unitCodeName ?? null,
        listName: b.list_name ?? b.listName ?? item?.listName ?? null,
        isOnSale: Boolean(b.is_on_sale ?? b.isOnSale),
      };
    }
    return null;
  }, [personalBatches, item]);

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

  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 pointer-events-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex flex-col md:flex-row gap-4 items-stretch w-full max-w-5xl justify-center pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pannello Sinistro: Storico Prezzi & Analisi Integrata */}
        <ShoppingItemPriceHistoryPanel
          view={view}
          onViewChange={setView}
          personalBatches={personalBatches}
          communityPrices={communityPrices}
          isLoading={isLoadingHistory}
          currentStats={currentStats}
        />

        {/* Pannello Destro: Scheda Articolo Acquistato */}
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
                      onClick={() => setIsDeleteDialogOpen(true)}
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                      {formattedProductName}
                    </h2>
                    {item.brandName && (
                      <span className="text-sm px-2.5 py-0.5 rounded-lg font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {item.brandName}
                      </span>
                    )}
                  </div>
                  {item.groupName && (
                    <p className="text-xs text-gray-400 mt-0.5">
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
                    onSave={handleSaveNote}
                    onCancel={handleCancelNote}
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
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Elimina Prodotto"
        message={`Sei sicuro di voler rimuovere "${formattedProductName}" dalla lista della spesa?`}
        confirmText="Elimina"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShoppingPurchasedItemDetailModal;
