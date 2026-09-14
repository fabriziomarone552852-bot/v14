// src/utils/imageUtils.ts
import { apiUrl } from '@/api/client';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

/**
 * Risolve un URL immagine (relativo o assoluto) per renderlo utilizzabile
 * sia in ambiente Web sia su App Mobile Capacitor con proxy Tailscale.
 */
export const resolveImageUrl = (
  url?: string | null,
  fallback: string = DEFAULT_COVER_IMAGE
): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const clean = url.trim();

  // Se è già un URL assoluto, data-uri o blob-uri, lo restituisce intatto
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // Se è un percorso relativo del server (es. /uploads/...), usa apiUrl
  if (clean.startsWith('/')) {
    return apiUrl(clean);
  }

  return clean;
};
