// src/components/trackers/shared/platformUtils.ts

/**
 * Piattaforme di default comuni a tutti i tracker (Serie TV, Film e futuri media).
 * Ordinate alfabeticamente A-Z.
 */
export const DEFAULT_TRACKER_PLATFORMS: string[] = [
  'Apple TV+',
  'Cinema',
  'Disney+',
  'DVD / Blu-Ray',
  'Netflix',
  'Paramount+',
  'Pirati 🏴‍☠️',
  'Prime Video',
  'Sky / NOW',
  'TV (In chiaro)',
];

/**
 * Unisce le piattaforme di default con quelle personalizzate dell'utente salvate nel DB
 * e le restituisce ordinate alfabeticamente (A-Z) senza duplicati.
 */
export const buildUnifiedPlatforms = (dbPlatforms: Array<{ name: string }> = []): string[] => {
  const platformSet = new Set<string>();

  DEFAULT_TRACKER_PLATFORMS.forEach((p) => platformSet.add(p.trim()));

  dbPlatforms.forEach((p) => {
    if (p.name && p.name.trim()) {
      platformSet.add(p.name.trim());
    }
  });

  return Array.from(platformSet).sort((a, b) =>
    a.localeCompare(b, 'it', { sensitivity: 'base' })
  );
};
