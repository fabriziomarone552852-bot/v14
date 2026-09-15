// src/hooks/uiYear/useYearlyTrackers.ts
import { useMemo } from 'react';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';
import type { TrackerItem } from '@/types/monthlyentries';
import {
  YEARLY_MOOD_COLORS,
  YEARLY_MOOD_LABELS,
  YEARLY_SPHERE_COLORS,
  YEARLY_SPHERE_LABELS,
} from '@/utils/yearlyEntriesUtils';

export interface UseYearlyTrackersProps {
  entries: DbYearlyEntry[];
  year: number;
  updateEntriesState: (updater: (prev: DbYearlyEntry[]) => DbYearlyEntry[]) => void;
}

export function useYearlyTrackers({
  entries,
  year,
  updateEntriesState,
}: UseYearlyTrackersProps) {
  const moodsUI = useMemo((): TrackerItem[] => {
    return (Object.keys(YEARLY_MOOD_LABELS) as (keyof typeof YEARLY_MOOD_LABELS)[]).map(
      (code) => {
        const entry = entries.find((e) => e.yearly_type === code);
        return {
          id: code,
          name: YEARLY_MOOD_LABELS[code],
          category: 'MOOD',
          colorHex: YEARLY_MOOD_COLORS[code],
          currentValue: entry && entry.yearly_field ? parseInt(entry.yearly_field, 10) || 0 : 0,
          previousValue: 0,
        };
      }
    );
  }, [entries]);

  const spheresUI = useMemo((): TrackerItem[] => {
    return (Object.keys(YEARLY_SPHERE_LABELS) as (keyof typeof YEARLY_SPHERE_LABELS)[]).map(
      (code) => {
        const entry = entries.find((e) => e.yearly_type === code);
        return {
          id: code,
          name: YEARLY_SPHERE_LABELS[code],
          category: 'SPHERE',
          colorHex: YEARLY_SPHERE_COLORS[code],
          currentValue: entry && entry.yearly_field ? parseInt(entry.yearly_field, 10) || 0 : 0,
          previousValue: 0,
        };
      }
    );
  }, [entries]);

  const handleUpdateMood = async (id: string, newValue: number) => {
    const yearlyType = id as YearlyType;
    const existing = entries.find((e) => e.yearly_type === yearlyType);
    if (existing) {
      const updated = await yearlyEntriesApi.update(existing.id, {
        yearly_field: newValue.toString(),
      });
      if (updated) updateEntriesState((prev) => prev.map((e) => (e.id === existing.id ? updated : e)));
    } else {
      const created = await yearlyEntriesApi.create({
        year,
        yearly_type: yearlyType,
        yearly_field: newValue.toString(),
      });
      if (created) updateEntriesState((prev) => [...prev, created]);
    }
  };

  const handleUpdateSphere = async (id: string, newValue: number) => {
    const yearlyType = id as YearlyType;
    const existing = entries.find((e) => e.yearly_type === yearlyType);
    if (existing) {
      const updated = await yearlyEntriesApi.update(existing.id, {
        yearly_field: newValue.toString(),
      });
      if (updated) updateEntriesState((prev) => prev.map((e) => (e.id === existing.id ? updated : e)));
    } else {
      const created = await yearlyEntriesApi.create({
        year,
        yearly_type: yearlyType,
        yearly_field: newValue.toString(),
      });
      if (created) updateEntriesState((prev) => [...prev, created]);
    }
  };

  return {
    moodsUI,
    spheresUI,
    handleUpdateMood,
    handleUpdateSphere,
  };
}
