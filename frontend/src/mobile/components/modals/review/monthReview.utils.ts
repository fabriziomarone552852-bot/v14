// src/mobile/components/modals/review/monthReview.utils.ts
import { format } from 'date-fns';
import type { MonthlyType } from '@/types/monthlyentries';
import type { Habit } from '@/types/habits';

export const REVIEW_QUESTIONS: { code: MonthlyType; text: string }[] = [
  { code: 'Q1', text: '1. Quali sono stati gli eventi più significativi di questo mese?' },
  { code: 'Q2', text: '2. Quali sono le più importanti lezioni che hai imparato in questo mese?' },
  {
    code: 'Q3',
    text: '3. Controlla i tuoi obiettivi del mese appena passato. Sei soddisfatto? Datti un voto sincero da 1 a 10.\nCosa hai fatto e cosa potevi fare di più?',
  },
  {
    code: 'Q4',
    text: '4. Ripensa alle persone di questo ultimo mese. Chi ha fatto la differenza per te? Cosa puoi fare tu per queste persone?',
  },
  {
    code: 'Q5',
    text: '5. Guarda alle cose positive e a quelle negative che sono successe. A cosa sono dovute? Cosa puoi fare per aumentare quelle buone ed evitare quelle cattive?',
  },
  {
    code: 'Q6',
    text: '6. Pensa ad almeno 3 cose che puoi migliorare in questo prossimo mese e scrivi un elenco di azioni concrete per farlo!',
  },
];

/** Formatta data_riferimento "YYYY-MM-DD" → "dd/MM" */
export const formatShortDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const parts = dateStr.substring(0, 10).split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateStr;
};

export interface ActiveHabitInMonth {
  habit: Habit;
  activeDays: number;
  activeDayNumbers: number[];
  completedDays: number;
  logDates: Set<number>;
}

export function getActiveHabitsInMonth(habits: Habit[], monthDate: Date): ActiveHabitInMonth[] {
  const startOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const isCurrentMonth =
    monthDate.getFullYear() === today.getFullYear() &&
    monthDate.getMonth() === today.getMonth();

  const effectiveEnd = isCurrentMonth ? (endOfMonth > today ? today : endOfMonth) : endOfMonth;

  return habits
    .map((habit) => {
      const activeDayNumbers: number[] = [];
      if (!habit.periods || habit.periods.length === 0) {
        const cur = new Date(startOfMonth);
        while (cur <= effectiveEnd) {
          activeDayNumbers.push(cur.getDate());
          cur.setDate(cur.getDate() + 1);
        }
      } else {
        const cur = new Date(startOfMonth);
        cur.setHours(0, 0, 0, 0);
        while (cur <= effectiveEnd) {
          const dStr = format(cur, 'yyyy-MM-dd');
          const isActive = habit.periods.some((p) => {
            const start = p.data_inizio ? p.data_inizio.split('T')[0] : '1970-01-01';
            const end = p.data_fine ? p.data_fine.split('T')[0] : '9999-12-31';
            return start <= dStr && end >= dStr;
          });
          if (isActive) {
            activeDayNumbers.push(cur.getDate());
          }
          cur.setDate(cur.getDate() + 1);
        }
      }

      const currentMonthPrefix = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      const logDates = new Set(
        habit.logs
          .filter((log) => log.count > 0 && log.data_riferimento.startsWith(currentMonthPrefix))
          .map((log) => parseInt(log.data_riferimento.split('-')[2], 10))
      );
      const completedDays = logDates.size;
      const activeDays = activeDayNumbers.length;

      return {
        habit,
        activeDays,
        activeDayNumbers,
        completedDays,
        logDates,
      };
    })
    .filter((h) => h.activeDays > 0);
}
