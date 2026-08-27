// frontend/src/utils/monthlyEntriesUtils.ts
import type { 
  NumericMonthlyType, 
  TextMonthlyType, 
  DbMonthlyEntry 
} from '@/types/monthlyentries';

import {
  MOOD_TYPES,
  SPHERE_TYPES,
  MOOD_LABELS,
  SPHERE_LABELS,
  MOOD_NAMES,
  SPHERE_NAMES
} from './trackerConstants';

export {
  MOOD_TYPES,
  SPHERE_TYPES,
  MOOD_LABELS,
  SPHERE_LABELS,
  MOOD_NAMES,
  SPHERE_NAMES
};

export const NUMERIC_MONTHLY_TYPES: readonly NumericMonthlyType[] = [...MOOD_TYPES, ...SPHERE_TYPES] as const;
export const TEXT_MONTHLY_TYPES: readonly TextMonthlyType[] = ['EP', 'EN', 'OM', 'PM', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'TG'] as const;
export const MULTI_RECORD_TYPES: readonly TextMonthlyType[] = ['EP', 'EN', 'PM', 'TG'] as const;

export function isNumericMonthlyType(type: string): type is NumericMonthlyType {
  return (NUMERIC_MONTHLY_TYPES as readonly string[]).includes(type);
}

export function getNumericValue(entry: DbMonthlyEntry): number {
  if (!entry.monthly_field) return 0;
  const parsed = parseInt(entry.monthly_field, 10);
  return isNaN(parsed) ? 0 : parsed;
}
