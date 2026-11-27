// src/utils/quickPriceUtils.ts
import { getLocalTodayStr } from '@/utils/dateUtils';
import { sanitizeDecimalString, parseDecimalValue } from '@/utils/decimalUtils';

/**
 * Rappresenta una singola riga/scheda di inserimento rapido prezzo
 * condivisa tra vista Desktop (QuickPriceRow) e vista Mobile (QuickPriceItem).
 */
export interface QuickPriceEntry {
  id: string;
  productName: string;
  brandName: string;
  brandId: string;
  price: string;
  priceUnit: string;
  priceTotal: string;
  lastPriceEdited?: 'unit' | 'total';
  quantity: string;
  unitId: string;
  purchaseDate: string;
  supplierId: string;
  isOnSale: boolean;
}

export interface CreateQuickPriceEntryOptions {
  id?: string;
  idPrefix?: string;
  productName?: string;
  purchaseDate?: string;
  supplierId?: string;
}

let quickPriceEntrySeq = 0;

/**
 * Genera un ID univoco deterministico in sessione per una riga/scheda di inserimento rapido prezzi.
 */
export function generateQuickPriceEntryId(prefix = 'row'): string {
  quickPriceEntrySeq += 1;
  return `${prefix}-${quickPriceEntrySeq}`;
}

/**
 * Crea una riga/scheda vuota inizializzata di default con la data odierna
 * (oppure con data/negozio ereditati dallo scontrino precedente).
 */
export function createEmptyQuickPriceEntry(
  options: CreateQuickPriceEntryOptions = {}
): QuickPriceEntry {
  const {
    id,
    idPrefix = 'row',
    productName = '',
    purchaseDate = getLocalTodayStr(),
    supplierId = '',
  } = options;

  return {
    id: id ?? generateQuickPriceEntryId(idPrefix),
    productName,
    brandName: '',
    brandId: '',
    price: '',
    priceUnit: '',
    priceTotal: '',
    lastPriceEdited: 'unit',
    quantity: '1',
    unitId: '',
    purchaseDate,
    supplierId,
    isOnSale: false,
  };
}

/**
 * Sincronizza Prezzo Unitario, Prezzo Totale e Quantità accettando sia virgola che punto.
 */
export function syncQuickPriceEntryAmounts(
  entry: QuickPriceEntry,
  field: 'priceUnit' | 'priceTotal' | 'quantity',
  rawValue: string
): QuickPriceEntry {
  const sanitized = sanitizeDecimalString(rawValue);
  const normalized = sanitized.replace(',', '.');
  const currentQty = Math.max(0.001, parseDecimalValue(entry.quantity, 1) || 1);

  if (field === 'priceUnit') {
    const unitNum = Number(normalized);
    const hasValidNumber = !Number.isNaN(unitNum) && normalized !== '' && normalized !== '.';
    const totalCalc = hasValidNumber ? (unitNum * currentQty).toFixed(2) : '';
    return {
      ...entry,
      priceUnit: sanitized,
      priceTotal: totalCalc,
      price: hasValidNumber ? String(unitNum) : '',
      lastPriceEdited: 'unit',
    };
  }

  if (field === 'priceTotal') {
    const totalNum = Number(normalized);
    const hasValidNumber =
      !Number.isNaN(totalNum) && normalized !== '' && normalized !== '.' && currentQty > 0;
    const unitCalc = hasValidNumber ? (totalNum / currentQty).toFixed(2) : '';
    return {
      ...entry,
      priceTotal: sanitized,
      priceUnit: unitCalc,
      price: unitCalc,
      lastPriceEdited: 'total',
    };
  }

  if (field === 'quantity') {
    const parsedNewQty = parseDecimalValue(sanitized, 1);
    const newQty = parsedNewQty > 0 ? parsedNewQty : 1;
    let newPriceTotal = entry.priceTotal;
    let newPriceUnit = entry.priceUnit;

    if (entry.lastPriceEdited === 'total' && entry.priceTotal.trim() !== '') {
      const tot = parseDecimalValue(entry.priceTotal, NaN);
      if (!Number.isNaN(tot)) {
        newPriceUnit = (tot / newQty).toFixed(2);
      }
    } else if (entry.priceUnit.trim() !== '') {
      const unit = parseDecimalValue(entry.priceUnit, NaN);
      if (!Number.isNaN(unit)) {
        newPriceTotal = (unit * newQty).toFixed(2);
      }
    }

    return {
      ...entry,
      quantity: sanitized,
      priceUnit: newPriceUnit,
      priceTotal: newPriceTotal,
      price: newPriceUnit ? String(parseDecimalValue(newPriceUnit, 0)) : '',
    };
  }

  return { ...entry, [field]: rawValue };
}

/**
 * Aggiorna una riga/scheda nella lista.
 * - Se vengono modificati `purchaseDate` o `supplierId`, propaga il nuovo valore
 *   a cascata dalla riga modificata inclusa fino a tutte le righe successive ("da lì in giù"),
 *   lasciando intatte le righe precedenti (ideale per caricare più scontrini arretrati in sequenza).
 * - Se vengono modificati prezzi o quantità, ricalcola automaticamente gli importi della riga.
 */
export function updateQuickPriceEntriesWithCascade<K extends keyof QuickPriceEntry>(
  entries: QuickPriceEntry[],
  targetId: string,
  field: K,
  value: QuickPriceEntry[K]
): QuickPriceEntry[] {
  const targetIndex = entries.findIndex((entry) => entry.id === targetId);
  if (targetIndex === -1) return entries;

  if (field === 'purchaseDate' || field === 'supplierId') {
    return entries.map((entry, index) => {
      if (index < targetIndex) return entry;
      return { ...entry, [field]: value };
    });
  }

  return entries.map((entry, index) => {
    if (index !== targetIndex) return entry;
    if (field === 'priceUnit' || field === 'priceTotal' || field === 'quantity') {
      return syncQuickPriceEntryAmounts(
        entry,
        field as 'priceUnit' | 'priceTotal' | 'quantity',
        String(value)
      );
    }
    return { ...entry, [field]: value };
  });
}

/**
 * Aggiunge una nuova riga in coda ereditando Data e Negozio dall'ultima riga presente.
 */
export function appendQuickPriceEntryFromLast(
  entries: QuickPriceEntry[],
  options: { id?: string; idPrefix?: string } = {}
): QuickPriceEntry[] {
  const lastEntry = entries[entries.length - 1];
  const nextEntry = createEmptyQuickPriceEntry({
    id: options.id,
    idPrefix: options.idPrefix,
    purchaseDate: lastEntry ? lastEntry.purchaseDate : getLocalTodayStr(),
    supplierId: lastEntry ? lastEntry.supplierId : '',
  });
  return [...entries, nextEntry];
}

/**
 * Rimuove una riga dalla lista. Se era l'unica riga rimasta, la sostituisce con una
 * riga pulita mantenendo però Data e Negozio correnti.
 */
export function removeQuickPriceEntrySafely(
  entries: QuickPriceEntry[],
  targetId: string,
  idPrefix = 'row'
): QuickPriceEntry[] {
  if (entries.length <= 1) {
    const sole = entries[0];
    return [
      createEmptyQuickPriceEntry({
        idPrefix,
        purchaseDate: sole ? sole.purchaseDate : getLocalTodayStr(),
        supplierId: sole ? sole.supplierId : '',
      }),
    ];
  }
  return entries.filter((entry) => entry.id !== targetId);
}
