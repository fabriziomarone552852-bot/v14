// frontend/src/utils/quoteUtils.ts
import type { Quote } from '@/types';

/** Chiave di memorizzazione nel localStorage per tracciare il mazzo di citazioni */
export const QUOTES_STORAGE_KEY = 'smart_agenda_quotes_history_v1';

export interface QuoteHistoryStorage {
  lastDate: string; // 'YYYY-MM-DD'
  todayQuoteId: number;
  usedQuoteIds: number[];
}

/** Fallback di sicurezza iniziale */
export const DEFAULT_FALLBACK_QUOTE: Quote = {
  id: 1,
  text: "Non è perché le cose sono difficili che non osiamo, è perché non osiamo che sono difficili.",
  author: "Lucio Anneo Seneca",
};

export const DEFAULT_QUOTES_POOL: Quote[] = [DEFAULT_FALLBACK_QUOTE];


/**
 * Converte una data in stringa 'YYYY-MM-DD' nel fuso orario locale.
 */
export const toLocalDateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calcola il giorno progressivo dell'anno per una data specificata (1-366).
 */
export const getDayOfYear = (date: Date = new Date()): number => {
  const utcDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const utcStart = Date.UTC(date.getFullYear(), 0, 1);
  return Math.floor((utcDate - utcStart) / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Esegue il parsing di una riga CSV gestendo virgolette e delimitatori.
 */
const parseCsvLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // salta la seconda virgoletta di escape
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

/**
 * Converte il testo di un file CSV in una lista tipizzata di Quote[].
 * Supporta delimitatori ';' e ',' e legge le intestazioni id, author, text.
 */
export const parseQuotesCsv = (csvText: string): Quote[] => {
  if (!csvText || !csvText.trim()) {
    return [];
  }

  // Rimuove l'eventuale BOM UTF-8 iniziale
  const cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  // Rileva il delimitatore preferito (; per Excel italiano o , per standard)
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = parseCsvLine(headerLine, delimiter).map((h) => h.toLowerCase().replace(/"/g, ''));

  let idIdx = headers.indexOf('id');
  let authorIdx = headers.indexOf('author');
  let textIdx = headers.indexOf('text');

  // Se non c'è intestazione riconosciuta, usa posizioni di default (0: id, 1: author, 2: text)
  const hasHeader = idIdx !== -1 || authorIdx !== -1 || textIdx !== -1;
  const startIndex = hasHeader ? 1 : 0;

  if (!hasHeader) {
    idIdx = 0;
    authorIdx = 1;
    textIdx = 2;
  } else {
    if (idIdx === -1) idIdx = 0;
    if (authorIdx === -1) authorIdx = 1;
    if (textIdx === -1) textIdx = 2;
  }

  const quotes: Quote[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i], delimiter);
    if (fields.length < 2) continue;

    const rawId = parseInt(fields[idIdx], 10);
    const id = isNaN(rawId) ? i + 1 : rawId;
    const author = (fields[authorIdx] || 'Anonimo').replace(/^"|"$/g, '').trim();
    const text = (fields[textIdx] || '').replace(/^"|"$/g, '').trim();

    if (text) {
      quotes.push({ id, author, text });
    }
  }

  return quotes;
};

/**
 * Carica lo storico delle citazioni dal localStorage.
 */
export const loadQuoteHistory = (): QuoteHistoryStorage | null => {
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'lastDate' in parsed &&
      'todayQuoteId' in parsed &&
      'usedQuoteIds' in parsed &&
      Array.isArray((parsed as QuoteHistoryStorage).usedQuoteIds)
    ) {
      return parsed as QuoteHistoryStorage;
    }
  } catch {
    // In caso di errore nel parsing del localStorage, riparte pulito
  }
  return null;
};

/**
 * Salva lo storico delle citazioni nel localStorage.
 */
export const saveQuoteHistory = (state: QuoteHistoryStorage): void => {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignora errori di storage (es. quota o navigazione anonima protetta)
  }
};

/**
 * Seleziona la citazione del giorno pescando a caso dal mazzo di carte
 * senza ripetizioni fino all'esaurimento di tutte le citazioni disponibili.
 *
 * Durante la stessa giornata, restituisce sempre la medesima citazione.
 */
export const getOrPickDailyQuote = (
  pool: Quote[] = DEFAULT_QUOTES_POOL,
  date: Date = new Date()
): Quote => {
  if (pool.length === 0) {
    return DEFAULT_FALLBACK_QUOTE;
  }

  const todayKey = toLocalDateKey(date);
  const history = loadQuoteHistory();

  // 1. Se per oggi abbiamo già pescato una citazione e questa esiste ancora nel pool, usala
  if (history && history.lastDate === todayKey) {
    const existingQuote = pool.find((q) => q.id === history.todayQuoteId);
    if (existingQuote) {
      return existingQuote;
    }
  }

  // 2. Nuovo giorno (o primo avvio): filtra le citazioni non ancora usate
  const usedIds = history ? history.usedQuoteIds : [];
  let availableCandidates = pool.filter((q) => !usedIds.includes(q.id));

  // 3. Se tutte le citazioni sono state usate (mazzo finito), svuota lo storico e rimescola
  let updatedUsedIds: number[] = usedIds;
  if (availableCandidates.length === 0) {
    updatedUsedIds = [];
    // Evita di pescare immediatamente l'ultima citazione mostrata ieri se il pool ha più di 1 elemento
    const lastQuoteId = history ? history.todayQuoteId : null;
    availableCandidates =
      pool.length > 1 && lastQuoteId !== null
        ? pool.filter((q) => q.id !== lastQuoteId)
        : pool;

    if (availableCandidates.length === 0) {
      availableCandidates = pool;
    }
  }

  // 4. Estrae a caso una citazione tra i candidati disponibili
  const randomIndex = Math.floor(Math.random() * availableCandidates.length);
  const selectedQuote = availableCandidates[randomIndex];

  // 5. Salva lo stato aggiornato
  saveQuoteHistory({
    lastDate: todayKey,
    todayQuoteId: selectedQuote.id,
    usedQuoteIds: [...updatedUsedIds, selectedQuote.id],
  });

  return selectedQuote;
};

/**
 * Scarica il file CSV `/quotes.csv` e restituisce il pool di citazioni.
 * In caso di errore o file mancante, restituisce il database predefinito.
 */
export const fetchQuotesFromCsv = async (): Promise<Quote[]> => {
  try {
    const response = await fetch('/quotes.csv', { cache: 'no-cache' });
    if (!response.ok) {
      return DEFAULT_QUOTES_POOL;
    }
    const text = await response.text();
    const parsed = parseQuotesCsv(text);
    return parsed.length > 0 ? parsed : DEFAULT_QUOTES_POOL;
  } catch {
    return DEFAULT_QUOTES_POOL;
  }
};

/**
 * Funzione legacy mantenuta per retrocompatibilità.
 */
export const getQuoteOfTheDay = (date: Date = new Date()): Quote => {
  return getOrPickDailyQuote(DEFAULT_QUOTES_POOL, date);
};

/**
 * Restituisce una citazione casuale pescando dal mazzo, escludendo l'ID specificato.
 */
export const getRandomQuote = (excludeId?: number, pool: Quote[] = DEFAULT_QUOTES_POOL): Quote => {
  const candidates: Quote[] =
    excludeId !== undefined ? pool.filter((q: Quote) => q.id !== excludeId) : pool;

  if (candidates.length === 0) {
    return pool[0] || DEFAULT_FALLBACK_QUOTE;
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};
