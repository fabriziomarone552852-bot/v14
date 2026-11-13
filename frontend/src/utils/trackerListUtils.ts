// src/utils/trackerListUtils.ts
import type { MediaList, MediaListItem, TrackerMediaType } from '@/types/trackers';
import type { CatalogStatusTab } from '@/mobile/components/trackers/shared/catalog';
import { resolveImageUrl } from './imageUtils';
import { normalizeMediaStatus } from './mediaStatusTheme';

/**
 * Determina il tipo di media normalizzato di un elemento appartenente a una lista personale.
 * Supporta nativamente 'movie', 'tv' e qualsiasi futuro tracker (es. 'book', 'game', 'anime').
 */
export function getMediaListItemType(item: MediaListItem): TrackerMediaType {
  if (item.media_type === 'movie' || Boolean(item.movie_tmdb_id)) {
    return 'movie';
  }
  if (item.media_type === 'tv' || Boolean(item.series_tmdb_id)) {
    return 'tv';
  }
  return item.media_type || 'tv';
}

/**
 * Estrae l'ID univoco del contenuto associato all'elemento della lista per il tracker specificato.
 */
export function getMediaListItemTargetId(
  item: MediaListItem,
  mediaType?: TrackerMediaType
): number | null {
  const effectiveType = mediaType ?? getMediaListItemType(item);
  if (effectiveType === 'movie') {
    return item.movie_tmdb_id ?? item.movie?.tmdb_id ?? null;
  }
  if (effectiveType === 'tv') {
    return item.series_tmdb_id ?? item.series?.tmdb_id ?? null;
  }
  return item.id ?? null;
}

/**
 * Verifica se un elemento di una lista appartiene effettivamente al tracker specificato.
 */
export function isListItemOfMediaType(
  item: MediaListItem,
  mediaType: TrackerMediaType
): boolean {
  return (
    getMediaListItemType(item) === mediaType &&
    Boolean(getMediaListItemTargetId(item, mediaType))
  );
}

/**
 * Estrae il titolo di fallback salvato direttamente nell'elemento della lista.
 */
export function getMediaListItemFallbackTitle(
  item: MediaListItem,
  mediaType?: TrackerMediaType
): string {
  const effectiveType = mediaType ?? getMediaListItemType(item);
  if (effectiveType === 'movie') {
    return item.movie?.title || 'Film';
  }
  if (effectiveType === 'tv') {
    return item.series?.title || 'Serie TV';
  }
  return 'Titolo';
}

/**
 * Estrae lo stato di fallback salvato nell'elemento della lista.
 */
export function getMediaListItemFallbackStatus(
  item: MediaListItem,
  mediaType?: TrackerMediaType
): string | undefined {
  const effectiveType = mediaType ?? getMediaListItemType(item);
  if (effectiveType === 'tv') {
    return item.series?.status;
  }
  return undefined;
}

/**
 * Estrae la locandina di fallback salvata direttamente nell'elemento della lista
 * (utile quando il titolo non è ancora tracciato nel catalogo personale dell'utente).
 */
export function getMediaListItemFallbackPoster(
  item: MediaListItem,
  mediaType?: TrackerMediaType
): string | null {
  const effectiveType = mediaType ?? getMediaListItemType(item);
  if (effectiveType === 'movie') {
    return item.movie?.poster_path ?? null;
  }
  if (effectiveType === 'tv') {
    return item.series?.poster_path ?? null;
  }
  return null;
}

/**
 * Ritorna solo gli elementi della lista che appartengono al tipo di tracker specificato.
 */
export function filterListItemsByMediaType(
  list: MediaList,
  mediaType: TrackerMediaType
): MediaListItem[] {
  if (!list.items || list.items.length === 0) return [];
  return list.items.filter((item) => isListItemOfMediaType(item, mediaType));
}

/**
 * Ritorna solo le liste personali che contengono almeno un elemento del tipo di tracker specificato.
 */
export function filterListsByMediaType(
  lists: readonly MediaList[] | undefined,
  mediaType: TrackerMediaType
): MediaList[] {
  if (!lists || lists.length === 0) return [];
  return lists.filter((list) => filterListItemsByMediaType(list, mediaType).length > 0);
}

/**
 * Verifica se lo stato di un contenuto soddisfa il tab di stato selezionato.
 */
export function matchesListStatusTab(
  status: string | null | undefined,
  tmdbStatus: string | null | undefined,
  activeTab: CatalogStatusTab
): boolean {
  if (activeTab === 'all') return true;
  const normalized = normalizeMediaStatus(status, tmdbStatus);
  if (activeTab === 'watching') return normalized === 'watching';
  if (activeTab === 'waiting') return normalized === 'waiting';
  if (activeTab === 'completed') return normalized === 'completed';
  if (activeTab === 'to_watch') {
    return (
      normalized === 'to_watch' ||
      normalized === 'dropped' ||
      normalized === 'on_hold' ||
      normalized === 'untracked'
    );
  }
  return true;
}

/**
 * Risolve un percorso locandina grezzo (URL completo, upload locale o path TMDB) in URL visualizzabile.
 */
export function resolveTrackerPosterUrl(
  rawPoster: string | null | undefined,
  tmdbSize: 'w200' | 'w300' = 'w200'
): string | null {
  if (!rawPoster) return null;
  if (rawPoster.startsWith('http') || rawPoster.startsWith('data:')) {
    return rawPoster;
  }
  if (rawPoster.startsWith('/uploads')) {
    return resolveImageUrl(rawPoster);
  }
  return `https://image.tmdb.org/t/p/${tmdbSize}${rawPoster}`;
}
