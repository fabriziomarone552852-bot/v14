// src/components/archive/shopping/price/useProductPriceModalStats.ts
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCommunityPrices, type CommunityPriceRecord } from '@/api/shoppingApi';
import type { ProductPriceSummary } from '../ShoppingPriceTableRow';
import { formatUnitForQuantity } from '@/components/shared/shopping/ShoppingUnitSelect';
import type { LookbackUnit } from '@/components/shared/shopping/LookbackUnitSelect';
import {
  computeCutoffDate,
  computePriceStatistics,
} from '@/components/shared/shopping/shoppingPriceUtils';

export type PriceSourceTab = 'personal' | 'community';

export interface UseProductPriceModalStatsProps {
  isOpen: boolean;
  productSummary: ProductPriceSummary | null;
}

export const useProductPriceModalStats = ({
  isOpen,
  productSummary,
}: UseProductPriceModalStatsProps) => {
  const [lookbackValue, setLookbackValue] = useState<number>(1);
  const [lookbackUnit, setLookbackUnit] = useState<LookbackUnit>('years');
  const [view, setView] = useState<PriceSourceTab>('personal');

  const productId = productSummary?.productId ?? 0;

  // Caricamento prezzi dalla community (Lazy loading)
  const { data: communityPrices = [], isLoading: isLoadingCommunity } = useQuery<CommunityPriceRecord[]>({
    queryKey: ['community_prices', productId],
    queryFn: () => (productId ? fetchCommunityPrices(productId) : Promise.resolve([])),
    enabled: isOpen && Boolean(productId),
    staleTime: 60_000,
  });

  // Data limite per il calcolo delle statistiche
  const cutoffDate = useMemo(() => {
    return computeCutoffDate(lookbackValue, lookbackUnit);
  }, [lookbackValue, lookbackUnit]);

  const personalBatches = productSummary?.batches || [];

  // Verifica se i record condividono una sola unità
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

  // Calcolo statistiche per la vista attiva (Miei acquisti vs Community)
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
    communityPrices,
    isLoadingCommunity,
    personalBatches,
    isSingleUnit,
    commonUnit,
    commonUnitDisplay,
    stats,
  };
};
