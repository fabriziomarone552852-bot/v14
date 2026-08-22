// frontend/src/hooks/mutations/useDailyEntryMutations.ts
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { DailyEntry } from '@/types';
import type { DbMonthlyEntry } from '@/types/monthlyentries';
import { logger } from '@/utils/logger';

export interface SaveDailyEntryPayload {
  id?: number;
  tipo: DailyEntry['tipo'];
  text?: string;
  dateStr: string;
  category_id?: number | null;
}

export interface CacheWithDailyEntries {
  obiettivi?: DailyEntry[] | DbMonthlyEntry[];
  priorita?: DailyEntry[] | DbMonthlyEntry[];
  obiettivo_settimanale?: DailyEntry | null;
  priorita_settimanali?: DailyEntry[];
  eventi_positivi?: DailyEntry[] | DbMonthlyEntry[];
  eventi_negativi?: DailyEntry[] | DbMonthlyEntry[];
}

export function useDailyEntryMutations<T extends CacheWithDailyEntries>(queryKey: QueryKey) {
  const queryClient = useQueryClient();

  const saveEntryMutation = useMutation({
    mutationFn: async (payload: SaveDailyEntryPayload) => {
      const data: Record<string, unknown> = {
        data_riferimento: payload.dateStr,
        tipo: payload.tipo,
        testo: payload.text ?? null
      };
      if (payload.category_id !== undefined) {
        data.category_id = payload.category_id;
      }
      
      if (payload.id && !payload.text?.trim() && payload.category_id === undefined) {
        await api.delete(`/daily-entries/${payload.id}`);
        return { deleted: true, id: payload.id };
      }
      
      const result = payload.id 
        ? await api.patch<DailyEntry>(`/daily-entries/${payload.id}`, data)
        : await api.post<DailyEntry>('/daily-entries', data);
        
      return result;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);

      const tempId = payload.id || Date.now();
      const textVal = payload.text ? payload.text.trim() : '';
      const isDelete = !textVal && payload.category_id === undefined && payload.id;
      
      const entry: DailyEntry = {
        id: tempId,
        data_riferimento: payload.dateStr,
        tipo: payload.tipo,
        testo: payload.text ?? '',
        category_id: payload.category_id ?? null,
        user_id: 0
      };

      queryClient.setQueryData<T>(queryKey, (old) => {
        if (!old) return old;

        const updateArray = (list?: (DailyEntry | DbMonthlyEntry)[]): (DailyEntry | DbMonthlyEntry)[] => {
          const arr = list || [];
          if (isDelete) return arr.filter(item => item.id !== payload.id);
          const exists = arr.some(item => item.id === tempId);
          return exists ? arr.map(item => item.id === tempId ? (entry as unknown as DailyEntry & DbMonthlyEntry) : item) : [...arr, entry];
        };

        if (payload.tipo === 'PX') {
          const oldDailyEntries = (old as unknown as { daily_entries?: DailyEntry[] }).daily_entries || [];
          let updatedPX: DailyEntry[];
          if (payload.category_id === null) {
            updatedPX = oldDailyEntries.filter(item => !(item.tipo === 'PX' && item.data_riferimento === payload.dateStr));
          } else {
            const existingIndex = oldDailyEntries.findIndex(item => item.tipo === 'PX' && item.data_riferimento === payload.dateStr);
            if (existingIndex >= 0) {
              updatedPX = oldDailyEntries.map((item, idx) => idx === existingIndex ? { ...item, category_id: payload.category_id } : item);
            } else {
              updatedPX = [...oldDailyEntries, entry];
            }
          }
          return { ...old, daily_entries: updatedPX };
        }

        switch (payload.tipo) {
          case 'OD': return { ...old, obiettivi: updateArray(old.obiettivi) };
          case 'PD': return { ...old, priorita: updateArray(old.priorita) };
          case 'OW': return { ...old, obiettivo_settimanale: isDelete ? null : entry };
          case 'PW': return { ...old, priorita_settimanali: updateArray(old.priorita_settimanali) as DailyEntry[] };
          case 'EP': return { ...old, eventi_positivi: updateArray(old.eventi_positivi) };
          case 'EN': return { ...old, eventi_negativi: updateArray(old.eventi_negativi) };
          default: return old;
        }
      });

      return { previousData, tempId };
    },
    onError: (err, _payload, context) => {
      logger.error("Errore salvataggio daily entry:", err);
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSuccess: (savedEntryFromDB, payload, context) => {
      if (!savedEntryFromDB || 'deleted' in savedEntryFromDB) return;

      if (!payload.id && context?.tempId) {
        queryClient.setQueryData<T>(queryKey, (old) => {
          if (!old) return old;

          const tempId = context.tempId;
          const swapEntry = (list?: (DailyEntry | DbMonthlyEntry)[]): (DailyEntry | DbMonthlyEntry)[] => 
            (list || []).map(item => item.id === tempId ? (savedEntryFromDB as unknown as DailyEntry) : item);

          switch (payload.tipo) {
            // Giorno e Mese vanno nello stesso cassetto (array)
            case 'OD': 
              return { ...old, obiettivi: swapEntry(old.obiettivi) };
            
            // Giorno e Mese vanno nello stesso cassetto (array)
            case 'PD': 
              return { ...old, priorita: swapEntry(old.priorita) };
            
            // La Settimana ha i suoi cassetti separati!
            case 'OW': 
              return { ...old, obiettivo_settimanale: savedEntryFromDB as DailyEntry };
            case 'PW': 
              return { ...old, priorita_settimanali: swapEntry(old.priorita_settimanali) as DailyEntry[] };
            
            // Eventi
            case 'EP': 
              return { ...old, eventi_positivi: swapEntry(old.eventi_positivi) };
            case 'EN': 
              return { ...old, eventi_negativi: swapEntry(old.eventi_negativi) };
              
            default: 
              return old;
          }
        });
      }
    },
  });

  return { 
    saveDailyEntry: saveEntryMutation.mutate, 
    saveDailyEntryAsync: saveEntryMutation.mutateAsync 
  };
  
}