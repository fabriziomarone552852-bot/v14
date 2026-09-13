// src/mobile/components/modals/review/yearReview.utils.ts
import { format } from 'date-fns';
import type { YearlyType } from '@/types/yearlyentries';
import type { Habit } from '@/types/habits';
import type { TrackerItem } from '@/types/monthlyentries';
import { MOOD_NAMES, SPHERE_NAMES } from '@/utils/monthlyEntriesUtils';
import { getTrackerColor, TRACKER_CODES } from '@/utils/trackerConstants';

export const YEAR_REVIEW_QUESTIONS: { code: YearlyType; text: string }[] = [
  { code: 'Q1', text: "1. Quali sono stati gli eventi più significativi di quest'anno?" },
  { code: 'Q2', text: "2. Quali sono le più importanti lezioni che hai imparato quest'anno?" },
  {
    code: 'Q3',
    text: "3. Controlla i tuoi obiettivi dell'anno appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?",
  },
  {
    code: 'Q4',
    text: "4. Ripensa alle persone di quest'anno. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?",
  },
  {
    code: 'Q5',
    text: "5. Guarda alle cose positive e a quelle negative dell'anno. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?",
  },
  {
    code: 'Q6',
    text: "6. Pensa ad almeno 3 cose che puoi migliorare nel prossimo anno e scrivi un elenco di azioni concrete!",
  },
];

export const MESI_BREVI = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
export const GIORNI_SETT = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export const MESI_PIXELS = [
  { short: 'GEN', full: 'Gennaio' },
  { short: 'FEB', full: 'Febbraio' },
  { short: 'MAR', full: 'Marzo' },
  { short: 'APR', full: 'Aprile' },
  { short: 'MAG', full: 'Maggio' },
  { short: 'GIU', full: 'Giugno' },
  { short: 'LUG', full: 'Luglio' },
  { short: 'AGO', full: 'Agosto' },
  { short: 'SET', full: 'Settembre' },
  { short: 'OTT', full: 'Ottobre' },
  { short: 'NOV', full: 'Novembre' },
  { short: 'DIC', full: 'Dicembre' },
];

export const pad = (n: number) => String(n).padStart(2, '0');

export const formatMoodName = (name: string | null | undefined): string => {
  if (!name) return 'Nessun umore';
  const trimmed = name.trim();
  if (!trimmed) return 'Nessun umore';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const getLongestStreak = (logs: Habit['logs']): number => {
  if (logs.length === 0) return 0;
  const sortedDates = logs
    .map((l) => l.data_riferimento.split('T')[0])
    .sort();
  let maxStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  return maxStreak;
};

/** Calcolo giorni effettivi di attività di una routine in un anno */
export const getHabitActiveDaysInYear = (habit: Habit, year: number): number => {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const effectiveEnd = year === today.getFullYear() ? (endOfYear > today ? today : endOfYear) : endOfYear;
  if (effectiveEnd < startOfYear) return 0;

  if (!habit.periods || habit.periods.length === 0) {
    const diffTime = effectiveEnd.getTime() - startOfYear.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
  }

  let count = 0;
  const cur = new Date(startOfYear);
  cur.setHours(0, 0, 0, 0);

  while (cur <= effectiveEnd) {
    const dStr = format(cur, 'yyyy-MM-dd');
    const isActive = habit.periods.some((p) => {
      const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
      const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
      return start <= dStr && end >= dStr;
    });
    if (isActive) count++;
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

export const DEFAULT_MOODS: TrackerItem[] = MOOD_NAMES.map((nome) => ({
  id: TRACKER_CODES[nome],
  name: nome,
  category: 'MOOD' as const,
  colorHex: getTrackerColor(nome),
  currentValue: 0,
  previousValue: 0,
}));

export const DEFAULT_SPHERES: TrackerItem[] = SPHERE_NAMES.map((nome) => ({
  id: TRACKER_CODES[nome],
  name: nome,
  category: 'SPHERE' as const,
  colorHex: getTrackerColor(nome),
  currentValue: 0,
  previousValue: 0,
}));
