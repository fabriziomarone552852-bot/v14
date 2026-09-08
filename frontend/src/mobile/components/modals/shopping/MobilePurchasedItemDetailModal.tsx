// src/mobile/components/modals/shopping/MobilePurchasedItemDetailModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import MobileBaseModal from '../MobileBaseModal';
import ConfirmDialog from '@/components/shared/dialog/ConfirmDialog';
import {
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  TagIcon,
  CalendarIcon,
} from '@/components/shared/utils/Icons';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from '@/components/shared/shopping/shoppingPriceUtils';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import { ShoppingItemNoteEditor } from '@/components/shared/shopping/ShoppingItemNoteEditor';
import type { PriceStatsData } from '@/components/shared/shopping/ShoppingItemPriceAnalysisCard';
import { formatToItalianShortDate } from '@/utils/dateUtils';

interface MobilePurchasedItemDetailModalProps {
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
    if (!item) return;
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

  const formattedProductName = capitalizeFirstLetter(item.productName);
  const unitLabel = formatUnitForQuantity(item.unitCodeName, item.quantity);

  // Calcolo prezzo totale e per unità
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

          {/* 2. Scheda Riepilogo Acquisto Effettuato (Prezzo, Prezzo/Unità, Negozio, Data, Offerta) */}
          <div className="bg-emerald-50/40 rounded-2xl border border-emerald-200/80 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2.5">
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

            {/* Prezzo Totale e Prezzo Unitario */}
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs text-gray-500 font-medium block">Prezzo Totale</span>
                <span className="text-2xl font-black text-emerald-700">
                  {purchasePrice != null
                    ? `${purchasePrice.toFixed(2)} €`
                    : isLoadingHistory
                    ? 'Caricamento...'
                    : 'N/D'}
                </span>
              </div>
              {unitPrice != null && (
                <div className="text-right">
                  <span className="text-xs text-gray-500 font-medium block">Prezzo Unitario</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {unitPrice.toFixed(2)} € / {formatUnitForQuantity(item.unitCodeName, 1) || 'unità'}
                  </span>
                </div>
              )}
            </div>

            {/* Negozio & Data d'acquisto */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-100/70 text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  🏪 Negozio
                </span>
                <span className="font-bold text-gray-800 block truncate">
                  {supplierName}
                </span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-gray-500 font-medium flex items-center justify-end gap-1">
                  <CalendarIcon className="w-3 h-3 text-gray-400" /> Data Acquisto
                </span>
                <span className="font-bold text-gray-800 block">
                  {purchaseDate ? formatToItalianShortDate(purchaseDate) : (isLoadingHistory ? 'Caricamento...' : 'N/D')}
                </span>
              </div>
            </div>
          </div>

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
