// src/api/yearlyEntriesApi.ts
import { api } from './apiService';
import type { DbYearlyEntry, YearlyEntryCreate, YearlyEntryUpdate } from '@/types/yearlyentries';

export const yearlyEntriesApi = {
  getAll: async (year: number): Promise<DbYearlyEntry[]> => {
    const result = await api.get<DbYearlyEntry[]>(`/yearly-entries?year=${year}`);
    return result ?? [];
  },
  create: async (data: YearlyEntryCreate): Promise<DbYearlyEntry | null> => {
    return api.post<DbYearlyEntry, YearlyEntryCreate>('/yearly-entries', data);
  },
  update: async (id: number, data: YearlyEntryUpdate): Promise<DbYearlyEntry | null> => {
    return api.patch<DbYearlyEntry, YearlyEntryUpdate>(`/yearly-entries/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/yearly-entries/${id}`);
  },
};
