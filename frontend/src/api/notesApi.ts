// src/api/notesApi.ts
import { api } from '@/api/apiService';
import type { DailyEntry } from '@/types/dailyentries';
import type { NoteVariant } from '@/types';

export interface CreateNotePayload {
  data_riferimento: string;
  testo: string;
  tipo: NoteVariant;
}

export interface UpdateNotePayload {
  data_riferimento?: string;
  testo?: string;
  tipo?: NoteVariant;
}

export const getNotes = async (): Promise<DailyEntry[]> => {
  const data = await api.get<DailyEntry[]>('/daily-entries');
  if (!Array.isArray(data)) return [];
  return data.filter((d) => ['N1', 'N2', 'N3', 'N4'].includes(d.tipo));
};

export const getNote = async (id: number): Promise<DailyEntry> => {
  const data = await api.get<DailyEntry>(`/daily-entries/${id}`);
  if (!data) throw new Error('Nota non trovata');
  return data;
};

export const createNote = async (payload: CreateNotePayload): Promise<DailyEntry> => {
  const data = await api.post<DailyEntry>('/daily-entries', payload);
  if (!data) throw new Error('Errore nella creazione della nota');
  return data;
};

export const updateNote = async (id: number, payload: UpdateNotePayload): Promise<DailyEntry> => {
  const data = await api.patch<DailyEntry>(`/daily-entries/${id}`, payload);
  if (!data) throw new Error('Errore nell\'aggiornamento della nota');
  return data;
};

export const deleteNote = async (id: number): Promise<void> => {
  await api.delete(`/daily-entries/${id}`);
};
