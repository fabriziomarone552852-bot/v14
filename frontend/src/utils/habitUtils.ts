import type { Habit, HabitLog, HabitPeriod } from '@/types';
import type { RoutineItem } from '@/components/day/RoutineColumn';
import type { HabitItem } from '@/components/day/HabitsBar';
import { DEFAULT_COVER_IMAGE } from '@/utils/constants';

/**
 * 1. Calcola se l'abitudine deve apparire oggi
 */
export const isHabitScheduledForDay = (h: Habit, targetDate: string): boolean => {
  if (!h.rrule) return true; 

  // 🪄 SOSTITUITO || CON ??
  const activePeriod = (h.periods ?? []).find(p => 
    p.data_inizio.substring(0, 10) <= targetDate && (!p.data_fine || p.data_fine.substring(0, 10) >= targetDate)
  ) ?? h.periods?.[0];

  if (!activePeriod) return false;

  const startDate = new Date(activePeriod.data_inizio);
  const currentDate = new Date(targetDate);

  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const currentUtc = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  const diffDays = Math.floor((currentUtc - startUtc) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return false; 

  const intervalMatch = h.rrule.match(/INTERVAL=(\d+)/);
  const interval = intervalMatch ? parseInt(intervalMatch[1], 10) : 1;

  if (h.rrule.includes('FREQ=DAILY')) return diffDays % interval === 0;
  if (h.rrule.includes('FREQ=WEEKLY')) {
    const rruleStr = h.rrule || '';
    const byDayMatch = rruleStr.match(/BYDAY=([^;]+)/);
    if (byDayMatch) {
      const days = byDayMatch[1].split(',');
      const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      const currentDayName = dayNames[currentDate.getDay()];
      
      const startDayNum = (startDate.getDay() + 6) % 7; 
      const currentDayNum = (currentDate.getDay() + 6) % 7;
      const diffWeeks = Math.floor((diffDays + startDayNum - currentDayNum) / 7);
      
      return days.includes(currentDayName) && (diffWeeks % interval === 0);
    }
    return diffDays % (7 * interval) === 0;
  }
  if (h.rrule.includes('FREQ=MONTHLY')) {
    const diffMonths = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + (currentDate.getMonth() - startDate.getMonth());
    const targetDay = Math.min(startDate.getDate(), new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate());
    return diffMonths % interval === 0 && currentDate.getDate() === targetDay;
  }
  if (h.rrule.includes('FREQ=YEARLY')) {
    const diffYears = currentDate.getFullYear() - startDate.getFullYear();
    return diffYears % interval === 0 && currentDate.getMonth() === startDate.getMonth() && currentDate.getDate() === startDate.getDate();
  }

  return true;
};

/**
 * 2. ESTRATTORE SICURO DEL PERIODO 
 */
export const getActivePeriod = (periods: HabitPeriod[] | undefined, targetDateStr: string): HabitPeriod => {
  // 🪄 SOSTITUITO || CON ??
  const active = (periods ?? []).find(p => 
    p.data_inizio.substring(0, 10) <= targetDateStr && (!p.data_fine || p.data_fine.substring(0, 10) >= targetDateStr)
  );
  if (active) return active;
  
  if (periods && periods.length > 0) return periods[0];
  
  return {
    id: 0,
    habit_id: 0,
    target: 1, 
    data_inizio: new Date().toISOString(),
    frequenza: 'DAILY',
  } as HabitPeriod; 
};

/**
 * 3. ESTRATTORE SICURO DEI LOG
 */
export const getLogForDate = (logs: HabitLog[] | undefined, targetDateStr: string): number => {
  // 🪄 SOSTITUITO || CON ??
  const log = (logs ?? []).find(l => l.data_riferimento === targetDateStr);
  return log ? log.count : 0;
};

/**
 * 4. TRASFORMATORE PER LE ROUTINE 
 */
export const mapHabitsToRoutines = (habits: Habit[], targetDateStr: string): RoutineItem[] => {
  return habits
    .filter((h) => h.tipo === 'R' && isHabitScheduledForDay(h, targetDateStr))
    .map((h) => {
      const activePeriod = getActivePeriod(h.periods, targetDateStr);
      const currentCompletions = getLogForDate(h.logs, targetDateStr);

      return {
        id: h.id,
        title: h.titolo,
        // 🪄 SOSTITUITO || CON ??
        imageUrl: h.immagine_url ?? DEFAULT_COVER_IMAGE,
        immaginePosizione: h.immagine_posizione || 'center',
        currentCompletions,
        targetCompletions: activePeriod.target,
        titolo: h.titolo,
        rrule: h.rrule ?? undefined,
        data_inizio: activePeriod.data_inizio,
        periodId: activePeriod.id,
        periods: h.periods ?? []
      };
    });
};

/**
 * 5. TRASFORMATORE PER LE ABITUDINI 
 */
export const mapHabitsToItems = (habits: Habit[], targetDateStr: string): HabitItem[] => {
  return habits
    .filter((h) => h.tipo === 'H' && isHabitScheduledForDay(h, targetDateStr))
    .map((h) => {
      const activePeriod = getActivePeriod(h.periods, targetDateStr);
      const currentCompletions = getLogForDate(h.logs, targetDateStr);

      return {
        id: h.id,
        title: h.titolo,
        // 🪄 SOSTITUITO || CON ??
        icon: h.immagine_url ?? '✨',
        done: currentCompletions >= activePeriod.target 
      };
    });
};