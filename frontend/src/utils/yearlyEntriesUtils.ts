// frontend/src/utils/yearlyEntriesUtils.ts
import type { 
  YearlyNumericType, 
  YearlySingleType, 
  YearlyMultiType, 
  DbYearlyEntry 
} from '@/types/yearlyentries';

import {
  MOOD_TYPES as YEARLY_MOOD_TYPES,
  SPHERE_TYPES as YEARLY_SPHERE_TYPES,
  MOOD_LABELS as YEARLY_MOOD_LABELS,
  SPHERE_LABELS as YEARLY_SPHERE_LABELS,
  MOOD_COLORS as YEARLY_MOOD_COLORS,
  SPHERE_COLORS as YEARLY_SPHERE_COLORS
} from './trackerConstants';

export {
  YEARLY_MOOD_TYPES,
  YEARLY_SPHERE_TYPES,
  YEARLY_MOOD_LABELS,
  YEARLY_SPHERE_LABELS,
  YEARLY_MOOD_COLORS,
  YEARLY_SPHERE_COLORS
};

export const YEARLY_NUMERIC_TYPES: readonly YearlyNumericType[] = [...YEARLY_MOOD_TYPES, ...YEARLY_SPHERE_TYPES] as const;
export const YEARLY_SINGLE_TYPES: readonly YearlySingleType[] = [
  'OY', 'P1', 'P2', 'P3',
  'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6',
  ...YEARLY_MOOD_TYPES,
  ...YEARLY_SPHERE_TYPES,
] as const;
export const YEARLY_MULTI_TYPES: readonly YearlyMultiType[] = ['PR', 'EP', 'EN', 'TG'] as const;

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
