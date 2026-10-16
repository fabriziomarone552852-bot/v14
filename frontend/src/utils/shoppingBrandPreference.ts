// src/utils/shoppingBrandPreference.ts
import type { ShoppingProductOption } from '@/types/shopping';

export type BrandSentiment = 'positive' | 'negative' | 'neutral';

export interface BrandPreference {
  sentiment: BrandSentiment;
  comment: string;
  rawNotes: string;
}

/**
 * Analizza le note associate al legame Prodotto-Brand (shopping_product_brands.notes)
 * ed estrae il sentiment (👍 Gradito, 👎 Da evitare, ⚪ Neutro) e il commento pulito.
 */
export function parseBrandPreference(notes?: string | null): BrandPreference | null {
  if (!notes || !notes.trim()) return null;
  const raw = notes.trim();

  // 1. Riconoscimento esplicito prefisso / emoji positiva
  if (
    raw.startsWith('👍') ||
    raw.startsWith('[+]') ||
    raw.toLowerCase().startsWith('consigliato') ||
    raw.toLowerCase().startsWith('gradito')
  ) {
    const comment = raw
      .replace(/^(\ud83d\udc4d|\[\+\]|consigliato:?|gradito:?)\s*/i, '')
      .replace(/^[-–—:]\s*/, '')
      .trim();
    return {
      sentiment: 'positive',
      comment,
      rawNotes: raw,
    };
  }

  // 2. Riconoscimento esplicito prefisso / emoji negativa
  if (
    raw.startsWith('👎') ||
    raw.startsWith('[-]') ||
    raw.toLowerCase().startsWith('sconsigliato') ||
    raw.toLowerCase().startsWith('da evitare') ||
    raw.toLowerCase().startsWith('non comprare') ||
    raw.toLowerCase().startsWith('non ricomprare')
  ) {
    const comment = raw
      .replace(/^(\ud83d\udc4e|\[-\]|sconsigliato:?|da evitare:?|non comprare:?|non ricomprare:?)\s*/i, '')
      .replace(/^[-–—:]\s*/, '')
      .trim();
    return {
      sentiment: 'negative',
      comment,
      rawNotes: raw,
    };
  }

  // 3. Riconoscimento da parole chiave nel corpo della nota
  const lower = raw.toLowerCase();
  const isNegative =
    lower.includes('non ricomprare') ||
    lower.includes('non comprare') ||
    lower.includes('non buono') ||
    lower.includes('pessimo') ||
    lower.includes('sconsigliato') ||
    lower.includes('da evitare') ||
    lower.includes('sgradevole') ||
    lower.includes('troppo acido') ||
    lower.includes('scadente');

  if (isNegative) {
    return {
      sentiment: 'negative',
      comment: raw,
      rawNotes: raw,
    };
  }

  const isPositive =
    lower.includes('da ricomprare') ||
    lower.includes('buono') ||
    lower.includes('buona') ||
    lower.includes('ottimo') ||
    lower.includes('ottima') ||
    lower.includes('consigliato') ||
    lower.includes('consigliata') ||
    lower.includes('preferito') ||
    lower.includes('gradito');

  if (isPositive) {
    return {
      sentiment: 'positive',
      comment: raw,
      rawNotes: raw,
    };
  }

  return {
    sentiment: 'neutral',
    comment: raw,
    rawNotes: raw,
  };
}

/**
 * Compone la stringa formattata da salvare nel DB a partire dal sentiment e dal commento opzionale.
 */
export function formatBrandPreference(
  sentiment: BrandSentiment,
  comment?: string | null
): string | null {
  const cleanComment = (comment || '').trim();

  if (sentiment === 'positive') {
    return cleanComment ? `👍 ${cleanComment}` : '👍 Consigliato';
  }
  if (sentiment === 'negative') {
    return cleanComment ? `👎 ${cleanComment}` : '👎 Da evitare';
  }
  return cleanComment || null;
}

/**
 * Cerca se per il dato prodotto e marchio esiste già una valutazione salvata in memoria (RAM).
 */
export function findBrandPreferenceInProducts(
  products: ShoppingProductOption[],
  productName?: string | null,
  brandName?: string | null
): BrandPreference | null {
  const pName = (productName || '').trim().toLowerCase();
  const bName = (brandName || '').trim().toLowerCase();
  if (!pName || !bName) return null;

  const matchedProduct = products.find(
    (p) => (p?.displayName || p?.nameNormalized || '').toLowerCase() === pName
  );
  if (!matchedProduct || !matchedProduct.productBrands) return null;

  const matchedBrandLink = matchedProduct.productBrands.find((pb) => {
    const linkBName = (pb.brand?.nameNormalized || '').toLowerCase();
    return linkBName === bName;
  });

  if (!matchedBrandLink || !matchedBrandLink.notes) return null;
  return parseBrandPreference(matchedBrandLink.notes);
}
