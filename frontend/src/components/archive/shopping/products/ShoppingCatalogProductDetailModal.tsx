// src/components/archive/shopping/products/ShoppingCatalogProductDetailModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import MobileBaseModal from '@/mobile/components/modals/MobileBaseModal';
import {
  ShoppingIcon,
  CloseIcon,
  EditIcon,
  CheckIcon,
} from '@/components/shared/utils/Icons';
import {
  fetchCommunityPrices,
  updateShoppingProduct,
  shoppingQueryKeys,
} from '@/api/shoppingApi';
import { useAuth } from '@/context/AuthContext';
import { ShoppingItemDetailBrandsPanel } from '@/components/shared/shopping/ShoppingItemDetailBrandsPanel';
import { ShoppingItemPriceHistoryPanel } from '@/components/shared/shopping/ShoppingItemPriceHistoryPanel';
import { MobileShoppingItemInsightsTabs } from '@/mobile/components/modals/shopping/MobileShoppingItemInsightsTabs';
import { computePriceStatistics } from '@/components/shared/shopping/shoppingPriceUtils';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import type { PriceStatsData } from '@/components/shared/shopping/ShoppingItemPriceAnalysisCard';
import type { CommunityPriceRecord, ShoppingListItem } from '@/types/shopping';
import type { EnrichedCatalogProduct } from './useShoppingArchiveProductsLogic';

interface ShoppingCatalogProductDetailModalProps {
  isOpen: boolean;
  isMobile: boolean;
  product: EnrichedCatalogProduct | null;
  onClose: () => void;
}

const capitalizeFirst = (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const ShoppingCatalogProductDetailModal: React.FC<
  ShoppingCatalogProductDetailModalProps
> = ({ isOpen, isMobile, product, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isSuperuser = Boolean(user?.is_superuser);

  const [view, setView] = useState<'personal' | 'community'>('personal');
  const [communityPrices, setCommunityPrices] = useState<CommunityPriceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !product) {
      setCommunityPrices([]);
      setIsEditingName(false);
      setNameError(null);
      return;
    }

    setDraftName(product.displayName);
    setIsEditingName(false);
    setNameError(null);

    let cancelled = false;
    const loadCommunity = async () => {
      setIsLoadingHistory(true);
      try {
        const res = await fetchCommunityPrices(product.product.id);
        if (!cancelled) {
          setCommunityPrices(res);
        }
      } catch {
        if (!cancelled) setCommunityPrices([]);
      } finally {
        if (!cancelled) setIsLoadingHistory(false);
      }
    };
    loadCommunity();

    return () => {
      cancelled = true;
    };
  }, [isOpen, product?.product.id, product?.displayName]);

  const virtualItem = useMemo<ShoppingListItem | null>(() => {
    if (!product) return null;
    return {
      id: 0,
      shoppingListId: 0,
      productId: product.product.id,
      productName: product.displayName,
      nameNormalized: product.product.nameNormalized,
      brandId: product.product.brandId ?? null,
      brandName: product.product.brandName ?? null,
      quantity: 1,
      unitCodeName: product.lastUnitName ?? null,
      isPurchased: false,
      inventoryBatches: product.batches,
    };
  }, [product]);

  const currentStats = useMemo<PriceStatsData | null>(() => {
    if (!product) return null;
    const records = view === 'personal' ? product.batches : communityPrices;
    const computed = computePriceStatistics(records);
    if (computed.count === 0 || computed.avg == null || computed.bestPrice == null) {
      return null;
    }
    const rawUnit = computed.bestUnit || product.lastUnitName || '';
    const formattedUnit = rawUnit ? formatUnitForQuantity(rawUnit, 1) || rawUnit : '';
    return {
      avg: computed.avg,
      bestPrice: computed.bestPrice,
      bestSupplier: computed.bestSupplier,
      bestDate: computed.bestDate,
      unit: formattedUnit,
      count: computed.count,
    };
  }, [product, view, communityPrices]);

  if (!isOpen || !product || !virtualItem) return null;

  const formattedTitle = capitalizeFirst(product.displayName);

  const handleSaveName = async () => {
    const trimmed = draftName.trim();
    if (!trimmed) return;
    setIsSavingName(true);
    setNameError(null);
    try {
      await updateShoppingProduct(product.product.id, { name: trimmed });
      await queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.products() });
      setIsEditingName(false);
    } catch (err: unknown) {
      setNameError(
        err instanceof Error && err.message ? err.message : 'Impossibile aggiornare il nome.'
      );
    } finally {
      setIsSavingName(false);
    }
  };

  const summaryCard = (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-lime-50 border border-lime-200 text-lime-700 flex items-center justify-center shrink-0">
            <ShoppingIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Prodotto Catalogo
            </p>
            {isEditingName ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="flex-1 min-w-0 px-2.5 py-1 text-sm font-bold border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSavingName || !draftName.trim()}
                  className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                  title="Salva nome"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingName(false);
                    setDraftName(product.displayName);
                    setNameError(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                  title="Annulla"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-lg font-extrabold text-slate-900 truncate">
                  {formattedTitle}
                </h2>
                {isSuperuser && (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Rinomina prodotto (Admin)"
                  >
                    <EditIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {!isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {nameError && (
        <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
          {nameError}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase text-slate-400">Marche</p>
          <p className="text-sm font-extrabold text-slate-800">{product.brands.length}</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase text-slate-400">Acquisti</p>
          <p className="text-sm font-extrabold text-slate-800">{product.purchaseCount}</p>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-bold uppercase text-slate-400">Ultimo</p>
          <p className="text-sm font-extrabold text-emerald-700">
            {product.lastPrice != null ? `€${product.lastPrice.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileBaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-2 min-w-0">
            <ShoppingIcon className="w-5 h-5 text-lime-700 shrink-0" />
            <span className="truncate">{formattedTitle}</span>
          </div>
        }
      >
        <div className="space-y-3 pb-4">
          {summaryCard}
          <MobileShoppingItemInsightsTabs
            item={virtualItem}
            view={view}
            onViewChange={setView}
            personalBatches={product.batches}
            communityPrices={communityPrices}
            isLoadingHistory={isLoadingHistory}
            currentStats={currentStats}
          />
        </div>
      </MobileBaseModal>
    );
  }

  const desktopModal = (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 pointer-events-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="flex flex-col lg:flex-row gap-4 items-stretch w-full max-w-6xl max-h-[85vh] justify-center pointer-events-none"
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingItemDetailBrandsPanel
          item={virtualItem}
          personalBatches={product.batches}
          communityPrices={communityPrices}
          className="w-full lg:w-76 shrink-0"
        />

        <ShoppingItemPriceHistoryPanel
          view={view}
          onViewChange={setView}
          personalBatches={product.batches}
          communityPrices={communityPrices}
          isLoading={isLoadingHistory}
          currentStats={currentStats}
          className="w-full lg:w-[390px] shrink-0"
        />

        <div className="pointer-events-auto shrink-0 w-full lg:w-[340px] flex flex-col gap-4">
          {summaryCard}
        </div>
      </div>
    </div>
  );

  return createPortal(desktopModal, document.body);
};

export default ShoppingCatalogProductDetailModal;
