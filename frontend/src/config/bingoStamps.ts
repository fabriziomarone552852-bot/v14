// frontend/src/config/bingoStamps.ts

export const STANDARD_STAMPS = [
  'stamp-star',
  'stamp-flower',
  'stamp-fourleaf',
  'stamp-grape',
  'stamp-ladybug',
] as const;

export const EASTER_EGG_STAMP = 'stamp-clown';

export type BingoStampId = (typeof STANDARD_STAMPS)[number] | typeof EASTER_EGG_STAMP | string;

/**
 * Seleziona un timbro in modo casuale:
 * - 1% di probabilità per l'Easter Egg ('stamp-clown')
 * - Il restante 99% viene equamente diviso tra i timbri standard (20% ciascuno dei 5)
 */
export const getRandomStamp = (): string => {
  const rand = Math.random() * 100;
  if (rand < 1.0) {
    return EASTER_EGG_STAMP;
  }
  const standardIndex = Math.floor(Math.random() * STANDARD_STAMPS.length);
  return STANDARD_STAMPS[standardIndex];
};

/**
 * Restituisce il percorso dell'immagine del timbro.
 * Gestisce fallback e retrocompatibilità.
 */
export const getStampSrc = (timbro?: string | null): string => {
  if (!timbro) {
    return '/stamps/stamp-star.png';
  }
  if (timbro.startsWith('/') || timbro.includes('.')) {
    return timbro.startsWith('/') ? timbro : `/stamps/${timbro}`;
  }
  return `/stamps/${timbro}.png`;
};
