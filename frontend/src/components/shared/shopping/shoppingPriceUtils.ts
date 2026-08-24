// src/components/shared/shopping/shoppingPriceUtils.ts
import type { ItemBatchRecord, CommunityPriceRecord } from '@/types/shopping';
import type { LookbackUnit } from './LookbackUnitSelect';

export interface GenericPriceRecord {
  unitPrice?: number | null;
  purchasePrice?: number | null;
  supplierName?: string | null;
  purchaseDate?: string | null;
  unitName?: string | null;
  isOnSale?: boolean;
  listName?: string | null;
}

export interface ComputedPriceStats {
  avg: number | null;
  bestPrice: number | null;
  bestSupplier?: string | null;
  bestDate?: string | null;
  bestUnit?: string | null;
  latestPrice: number | null;
  latestSupplier?: string | null;
  latestDate?: string | null;
  latestUnit?: string | null;
  count: number;
}

/**
 * Calcola la data di cutoff a ritroso nel tempo in base a valore e unità (giorni, mesi, anni)
 */
export function computeCutoffDate(
  lookbackValue: number,
  lookbackUnit: LookbackUnit
): Date {
  const d = new Date();
  const val = Math.max(1, lookbackValue || 1);
  if (lookbackUnit === 'years') {
    d.setFullYear(d.getFullYear() - val);
  } else if (lookbackUnit === 'months') {
    d.setMonth(d.getMonth() - val);
  } else {
    d.setDate(d.getDate() - val);
  }
  return d;
}

/**
 * Calcola statistiche di prezzo (minimo, medio, più recente) su un insieme di rilevazioni,
 * filtrando opzionalmente per data limite (cutoffDate).
 */
export function computePriceStatistics(
  records: (ItemBatchRecord | CommunityPriceRecord | GenericPriceRecord)[],
  cutoffDate?: Date | null
): ComputedPriceStats {
  const valid = records.filter((r) => {
    const p = r.unitPrice != null ? r.unitPrice : ('purchasePrice' in r ? r.purchasePrice : null);
    if (p == null || p <= 0) return false;
    if (cutoffDate && r.purchaseDate) {
      const pDate = new Date(r.purchaseDate);
      if (!isNaN(pDate.getTime()) && pDate < cutoffDate) return false;
    }
    return true;
  });

  if (valid.length === 0) {
    return {
      avg: null,
      bestPrice: null,
      latestPrice: null,
      count: 0,
    };
  }

  let sum = 0;
  let best = valid[0];
  let latest = valid[0];

  for (const r of valid) {
    const p = r.unitPrice != null ? r.unitPrice : ('purchasePrice' in r ? (r.purchasePrice ?? 0) : 0);
    const bestP = best.unitPrice != null ? best.unitPrice : ('purchasePrice' in best ? (best.purchasePrice ?? 0) : 0);

    if (p < bestP) {
      best = r;
    }

    const curT = r.purchaseDate ? new Date(r.purchaseDate).getTime() : 0;
    const latT = latest.purchaseDate ? new Date(latest.purchaseDate).getTime() : 0;
    if (curT > latT) {
      latest = r;
    }

    sum += p;
  }

  const bestPrice = best.unitPrice != null ? best.unitPrice : ('purchasePrice' in best ? best.purchasePrice ?? null : null);
  const latestPrice = latest.unitPrice != null ? latest.unitPrice : ('purchasePrice' in latest ? latest.purchasePrice ?? null : null);

  return {
    avg: sum / valid.length,
    bestPrice,
    bestSupplier: best.supplierName,
    bestDate: best.purchaseDate,
    bestUnit: best.unitName,
    latestPrice,
    latestSupplier: latest.supplierName,
    latestDate: latest.purchaseDate,
    latestUnit: latest.unitName,
    count: valid.length,
  };
}
