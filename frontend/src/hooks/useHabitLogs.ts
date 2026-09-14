// src/hooks/useHabitLogs.ts
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { RoutinePeriod } from '@/components/day/RoutineColumn';

// 1. LE TUE OTTIME INTERFACCE
export interface HabitLogItem {
  id: number;
  habit_id: number;
  data_riferimento: string;
  count: number;
}

export interface LogDisplayItem {
  date: string;
  done: number;
  target: number;
}

export interface MonthGroupedHabitLog {
  month: string;
  logs: LogDisplayItem[];
}

export const useHabitLogs = (habitId?: number, periods?: RoutinePeriod[]) => {

  // 2. MAGIA REACT QUERY
  const { data: fullLogs = [], isLoading } = useQuery<HabitLogItem[]>({
    queryKey: ['habitLogs', habitId],
    queryFn: async () => {
      const data = await api.get<HabitLogItem[] | { items?: HabitLogItem[] }>(`/habit-log?habit_id=${habitId}`);
      if (!data) return [];
      return Array.isArray(data) ? data : (data.items ?? []);
    },
    enabled: !!habitId, 
  });

  // 3. RAGGRUPPAMENTO BLINDATO
  const groupedLogs = useMemo(() => {
    // Ottimizzazione: se non ci sono log o non è un array valido, evitiamo calcoli inutili
    if (!Array.isArray(fullLogs) || fullLogs.length === 0) return []; 

    const groups: { [key: string]: LogDisplayItem[] } = {};
    const mesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

    const validLogs = fullLogs.filter((l): l is HabitLogItem => Boolean(l && typeof l.data_riferimento === 'string'));

    [...validLogs]
      .sort((a, b) => (b.data_riferimento || '').localeCompare(a.data_riferimento || ''))
      .forEach(log => {
        const rawDate = log.data_riferimento;
        if (!rawDate || rawDate.length < 10) return;

        // 🪄 IL FIX CRITICO DEL FUSO ORARIO:
        // Tagliamo la stringa, estraiamo i numeri e forziamo la data a Mezzogiorno locale
        const [year, month, day] = rawDate.substring(0, 10).split('-').map(Number);
        if (isNaN(year) || isNaN(month) || isNaN(day)) return;

        const date = new Date(year, month - 1, day, 12, 0, 0);
        
        const monthName = `${mesi[date.getMonth()]} ${date.getFullYear()}`;
        
        if (!groups[monthName]) groups[monthName] = [];
        
        const targetPeriod = Array.isArray(periods) ? periods.find(p => 
          p.data_inizio && p.data_inizio <= rawDate && (!p.data_fine || p.data_fine >= rawDate)
        ) : undefined;

        groups[monthName].push({
          date: `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`,
          done: log.count ?? 1,
          target: targetPeriod ? targetPeriod.target : 1
        });
      });

    return Object.keys(groups).map(month => ({ month, logs: groups[month] }));
  }, [fullLogs, periods]);

  return { groupedLogs, isLoading };

};