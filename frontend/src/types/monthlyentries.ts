// frontend/src/types/monthlyentries.ts

export type MoodType = 'MJ' | 'MS' | 'MA' | 'MD' | 'MT';
export type SphereType = 'SC' | 'SF' | 'SA' | 'SH' | 'SS' | 'SD' | 'SM' | 'SW';
export type NumericMonthlyType = MoodType | SphereType;
export type TextMonthlyType = 'EP' | 'EN' | 'OM' | 'PM' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'Q6' | 'TG';
export type MonthlyType = NumericMonthlyType | TextMonthlyType;

export type FixedMoodName = 'Gioia' | 'Tristezza' | 'Rabbia' | 'Disgusto' | 'Paura';
export type FixedSphereName = 'Coppia' | 'Famiglia' | 'Amici' | 'Svago' | 'Mente' | 'Lavoro' | 'Finanze' | 'Salute';
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

/** Item per il TrackerPanel (grafici polari mood/sfere). */
export interface TrackerItem {
  id: string;
  name: TrackerName;
  category: TrackerCategory;
  colorHex: string;
  currentValue: number;
  previousValue: number;
}