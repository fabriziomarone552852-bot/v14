// src/hooks/uiYear/useYearEntries.ts
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import { logger } from '@/utils/logger';
import type { SyncYearResponse } from '@/hooks/useAgendaYear';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';
import type { TrackerItem } from '@/types/monthlyentries';
import { useYearlyTrackers } from './useYearlyTrackers';
import { useYearlyTags } from './useYearlyTags';

export interface UseYearEntriesResult {
  entries: DbYearlyEntry[];
  obiettivo: DbYearlyEntry | null;
  priorita: (DbYearlyEntry | null)[];
  propositi: DbYearlyEntry[];
  moodsUI: TrackerItem[];
  spheresUI: TrackerItem[];
  eventiPositivi: DbYearlyEntry[];
  eventiNegativi: DbYearlyEntry[];
  assignedTags: Category[];
  allTags: Category[];
  tagEntryMap: Record<number, number>;

  handleSaveObiettivo: (text: string) => Promise<void>;
  handleSavePriority: (index: number, id: number | undefined, text: string) => Promise<void>;
  handleAddProposito: () => Promise<void>;
  handleUpdateProposito: (id: number, text: string) => Promise<void>;
  handleDeleteProposito: (id: number) => Promise<void>;
  handleUpdateMood: (id: string, newValue: number) => Promise<void>;
  handleUpdateSphere: (id: string, newValue: number) => Promise<void>;
  handleSaveAnswer: (code: YearlyType, text: string, existingId?: number) => Promise<void>;
  handleAddEvento: (tipo: 'EP' | 'EN', testo: string) => Promise<void>;
  handleUpdateEvento: (id: number, testo: string) => Promise<void>;
  handleDeleteEvento: (id: number) => Promise<void>;
  handleAddTag: (categoryId: number) => Promise<void>;
  handleCreateAndAddTag: (tagName: string) => void;
  handleRemoveTag: (yearlyEntryId: number) => Promise<void>;
}

