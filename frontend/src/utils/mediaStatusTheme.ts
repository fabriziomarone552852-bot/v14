// src/utils/mediaStatusTheme.ts

/**
 * Tipi di stato normalizzati per qualsiasi tipologia di media
 * (Serie TV, Film, Libri, Giochi).
 */
export type NormalizedMediaStatus =
  | 'to_watch'   // Da iniziare / In lista / Da leggere
  | 'watching'   // In corso / In visione / In lettura
  | 'completed'  // Conclusa / Vista / Letta (opera finita)
  | 'waiting'    // In attesa di nuova stagione / uscite future
  | 'on_hold'    // In pausa / Sospesa
  | 'dropped'    // Abbandonata / Mollata
  | 'untracked'; // Non presente nella propria libreria

export type MediaType = 'series' | 'movies' | 'books' | 'default';

export interface MediaStatusThemeConfig {
  id: NormalizedMediaStatus;
  borderColor: string;
  borderThickClass: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  ringColor: string;
  labels: Record<MediaType, string>;
}

export const MEDIA_STATUS_THEMES: Record<NormalizedMediaStatus, MediaStatusThemeConfig> = {
  to_watch: {
    id: 'to_watch',
    borderColor: 'border-gray-400',
    borderThickClass: 'border-[2.5px] border-gray-400',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-300',
    dotColor: 'bg-gray-400',
    ringColor: 'ring-gray-400/20',
    labels: {
      series: 'In lista',
      movies: 'In lista',
      books: 'Da leggere',
      default: 'In lista',
    },
  },
  watching: {
    id: 'watching',
    borderColor: 'border-yellow-400',
    borderThickClass: 'border-[2.5px] border-yellow-400',
    badgeBg: 'bg-yellow-50',
    badgeText: 'text-yellow-700',
    badgeBorder: 'border-yellow-300',
    dotColor: 'bg-yellow-400',
    ringColor: 'ring-yellow-400/20',
    labels: {
      series: 'In visione',
      movies: 'In visione',
      books: 'In lettura',
      default: 'In corso',
    },
  },
  completed: {
    id: 'completed',
    borderColor: 'border-green-500',
    borderThickClass: 'border-[2.5px] border-green-500',
    badgeBg: 'bg-green-50',
    badgeText: 'text-green-700',
    badgeBorder: 'border-green-300',
    dotColor: 'bg-green-500',
    ringColor: 'ring-green-500/20',
    labels: {
      series: 'Completata',
      movies: 'Visto',
      books: 'Letto',
      default: 'Completato',
    },
  },
  waiting: {
    id: 'waiting',
    borderColor: 'border-purple-500',
    borderThickClass: 'border-[2.5px] border-purple-500',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-300',
    dotColor: 'bg-purple-500',
    ringColor: 'ring-purple-500/20',
    labels: {
      series: 'In attesa',
      movies: 'In attesa',
      books: 'In attesa',
      default: 'In attesa',
    },
  },
  on_hold: {
    id: 'on_hold',
    borderColor: 'border-orange-400',
    borderThickClass: 'border-[2.5px] border-orange-400',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-300',
    dotColor: 'bg-orange-400',
    ringColor: 'ring-orange-400/20',
    labels: {
      series: 'In pausa',
      movies: 'In pausa',
      books: 'In pausa',
      default: 'In pausa',
    },
  },
  dropped: {
    id: 'dropped',
    borderColor: 'border-red-500',
    borderThickClass: 'border-[2.5px] border-red-500',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-300',
    dotColor: 'bg-red-500',
    ringColor: 'ring-red-500/20',
    labels: {
      series: 'Abbandonata',
      movies: 'Abbandonato',
      books: 'Abbandonato',
      default: 'Abbandonato',
    },
  },
  untracked: {
    id: 'untracked',
    borderColor: 'border-transparent',
    borderThickClass: 'border border-gray-200',
    badgeBg: 'bg-gray-50',
    badgeText: 'text-gray-400',
    badgeBorder: 'border-gray-200',
    dotColor: 'bg-gray-300',
    ringColor: 'ring-gray-300/20',
    labels: {
      series: 'Non in libreria',
      movies: 'Non in libreria',
      books: 'Non in libreria',
      default: 'Non in libreria',
    },
  },
};

/**
 * Normalizza qualsiasi stringa di stato (e stato esterno come TMDB) in uno stato canonico.
 */
export function normalizeMediaStatus(
  status?: string | null,
  externalStatus?: string | null
): NormalizedMediaStatus {
  if (!status || status === 'untracked') {
    return 'untracked';
  }

  const s = status.toLowerCase().trim();

  // In visione / In lettura / In corso
  if (['watching', 'reading', 'playing', 'in_progress', 'in visione', 'in lettura'].includes(s)) {
    return 'watching';
  }

  // Completata / Vista / Letta
  if (['completed', 'watched', 'read', 'played', 'completata', 'visto', 'letto'].includes(s)) {
    // Se la serie o opera ha ancora stagioni in produzione, diventa 'waiting' (Viola)
    const ext = (externalStatus || '').toLowerCase().trim();
    if (ext === 'returning series' || ext === 'in production' || ext === 'waiting') {
      return 'waiting';
    }
    return 'completed';
  }

  // In attesa diretta
  if (['waiting', 'in attesa', 'in_attesa'].includes(s)) {
    return 'waiting';
  }

  // In pausa
  if (['on_hold', 'paused', 'in_pausa', 'in pausa', 'hold'].includes(s)) {
    return 'on_hold';
  }

  // Abbandonata / Mollata
  if (['dropped', 'abbandonata', 'abbandonato', 'mollata'].includes(s)) {
    return 'dropped';
  }

  // Da iniziare / In lista
  if (['to_watch', 'to_read', 'planned', 'plan_to_watch', 'in_list', 'in lista', 'da iniziare', 'da vedere', 'da leggere'].includes(s)) {
    return 'to_watch';
  }

  // Fallback per stati utente non vuoti: trattali come 'to_watch'
  return 'to_watch';
}

export interface MediaBorderOptions {
  isThick?: boolean;
  fallback?: string;
}

/**
 * Restituisce la classe Tailwind per il bordo in base allo stato personale e al tipo di display.
 */
export function getMediaBorderClass(
  status?: string | null,
  externalStatus?: string | null,
  options?: MediaBorderOptions
): string {
  const normalized = normalizeMediaStatus(status, externalStatus);

  if (normalized === 'untracked') {
    return options?.fallback ?? (options?.isThick ? 'border border-gray-200' : 'border-transparent');
  }

  const config = MEDIA_STATUS_THEMES[normalized];
  return options?.isThick ? config.borderThickClass : config.borderColor;
}

/**
 * Restituisce l'intera configurazione di tema (colori, badge, etichette) per uno stato.
 */
export function getMediaStatusConfig(
  status?: string | null,
  externalStatus?: string | null
): MediaStatusThemeConfig {
  const normalized = normalizeMediaStatus(status, externalStatus);
  return MEDIA_STATUS_THEMES[normalized];
}

/**
 * Restituisce l'etichetta leggibile per l'utente in base alla tipologia di media.
 */
export function getMediaStatusLabel(
  status?: string | null,
  externalStatus?: string | null,
  mediaType: MediaType = 'series'
): string {
  const config = getMediaStatusConfig(status, externalStatus);
  return config.labels[mediaType] || config.labels.default;
}
