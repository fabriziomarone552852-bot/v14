// src/components/shared/shopping/item/useItemRelatedBrands.ts
import { useMemo, useState } from 'react';
import type {
  CommunityPriceRecord,
  ItemBatchRecord,
  ShoppingListItem,
} from '@/types/shopping';
import { useShoppingData } from '@/hooks/shopping/useShoppingData';
import { useBrandRatingMutation } from '@/hooks/shopping/useBrandRatingMutation';
import {
  formatBrandPreference,
  parseBrandPreference,
  type BrandSentiment,
} from '@/utils/shoppingBrandPreference';

export interface RelatedBrandInfo {
  key: string;
  brandId: number | null;
  brandName: string;
  notes: string | null;
  lastSupplierName: string | null;
  isCurrentItemBrand: boolean;
}

export interface UseItemRelatedBrandsArgs {
  item: ShoppingListItem;
  personalBatches?: ItemBatchRecord[];
  communityPrices?: CommunityPriceRecord[];
}

export function useItemRelatedBrands({
  item,
  personalBatches = [],
  communityPrices = [],
}: UseItemRelatedBrandsArgs) {
  const { products, brands } = useShoppingData();
  const { saveBrandRating } = useBrandRatingMutation();

  const [editingBrandKey, setEditingBrandKey] = useState<string | null>(null);
  const [draftSentiment, setDraftSentiment] = useState<BrandSentiment>('neutral');
  const [draftComment, setDraftComment] = useState<string>('');

  const resolvedProductId = useMemo<number>(() => {
    if (item.productId && item.productId > 0) return item.productId;
    const batchProdId =
      item.inventoryBatches?.[0]?.productId ?? item.inventoryBatches?.[0]?.product_id;
    if (batchProdId && batchProdId > 0) return batchProdId;

    const pName = (item.productName || '').trim().toLowerCase();
    const matched = products.find(
      (p) => (p.displayName || p.nameNormalized || '').trim().toLowerCase() === pName
    );
    return matched?.id ?? 0;
  }, [item.productId, item.productName, item.inventoryBatches, products]);

  const relatedBrands = useMemo<RelatedBrandInfo[]>(() => {
    const pName = (item.productName || '').trim().toLowerCase();
    const fallbackBatchBrand =
      item.inventoryBatches?.[0]?.brandName || item.inventoryBatches?.[0]?.brand_name || '';
    const currentBrandNorm = (item.brandName || fallbackBatchBrand || '').trim().toLowerCase();

    const map = new Map<string, RelatedBrandInfo & { hasCatalogEntry: boolean }>();

    const upsertBrand = (
      rawName?: string | null,
      brandId?: number | null,
      notes?: string | null,
      supplier?: string | null,
      fromCatalog = false
    ) => {
      const cleanName = (rawName || '').trim();
      if (!cleanName) return;
      const norm = cleanName.toLowerCase();
      const existing = map.get(norm);

      const catalogBrandId =
        brandId ??
        brands.find((b) => (b.name || '').trim().toLowerCase() === norm)?.id ??
        null;

      if (!existing) {
        map.set(norm, {
          key: norm,
          brandId: catalogBrandId,
          brandName: cleanName,
          notes: notes ?? null,
          lastSupplierName: supplier || null,
          isCurrentItemBrand: Boolean(currentBrandNorm && norm === currentBrandNorm),
          hasCatalogEntry: fromCatalog,
        });
      } else {
        if (!existing.brandId && catalogBrandId) {
          existing.brandId = catalogBrandId;
        }
        if (fromCatalog) {
          existing.notes = notes ?? null;
          existing.hasCatalogEntry = true;
        } else if (!existing.hasCatalogEntry && !existing.notes && notes) {
          existing.notes = notes;
        }
        if (!existing.lastSupplierName && supplier) {
          existing.lastSupplierName = supplier;
        }
      }
    };

    // 1. Dal catalogo prodotti in RAM (tabella ponte shopping_product_brands)
    const matchedProducts = products.filter((p) => {
      if (resolvedProductId > 0 && p.id === resolvedProductId) return true;
      const candidateName = (p.displayName || p.nameNormalized || '').trim().toLowerCase();
      return Boolean(pName && candidateName === pName);
    });

    for (const prod of matchedProducts) {
      if (prod.productBrands && prod.productBrands.length > 0) {
        for (const pb of prod.productBrands) {
          const bName =
            pb.brand?.nameNormalized ||
            brands.find((b) => b.id === pb.brandId)?.name ||
            '';
          upsertBrand(bName, pb.brandId, pb.notes, pb.lastSupplierName, true);
        }
      } else if (prod.brandName) {
        upsertBrand(prod.brandName, prod.brandId, null, prod.lastSupplierName, false);
      }
    }

    // 2. Eventuale brand impostato direttamente sull'articolo in lista o nei lotti allegati
    if (item.brandName) {
      upsertBrand(
        item.brandName,
        item.brandId,
        item.brandNotes,
        item.lastSupplierName
      );
    }

    for (const invBatch of item.inventoryBatches ?? []) {
      const invBrand = invBatch.brandName || invBatch.brand_name;
      const invSupplier = invBatch.supplierName || invBatch.supplier_name;
      if (invBrand) {
        upsertBrand(invBrand, invBatch.brandId ?? invBatch.brand_id, null, invSupplier);
      }
    }

    // 3. Eventuali brand registrati nello storico acquisti personali o community
    for (const batch of personalBatches) {
      if (batch.brandName) {
        upsertBrand(batch.brandName, batch.brandId, null, batch.supplierName);
      }
    }
    for (const cp of communityPrices) {
      if (cp.brandName) {
        upsertBrand(cp.brandName, null, null, cp.supplierName);
      }
    }

    const sentimentRank = (notes: string | null): number => {
      const pref = parseBrandPreference(notes);
      if (pref?.sentiment === 'positive') return 0;
      if (pref?.sentiment === 'negative') return 2;
      return 1;
    };

    return Array.from(map.values()).sort((a, b) => {
      if (a.isCurrentItemBrand && !b.isCurrentItemBrand) return -1;
      if (!a.isCurrentItemBrand && b.isCurrentItemBrand) return 1;
      const rankDiff = sentimentRank(a.notes) - sentimentRank(b.notes);
      if (rankDiff !== 0) return rankDiff;
      return a.brandName.localeCompare(b.brandName, 'it');
    });
  }, [item, resolvedProductId, products, brands, personalBatches, communityPrices]);

  const handleOpenEditBrand = (entry: RelatedBrandInfo) => {
    const parsed = parseBrandPreference(entry.notes);
    setEditingBrandKey(entry.key);
    setDraftSentiment(parsed?.sentiment ?? 'neutral');
    setDraftComment(parsed?.comment ?? '');
  };

  const handleCancelEdit = () => {
    setEditingBrandKey(null);
    setDraftSentiment('neutral');
    setDraftComment('');
  };

  const handleSaveEdit = (entry: RelatedBrandInfo) => {
    if (!resolvedProductId) return;
    const formattedNotes = formatBrandPreference(draftSentiment, draftComment);
    setEditingBrandKey(null);
    saveBrandRating({
      productId: resolvedProductId,
      productName: item.productName,
      brandId: entry.brandId,
      brandName: entry.brandName,
      shoppingListId: item.shoppingListId,
      notes: formattedNotes,
    });
  };

  return {
    relatedBrands,
    editingBrandKey,
    draftSentiment,
    setDraftSentiment,
    draftComment,
    setDraftComment,
    handleOpenEditBrand,
    handleCancelEdit,
    handleSaveEdit,
  };
}