export const useYearEntries = (yearData: SyncYearResponse | undefined, year: number): UseYearEntriesResult => {
  const queryClient = useQueryClient();
  const queryKey = ['yearSync', year];

  const entries = useMemo(() => yearData?.entries ?? [], [yearData]);

  const updateEntriesState = (updater: (prev: DbYearlyEntry[]) => DbYearlyEntry[]) => {
    queryClient.setQueryData<SyncYearResponse>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        entries: updater(old.entries ?? []),
      };
    });
    queryClient.invalidateQueries({ queryKey: ['yearly_entries'] });
    queryClient.invalidateQueries({ queryKey: ['tags_archive'] });
  };

  // 1. OBIETTIVO E PRIORITÀ
  const obiettivo = useMemo(() => entries.find(e => e.yearly_type === 'OY') || null, [entries]);

  const priorita = useMemo(() => {
    return [
      entries.find(e => e.yearly_type === 'P1') || null,
      entries.find(e => e.yearly_type === 'P2') || null,
      entries.find(e => e.yearly_type === 'P3') || null,
    ];
  }, [entries]);

  // 2. PROPOSITI ED EVENTI
  const propositi = useMemo(
    () => entries.filter(e => e.yearly_type === 'PR').sort((a, b) => a.id - b.id),
    [entries]
  );

  const eventiPositivi = useMemo(() => entries.filter(e => e.yearly_type === 'EP'), [entries]);
  const eventiNegativi = useMemo(() => entries.filter(e => e.yearly_type === 'EN'), [entries]);

  // 3. TRACKER UMORE & SFERE (Scorporati)
  const trackerLogic = useYearlyTrackers({
    entries,
    year,
    updateEntriesState,
  });

  // 4. TAGS ANNUALI (Scorporati)
  const tagLogic = useYearlyTags({
    entries,
    year,
    queryKey,
    updateEntriesState,
  });

  // 5. HANDLERS SALVATAGGIO
  const handleSaveObiettivo = async (text: string) => {
    const existing = obiettivo;
    const trimmed = text.trim();

    if (existing) {
      if (!trimmed) {
        updateEntriesState(prev => prev.filter(e => e.id !== existing.id));
        try {
          await yearlyEntriesApi.delete(existing.id);
        } catch (err) {
          logger.error('Errore eliminazione obiettivo:', err);
          updateEntriesState(prev => [...prev, existing]);
        }
      } else {
        const optimistic: DbYearlyEntry = { ...existing, yearly_field: trimmed };
        updateEntriesState(prev => prev.map(e => e.id === existing.id ? optimistic : e));
        try {
          const updated = await yearlyEntriesApi.update(existing.id, { yearly_field: trimmed });
          if (updated) {
            updateEntriesState(prev => prev.map(e => e.id === existing.id ? updated : e));
          }
        } catch (err) {
          logger.error('Errore aggiornamento obiettivo:', err);
          updateEntriesState(prev => prev.map(e => e.id === existing.id ? existing : e));
        }
      }
    } else if (trimmed) {
      const tempId = -Date.now();
      const optimistic: DbYearlyEntry = {
        id: tempId,
        user_id: 0,
        year,
        yearly_type: 'OY',
        yearly_field: trimmed,
      };
      updateEntriesState(prev => [...prev, optimistic]);

      try {
        const created = await yearlyEntriesApi.create({ year, yearly_type: 'OY', yearly_field: trimmed });
        if (created) {
          updateEntriesState(prev => prev.map(e => e.id === tempId ? created : e));
        }
      } catch (err) {
        logger.error('Errore creazione obiettivo:', err);
        updateEntriesState(prev => prev.filter(e => e.id !== tempId));
      }
    }
  };

  const handleSavePriority = async (index: number, id: number | undefined, text: string) => {
    const type: YearlyType = `P${index + 1}` as YearlyType;
    const existing = id ? entries.find(e => e.id === id) : entries.find(e => e.yearly_type === type);
    const trimmed = text.trim();

    if (existing) {
      if (!trimmed) {
        updateEntriesState(prev => prev.filter(e => e.id !== existing.id));
        try {
          await yearlyEntriesApi.delete(existing.id);
        } catch (err) {
          logger.error('Errore eliminazione priorità:', err);
          updateEntriesState(prev => [...prev, existing]);
        }
      } else {
        const optimistic: DbYearlyEntry = { ...existing, yearly_field: trimmed };
        updateEntriesState(prev => prev.map(e => e.id === existing.id ? optimistic : e));
        try {
          const updated = await yearlyEntriesApi.update(existing.id, { yearly_field: trimmed });
          if (updated) {
            updateEntriesState(prev => prev.map(e => e.id === existing.id ? updated : e));
          }
        } catch (err) {
          logger.error('Errore aggiornamento priorità:', err);
          updateEntriesState(prev => prev.map(e => e.id === existing.id ? existing : e));
        }
      }
    } else if (trimmed) {
      const tempId = -(Date.now() + index);
      const optimistic: DbYearlyEntry = {
        id: tempId,
        user_id: 0,
        year,
        yearly_type: type,
        yearly_field: trimmed,
      };
      updateEntriesState(prev => [...prev, optimistic]);

      try {
        const created = await yearlyEntriesApi.create({ year, yearly_type: type, yearly_field: trimmed });
        if (created) {
          updateEntriesState(prev => prev.map(e => e.id === tempId ? created : e));
        }
      } catch (err) {
        logger.error('Errore creazione priorità:', err);
        updateEntriesState(prev => prev.filter(e => e.id !== tempId));
      }
    }
  };

  const handleAddProposito = async () => {
    const created = await yearlyEntriesApi.create({ year, yearly_type: 'PR', yearly_field: '' });
    if (created) updateEntriesState(prev => [...prev, created]);
  };

  const handleUpdateProposito = async (id: number, text: string) => {
    const updated = await yearlyEntriesApi.update(id, { yearly_field: text });
    if (updated) updateEntriesState(prev => prev.map(e => e.id === id ? updated : e));
  };

  const handleDeleteProposito = async (id: number) => {
    await yearlyEntriesApi.delete(id);
    updateEntriesState(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveAnswer = async (code: YearlyType, text: string, existingId?: number) => {
    if (existingId) {
      const updated = await yearlyEntriesApi.update(existingId, { yearly_field: text });
      if (updated) updateEntriesState(prev => prev.map(e => e.id === existingId ? updated : e));
    } else {
      const created = await yearlyEntriesApi.create({ year, yearly_type: code, yearly_field: text });
      if (created) updateEntriesState(prev => [...prev, created]);
    }
  };

  const handleAddEvento = async (tipo: 'EP' | 'EN', testo: string) => {
    const created = await yearlyEntriesApi.create({ year, yearly_type: tipo, yearly_field: testo });
    if (created) updateEntriesState(prev => [...prev, created]);
  };

  const handleUpdateEvento = async (id: number, testo: string) => {
    const updated = await yearlyEntriesApi.update(id, { yearly_field: testo });
    if (updated) updateEntriesState(prev => prev.map(e => e.id === id ? updated : e));
  };

  const handleDeleteEvento = async (id: number) => {
    await yearlyEntriesApi.delete(id);
    updateEntriesState(prev => prev.filter(e => e.id !== id));
  };

  return {
    entries,
    obiettivo,
    priorita,
    propositi,
    moodsUI: trackerLogic.moodsUI,
    spheresUI: trackerLogic.spheresUI,
    eventiPositivi,
    eventiNegativi,
    assignedTags: tagLogic.assignedTags,
    allTags: tagLogic.allTags,
    tagEntryMap: tagLogic.tagEntryMap,
    handleSaveObiettivo,
    handleSavePriority,
    handleAddProposito,
    handleUpdateProposito,
    handleDeleteProposito,
    handleUpdateMood: trackerLogic.handleUpdateMood,
    handleUpdateSphere: trackerLogic.handleUpdateSphere,
    handleSaveAnswer,
    handleAddEvento,
    handleUpdateEvento,
    handleDeleteEvento,
    handleAddTag: tagLogic.handleAddTag,
    handleCreateAndAddTag: tagLogic.handleCreateAndAddTag,
    handleRemoveTag: tagLogic.handleRemoveTag,
  };
};
