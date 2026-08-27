// src/types/yearlyentries.ts
import type { MoodType, SphereType } from './monthlyentries';

export type YearlyMoodType = MoodType;
export type YearlySphereType = SphereType;
export type YearlyNumericType = YearlyMoodType | YearlySphereType;
export type YearlySingleType = 'OY' | 'P1' | 'P2' | 'P3' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | YearlyMoodType | YearlySphereType;
export type YearlyMultiType = 'PR' | 'EP' | 'EN' | 'TG';
export type YearlyType = YearlySingleType | YearlyMultiType;

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
