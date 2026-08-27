// frontend/src/hooks/uiMonth/useMonthSidebar.ts
import { useState, useMemo } from 'react';
import { useMonthlyEntryMutations } from '@/hooks/mutations/useMonthlyEntryMutations';
import { getNumericValue, MOOD_NAMES, SPHERE_NAMES } from '@/utils/monthlyEntriesUtils';
import { getTrackerColor, TRACKER_CODES } from '@/utils/trackerConstants';
import {
  type SyncMonthResponse,
  type TrackerItem,
  type MonthlyType,
} from '@/types';

export type MonthSidebarTab = 'moods' | 'spheres' | 'todos' | 'reflections';

export const useMonthSidebar = (
  monthData: SyncMonthResponse | undefined,
  currentMonthDateStr: string,
  queryKey: string[],
) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<MonthSidebarTab>('moods');

  const { saveMonthlyEntry } = useMonthlyEntryMutations(queryKey);

  const moodsUI = useMemo((): TrackerItem[] => {
    const vociDB = monthData?.monthly_entries || [];
    const vociPrevDB = monthData?.prev_monthly_entries || [];

    return MOOD_NAMES.map(nome => {
      const code = TRACKER_CODES[nome];
      const voceSalvata = vociDB.find(v => v.monthly_type === code);
      const vocePrevSalvata = vociPrevDB.find(v => v.monthly_type === code);

      return {
        id: code,
        name: nome,
        category: 'MOOD',
        colorHex: getTrackerColor(nome),
        currentValue: voceSalvata ? getNumericValue(voceSalvata) : 0,
        previousValue: vocePrevSalvata ? getNumericValue(vocePrevSalvata) : 0,
      };
    });
  }, [monthData]);

  const spheresUI = useMemo((): TrackerItem[] => {
    const vociDB = monthData?.monthly_entries || [];
    const vociPrevDB = monthData?.prev_monthly_entries || [];

    return SPHERE_NAMES.map(nome => {
      const code = TRACKER_CODES[nome];
      const voceSalvata = vociDB.find(v => v.monthly_type === code);
      const vocePrevSalvata = vociPrevDB.find(v => v.monthly_type === code);

      return {
        id: code,
        name: nome,
        category: 'SPHERE',
        colorHex: getTrackerColor(nome),
        currentValue: voceSalvata ? getNumericValue(voceSalvata) : 0,
        previousValue: vocePrevSalvata ? getNumericValue(vocePrevSalvata) : 0,
      };
    });
  }, [monthData]);

  const handleUpdateMood = (codeStr: string, value: number): void => {
    const existingEntry = monthData?.monthly_entries?.find(e => e.monthly_type === codeStr);
    saveMonthlyEntry({
      monthly_type: codeStr as MonthlyType,
      monthly_field: String(value),
      dateStr: currentMonthDateStr,
      existingEntryId: existingEntry?.id,
    });
  };

  const handleUpdateSphere = (codeStr: string, value: number): void => {
    const existingEntry = monthData?.monthly_entries?.find(e => e.monthly_type === codeStr);
    saveMonthlyEntry({
      monthly_type: codeStr as MonthlyType,
      monthly_field: String(value),
      dateStr: currentMonthDateStr,
      existingEntryId: existingEntry?.id,
    });
  };

  return { activeSidebarTab, setActiveSidebarTab, moodsUI, spheresUI, handleUpdateMood, handleUpdateSphere };
};