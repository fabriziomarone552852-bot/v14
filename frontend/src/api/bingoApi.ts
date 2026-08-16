// src/api/bingoApi.ts
import { api } from './apiService';
import type { DbBingoEntry, BingoEntryCreate, BingoEntryUpdate } from '@/types/yearlyentries';

export const bingoApi = {
  getAll: async (year: number): Promise<DbBingoEntry[]> => {
    const result = await api.get<DbBingoEntry[]>(`/bingo?year=${year}`);
    return result ?? [];
  },
  create: async (data: BingoEntryCreate): Promise<DbBingoEntry | null> => {
    return api.post<DbBingoEntry, BingoEntryCreate>('/bingo', data);
  },
  update: async (id: number, data: BingoEntryUpdate): Promise<DbBingoEntry | null> => {
    return api.patch<DbBingoEntry, BingoEntryUpdate>(`/bingo/${id}`, data);
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/bingo/${id}`);
  },
};
