// src/types/yearlyentries.ts
import { getTrackerColor } from '@/utils/trackerUtils';

/** Tipi mood annuali — stessi codici del mensile per riuso componenti */
export const YEARLY_MOOD_TYPES = ['MJ', 'MS', 'MA', 'MD', 'MT'] as const;
/** Tipi sfere annuali */
export const YEARLY_SPHERE_TYPES = ['SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW'] as const;
/** Tipi numerici (0-10) */
export const YEARLY_NUMERIC_TYPES = [...YEARLY_MOOD_TYPES, ...YEARLY_SPHERE_TYPES] as const;
/** Tipi singoli (1 per anno) */
export const YEARLY_SINGLE_TYPES = [
  'OY', 'P1', 'P2', 'P3',
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6',
  ...YEARLY_MOOD_TYPES,
  ...YEARLY_SPHERE_TYPES,
] as const;
/** Tipi multi-record */
export const YEARLY_MULTI_TYPES = ['PR', 'EP', 'EN', 'TG'] as const;

export type YearlyMoodType = typeof YEARLY_MOOD_TYPES[number];
export type YearlySphereType = typeof YEARLY_SPHERE_TYPES[number];
export type YearlyNumericType = typeof YEARLY_NUMERIC_TYPES[number];
export type YearlySingleType = typeof YEARLY_SINGLE_TYPES[number];
export type YearlyMultiType = typeof YEARLY_MULTI_TYPES[number];
export type YearlyType = YearlySingleType | YearlyMultiType;

/** Nomi leggibili mood (riusa stessi label di monthly) */
export const YEARLY_MOOD_LABELS: Record<YearlyMoodType, string> = {
  MJ: 'Gioia', MS: 'Tristezza', MA: 'Rabbia', MD: 'Disgusto', MT: 'Paura',
};
/** Nomi leggibili sfere */
export const YEARLY_SPHERE_LABELS: Record<YearlySphereType, string> = {
  SC: 'Coppia', SF: 'Famiglia', SA: 'Amici', SH: 'Salute',
  SS: 'Mente', SD: 'Svago', SM: 'Finanze', SW: 'Lavoro',
};

/** Colori per mood (uniformati a MonthPage tramite trackerUtils) */
export const YEARLY_MOOD_COLORS: Record<YearlyMoodType, string> = {
  MJ: getTrackerColor('Gioia'),
  MS: getTrackerColor('Tristezza'),
  MA: getTrackerColor('Rabbia'),
  MD: getTrackerColor('Disgusto'),
  MT: getTrackerColor('Paura'),
};

/** Colori per sfere (uniformati a MonthPage tramite trackerUtils) */
export const YEARLY_SPHERE_COLORS: Record<YearlySphereType, string> = {
  SC: getTrackerColor('Coppia'),
  SF: getTrackerColor('Famiglia'),
  SA: getTrackerColor('Amici'),
  SH: getTrackerColor('Salute'),
  SS: getTrackerColor('Mente'),
  SD: getTrackerColor('Svago'),
  SM: getTrackerColor('Finanze'),
  SW: getTrackerColor('Lavoro'),
};

/** Record DB yearly_entries */
export interface DbYearlyEntry {
  id: number;
  user_id: number;
  year: number;
  yearly_type: YearlyType;
  yearly_field: string | null;
}

/** Record DB bingo */
export interface DbBingoEntry {
  id: number;
  user_id: number;
  year: number;
  testo: string | null;
  done: boolean;
  posizione?: number | null;
  rotazione?: number | null;
}

/** Payload creazione yearly entry */
export interface YearlyEntryCreate {
  year: number;
  yearly_type: YearlyType;
  yearly_field?: string | null;
}

/** Payload update yearly entry */
export interface YearlyEntryUpdate {
  yearly_field?: string | null;
}

/** Payload creazione bingo cell */
export interface BingoEntryCreate {
  year: number;
  testo?: string | null;
  posizione?: number | null;
  rotazione?: number | null;
}

/** Payload update bingo cell */
export interface BingoEntryUpdate {
  testo?: string | null;
  done?: boolean;
  posizione?: number | null;
  rotazione?: number | null;
}

/** Discriminatori */
export function isYearlyNumericType(type: string): type is YearlyNumericType {
  return (YEARLY_NUMERIC_TYPES as readonly string[]).includes(type);
}
export function isYearlyMultiType(type: string): type is YearlyMultiType {
  return (YEARLY_MULTI_TYPES as readonly string[]).includes(type);
}
export function getYearlyNumericValue(entry: DbYearlyEntry): number {
  if (!entry.yearly_field) return 0;
  const parsed = parseInt(entry.yearly_field, 10);
  return isNaN(parsed) ? 0 : parsed;
}
