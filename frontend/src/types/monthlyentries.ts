// frontend/src/types/monthlyentries.ts

/** Codici per i mood (valori numerici 0-10 in monthly_field). */
export const MOOD_TYPES = ['MJ', 'MS', 'MA', 'MD', 'MT'] as const;
/** Codici per le sfere di influenza (valori numerici 0-10 in monthly_field). */
export const SPHERE_TYPES = ['SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW'] as const;
/** Tutti i tipi che hanno un valore numerico 0-10 nel campo monthly_field. */
export const NUMERIC_MONTHLY_TYPES = [...MOOD_TYPES, ...SPHERE_TYPES] as const;
/** Tipi testuali: eventi, obiettivi, priorità e risposte review. */
export const TEXT_MONTHLY_TYPES = ['EP', 'EN', 'OM', 'PM', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'TG'] as const;
/** Tipi che possono avere record multipli per mese. */
export const MULTI_RECORD_TYPES = ['EP', 'EN', 'PM', 'TG'] as const;

export type MoodType = typeof MOOD_TYPES[number];
export type SphereType = typeof SPHERE_TYPES[number];
export type NumericMonthlyType = typeof NUMERIC_MONTHLY_TYPES[number];
export type TextMonthlyType = typeof TEXT_MONTHLY_TYPES[number];
export type MonthlyType = NumericMonthlyType | TextMonthlyType;

// Nomi leggibili per la UI — usati dai grafici e dalla TrackerPanel
export const MOOD_LABELS: Record<MoodType, string> = {
  MJ: 'Gioia', MS: 'Tristezza', MA: 'Rabbia', MD: 'Disgusto', MT: 'Paura',
};
export const SPHERE_LABELS: Record<SphereType, string> = {
  SC: 'Coppia', SF: 'Famiglia', SA: 'Amici', SH: 'Salute',
  SS: 'Mente', SD: 'Svago', SM: 'Finanze', SW: 'Lavoro',
};

// Nomi usati nelle UI dei grafici (manteniamo compatibilità con TrackerPanel)
export const MOOD_NAMES = ['Gioia', 'Tristezza', 'Rabbia', 'Disgusto', 'Paura'] as const;
export const SPHERE_NAMES = ['Coppia', 'Famiglia', 'Amici', 'Svago', 'Mente', 'Lavoro', 'Finanze', 'Salute'] as const;
export type FixedMoodName = typeof MOOD_NAMES[number];
export type FixedSphereName = typeof SPHERE_NAMES[number];
export type TrackerName = FixedMoodName | FixedSphereName;
export type TrackerCategory = 'MOOD' | 'SPHERE';

/** Record dal DB con i nuovi campi schema. */
export interface DbMonthlyEntry {
  id: number;
  user_id: number;
  year: number;
  month: number;
  monthly_type: MonthlyType;
  monthly_field: string | null;
}

export type MonthlyEntryResponse = DbMonthlyEntry;

/** Discriminatore type-safe: restituisce true se il tipo usa un valore numerico 0-10. */
export function isNumericMonthlyType(type: string): type is NumericMonthlyType {
  return (NUMERIC_MONTHLY_TYPES as readonly string[]).includes(type);
}

/** Estrae il valore numerico da un entry di tipo numerico. Ritorna 0 se non parseable. */
export function getNumericValue(entry: DbMonthlyEntry): number {
  if (!entry.monthly_field) return 0;
  const parsed = parseInt(entry.monthly_field, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/** Item per il TrackerPanel (grafici polari mood/sfere). */
export interface TrackerItem {
  id: string;
  name: TrackerName;
  category: TrackerCategory;
  colorHex: string;
  currentValue: number;
  previousValue: number;
}