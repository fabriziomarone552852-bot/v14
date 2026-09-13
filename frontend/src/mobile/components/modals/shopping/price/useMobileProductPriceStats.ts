// src/mobile/components/modals/shopping/price/useMobileProductPriceStats.ts
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCommunityPrices, type CommunityPriceRecord } from '@/api/shoppingApi';
import type { ProductPriceSummary } from '@/components/archive/shopping/ShoppingPriceTableRow';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import type { LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';

export type PriceSourceTab = 'personal' | 'community';

export interface UseMobileProductPriceStatsProps {
  isOpen: boolean;
  productSummary: ProductPriceSummary | null;
}

export function useMobileProductPriceStats({
  isOpen,
  productSummary,
}: UseMobileProductPriceStatsProps) {
  const [lookbackValue, setLookbackValue] = useState<number>(1);
  const [lookbackUnit, setLookbackUnit] = useState<LookbackUnit>('years');
  const [view, setView] = useState<PriceSourceTab>('personal');

  const productId = productSummary?.productId ?? 0;

  const { data: communityPrices = [], isLoading: isLoadingCommunity } = useQuery<CommunityPriceRecord[]>({
    queryKey: ['community_prices', productId],
    queryFn: () => (productId ? fetchCommunityPrices(productId) : Promise.resolve([])),
    enabled: isOpen && Boolean(productId),
    staleTime: 60_000,
  });

  const cutoffDate = useMemo(() => {
    return computeCutoffDate(lookbackValue, lookbackUnit);
  }, [lookbackValue, lookbackUnit]);

  const personalBatches = useMemo(() => productSummary?.batches || [], [productSummary?.batches]);

  const uniqueUnits = useMemo(() => {
    const set = new Set<string>();
    for (const b of personalBatches) {
      if (b.unitName) set.add(b.unitName);
    }
    return Array.from(set);
  }, [personalBatches]);

  const isSingleUnit = uniqueUnits.length === 1;
  const commonUnit = isSingleUnit ? uniqueUnits[0] : null;
  const commonUnitDisplay = commonUnit ? formatUnitForQuantity(commonUnit, 1) || commonUnit : null;

  const stats = useMemo(() => {
    const sourceRecords = view === 'personal' ? personalBatches : communityPrices;
    return computePriceStatistics(sourceRecords, cutoffDate);
  }, [view, personalBatches, communityPrices, cutoffDate]);

  return {
    lookbackValue,
    setLookbackValue,
    lookbackUnit,
    setLookbackUnit,
    view,
    setView,
    personalBatches,
    communityPrices,
    isLoadingCommunity,
    commonUnitDisplay,
    stats,
  };
}
