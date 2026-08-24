// frontend/src/hooks/uiYear/useYearAgendaData.ts
import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { DbEvent } from '@/types/events';
import type { DbTask } from '@/types/tasks';

export const useYearAgendaData = (year: number) => {
  const queryClient = useQueryClient();
  const startStr = `${year}-01-01`;
  const endStr = `${year}-12-31`;

  const { data: events = [] } = useQuery<DbEvent[]>({
    queryKey: ['events', 'year', year],
    queryFn: async () => {
      const data = await api.get<{ items?: DbEvent[] } | DbEvent[]>(`/events?start_date=${startStr}&end_date=${endStr}`);
      if (!data) return [];
      return Array.isArray(data) ? data : (data?.items ?? []);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const { data: tasks = [] } = useQuery<DbTask[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const data = await api.get<{ items?: DbTask[] } | DbTask[]>('/tasks');
      if (!data) return [];
      return Array.isArray(data) ? data : (data?.items ?? []);
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Prefetching in background per gli anni adiacenti
  useEffect(() => {
    const nextYear = year + 1;
    const prevYear = year - 1;

    queryClient.prefetchQuery({
      queryKey: ['events', 'year', nextYear],
      queryFn: async () => {
        const data = await api.get<{ items?: DbEvent[] } | DbEvent[]>(`/events?start_date=${nextYear}-01-01&end_date=${nextYear}-12-31`);
        if (!data) return [];
        return Array.isArray(data) ? data : (data?.items ?? []);
      },
      staleTime: 10 * 60 * 1000,
    });

    queryClient.prefetchQuery({
      queryKey: ['events', 'year', prevYear],
      queryFn: async () => {
        const data = await api.get<{ items?: DbEvent[] } | DbEvent[]>(`/events?start_date=${prevYear}-01-01&end_date=${prevYear}-12-31`);
        if (!data) return [];
        return Array.isArray(data) ? data : (data?.items ?? []);
      },
      staleTime: 10 * 60 * 1000,
    });
  }, [year, queryClient]);

  return { events, tasks };
};
