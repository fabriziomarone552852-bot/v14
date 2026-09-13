// src/components/shared/shopping/purchased/usePurchasedItemDetailLogic.ts
import { useState, useEffect, useMemo } from 'react';
import type { ShoppingListItem, ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import { fetchItemBatches, fetchCommunityPrices } from '@/api/shoppingApi';
import { useShoppingMutations } from '@/hooks/shopping/useShoppingMutations';
import { computePriceStatistics } from '../shoppingPriceUtils';
import { formatUnitForQuantity } from '../ShoppingUnitSelect';
import type { PriceStatsData } from '../ShoppingItemPriceAnalysisCard';

export interface UsePurchasedItemDetailLogicProps {
  isOpen: boolean;
  item: ShoppingListItem | null;
  onDeleteClick: (item: ShoppingListItem) => void;
  onClose: () => void;
}

export const usePurchasedItemDetailLogic = ({
  isOpen,
  item,
  onDeleteClick,
  onClose,
}: UsePurchasedItemDetailLogicProps) => {
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

  const handleDeleteConfirm = () => {
    if (item) {
      onDeleteClick(item);
    }
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

  return {
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingHistory,
    currentStats,
    latestBatch,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isEditingNote,
    setIsEditingNote,
    noteText,
    setNoteText,
    isSavingNote,
    handleSaveNote,
    handleCancelNote,
    handleDeleteConfirm,
  };
};
