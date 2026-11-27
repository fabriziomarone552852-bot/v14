import type { MediaCreditMember, PeopleFilterMode } from '@/types/people';

const DEPARTMENT_LABELS_IT: Record<string, string> = {
  Acting: 'Attore / Attrice',
  Directing: 'Regia',
  Writing: 'Sceneggiatura',
  Production: 'Produzione',
  Creator: 'Creazione',
  Sound: 'Colonna Sonora',
  Camera: 'Fotografia',
  Editing: 'Montaggio',
  Art: 'Scenografia',
  'Visual Effects': 'Effetti Visivi',
  Costume: 'Costumi',
};

/**
 * Traduce il dipartimento TMDB principale di una persona in un'etichetta leggibile in italiano.
 */
export function formatPersonDepartment(department?: string | null): string | null {
  if (!department) return null;
  return DEPARTMENT_LABELS_IT[department] ?? department;
}

/**
 * Suddivide la stringa di ricerca persone separata da virgole in token unici ordinati.
 */
export function parsePeopleTokens(raw?: string | null): string[] {
  if (!raw || !raw.trim()) return [];
  const seen = new Set<string>();
  const tokens: string[] = [];

  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tokens.push(trimmed);
    }
  }
  return tokens;
}

/**
 * Estrae il frammento di nome attualmente in digitazione dopo l'ultima virgola.
 * Restituisce '' se il testo termina con una virgola (pronto per iniziare il prossimo nome).
 */
export function getActivePersonToken(raw?: string | null): string {
  if (!raw) return '';
  const lastCommaIdx = raw.lastIndexOf(',');
  const segment = lastCommaIdx === -1 ? raw : raw.slice(lastCommaIdx + 1);
  return segment.trim();
}

/**
 * Sostituisce il segmento dopo l'ultima virgola con il nome scelto dall'autocompletamento
 * e prepara automaticamente la virgola per consentire la ricerca della persona successiva.
 */
export function applyPersonSuggestion(raw: string, selectedName: string): string {
  const cleanSelected = selectedName.trim();
  if (!cleanSelected) return raw;

  const lastCommaIdx = raw.lastIndexOf(',');
  const prefixRaw = lastCommaIdx === -1 ? '' : raw.slice(0, lastCommaIdx);
  const existingTokens = parsePeopleTokens(prefixRaw);
  const selectedLower = cleanSelected.toLowerCase();

  const merged = existingTokens.some((t) => t.toLowerCase() === selectedLower)
    ? existingTokens
    : [...existingTokens, cleanSelected];

  return `${merged.join(', ')}, `;
}

/**
 * Rimuove un singolo nominativo dalla lista separata da virgole preservando gli altri token.
 */
export function removePersonToken(raw: string, tokenToRemove: string): string {
  const targetLower = tokenToRemove.trim().toLowerCase();
  const remaining = parsePeopleTokens(raw).filter((token) => token.toLowerCase() !== targetLower);
  if (remaining.length === 0) return '';

  // Se c'era ancora un testo parziale in fondo non ancora chiuso, non lo perdiamo
  const endsWithComma = raw.trimEnd().endsWith(',');
  return endsWithComma ? `${remaining.join(', ')}, ` : remaining.join(', ');
}

/**
 * Verifica in RAM se un film o una serie locale soddisfa il filtro persone (AND / OR).
 * Confronta `credits_summary` ed eventuale fallback testuale `creatorsCsv`.
 */
export function matchesPeopleCreditsFilter(
  creditsSummary: MediaCreditMember[] | null | undefined,
  creatorsCsv: string | null | undefined,
  rawPeople?: string | null,
  mode: PeopleFilterMode = 'AND'
): boolean {
  const tokens = parsePeopleTokens(rawPeople);
  if (tokens.length === 0) return true;

  const namePool: string[] = [];
  const idPool = new Set<string>();

  if (Array.isArray(creditsSummary)) {
    for (const member of creditsSummary) {
      if (member.name) {
        namePool.push(member.name.trim().toLowerCase());
      }
      if (typeof member.id === 'number') {
        idPool.add(String(member.id));
      }
    }
  }

  if (creatorsCsv) {
    for (const creator of creatorsCsv.split(',')) {
      const cleaned = creator.trim().toLowerCase();
      if (cleaned) namePool.push(cleaned);
    }
  }

  if (namePool.length === 0 && idPool.size === 0) {
    return false;
  }

  const matchesSingleToken = (token: string): boolean => {
    const norm = token.toLowerCase();
    if (/^\d+$/.test(norm) && idPool.has(norm)) {
      return true;
    }
    return namePool.some((name) => name.includes(norm));
  };

  return mode === 'OR'
    ? tokens.some(matchesSingleToken)
    : tokens.every(matchesSingleToken);
}

/**
 * Formatta un'etichetta sintetica per badge/header quando è attivo un filtro persone.
 */
export function formatPeopleFilterSummary(rawPeople?: string | null, mode: PeopleFilterMode = 'AND'): string {
  const tokens = parsePeopleTokens(rawPeople);
  if (tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0];
  return tokens.join(mode === 'OR' ? ' o ' : ' + ');
}
