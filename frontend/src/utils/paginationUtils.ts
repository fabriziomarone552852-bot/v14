// src/utils/paginationUtils.ts
//
// Funzione di utilità per la paginazione "in RAM" (mazzo di carte).
// Usata all'interno dei hook di archivio per evitare duplicazione del calcolo paginazione.

/**
 * Risultato della paginazione: contiene gli elementi della pagina corrente
 * e il numero totale di pagine.
 */
export interface PaginationResult<T> {
  paginatedItems: T[];
  totalPages: number;
}

/**
 * Calcola la paginazione di un array di elementi già filtrati e ordinati.
 *
 * @param items - L'array completo di elementi (già filtrati/ordinati)
 * @param currentPage - La pagina corrente (1-indexed)
 * @param pageSize - Quanti elementi per pagina
 * @returns Gli elementi della pagina corrente e il totale pagine
 *
 * Esempio:
 * ```ts
 * const { paginatedItems, totalPages } = paginate(sortedItems, currentPage, 8);
 * ```
 */
export function paginate<T>(
  items: T[],
  currentPage: number,
  pageSize: number,
): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.max(1, Math.min(currentPage, totalPages));
  const startIdx = (safePage - 1) * pageSize;
  const paginatedItems = items.slice(startIdx, startIdx + pageSize);

  return { paginatedItems, totalPages };
}
