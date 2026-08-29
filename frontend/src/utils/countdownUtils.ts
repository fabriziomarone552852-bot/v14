import type { RawCountdown } from '@/types';
import type { CountdownItem } from '@/components/day/CountdownWidget';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

/**
 * TRASFORMATORE PER I COUNTDOWN
 * Converte i dati crudi provenienti dal DB nel formato rigoroso richiesto dalla UI.
 */
export const mapToCountdownItems = (rawCountdowns: RawCountdown[] | undefined): CountdownItem[] => {
  if (!rawCountdowns || rawCountdowns.length === 0) {
    return [];
  }

  return rawCountdowns.map((c) => ({
    id: c.id,
    
    // 🪄 MAGIA: Usiamo ?? per sovrascrivere SOLO se il dato è null o undefined
    title: c.title ?? c.testo ?? 'Senza Titolo',
    
    targetDateStr: c.target_date ?? c.data_riferimento ?? '',
    
    imageUrl: c.immagine_url ?? DEFAULT_COVER_IMAGE,

    immaginePosizione: c.immagine_posizione || 'center'
  }));
};