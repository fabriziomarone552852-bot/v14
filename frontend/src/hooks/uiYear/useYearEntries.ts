// frontend/src/hooks/uiYear/useYearEntries.ts
import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import { useCategories } from '@/hooks/useCategories';
import { api } from '@/api/apiService';
import type { SyncYearResponse } from '@/hooks/useAgendaYear';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';
import { YEARLY_MOOD_COLORS, YEARLY_MOOD_LABELS, YEARLY_SPHERE_COLORS, YEARLY_SPHERE_LABELS } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';
import type { TrackerItem } from '@/types/monthlyentries';

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
  handleCreateAndAddTag: (tagName: string) => Promise<void>;
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
  };

  const obiettivo = useMemo(() => entries.find(e => e.yearly_type === 'OY') || null, [entries]);
  
  const priorita = useMemo(() => {
    return [
      entries.find(e => e.yearly_type === 'P1') || null,
      entries.find(e => e.yearly_type === 'P2') || null,
      entries.find(e => e.yearly_type === 'P3') || null,
    ];
  }, [entries]);

  // PROPOSITI: Ordinati SEMPRE per id.asc() (il più recente rimane sempre IN BASSO)
  const propositi = useMemo(
    () => entries.filter(e => e.yearly_type === 'PR').sort((a, b) => a.id - b.id),
    [entries]
  );

  const eventiPositivi = useMemo(() => entries.filter(e => e.yearly_type === 'EP'), [entries]);
  const eventiNegativi = useMemo(() => entries.filter(e => e.yearly_type === 'EN'), [entries]);

  const moodsUI = useMemo((): TrackerItem[] => {
    return (Object.keys(YEARLY_MOOD_LABELS) as (keyof typeof YEARLY_MOOD_LABELS)[]).map(code => {
      const entry = entries.find(e => e.yearly_type === code);
      return {
        id: code,
        name: YEARLY_MOOD_LABELS[code],
        category: 'MOOD',
        colorHex: YEARLY_MOOD_COLORS[code],
        currentValue: entry && entry.yearly_field ? parseInt(entry.yearly_field, 10) || 0 : 0,
        previousValue: 0,
      };
    });
  }, [entries]);

  const spheresUI = useMemo((): TrackerItem[] => {
    return (Object.keys(YEARLY_SPHERE_LABELS) as (keyof typeof YEARLY_SPHERE_LABELS)[]).map(code => {
      const entry = entries.find(e => e.yearly_type === code);
      return {
        id: code,
        name: YEARLY_SPHERE_LABELS[code],
        category: 'SPHERE',
        colorHex: YEARLY_SPHERE_COLORS[code],
        currentValue: entry && entry.yearly_field ? parseInt(entry.yearly_field, 10) || 0 : 0,
        previousValue: 0,
      };
    });
  }, [entries]);

  const handleSaveObiettivo = async (text: string) => {
    const existing = obiettivo;
    if (existing) {
      const updated = await yearlyEntriesApi.update(existing.id, { yearly_field: text });
      if (updated) updateEntriesState(prev => prev.map(e => e.id === existing.id ? updated : e));
    } else {
      const created = await yearlyEntriesApi.create({ year, yearly_type: 'OY', yearly_field: text });
      if (created) updateEntriesState(prev => [...prev, created]);
    }
  };

  const handleSavePriority = async (index: number, id: number | undefined, text: string) => {
    const type: YearlyType = `P${index + 1}` as YearlyType;
    if (id) {
      const updated = await yearlyEntriesApi.update(id, { yearly_field: text });
      if (updated) updateEntriesState(prev => prev.map(e => e.id === id ? updated : e));
    } else {
      const created = await yearlyEntriesApi.create({ year, yearly_type: type, yearly_field: text });
      if (created) updateEntriesState(prev => [...prev, created]);
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

  const handleUpdateMood = async (id: string, newValue: number) => {
    const existing = entries.find(e => e.yearly_type === id);
    if (existing) {
      const updated = await yearlyEntriesApi.update(existing.id, { yearly_field: newValue.toString() });
      if (updated) updateEntriesState(prev => prev.map(e => e.id === existing.id ? updated : e));
    } else {
      const created = await yearlyEntriesApi.create({ year, yearly_type: id as YearlyType, yearly_field: newValue.toString() });
      if (created) updateEntriesState(prev => [...prev, created]);
    }
  };

  const handleUpdateSphere = async (id: string, newValue: number) => {
    const existing = entries.find(e => e.yearly_type === id);
    if (existing) {
      const updated = await yearlyEntriesApi.update(existing.id, { yearly_field: newValue.toString() });
      if (updated) updateEntriesState(prev => prev.map(e => e.id === existing.id ? updated : e));
    } else {
      const created = await yearlyEntriesApi.create({ year, yearly_type: id as YearlyType, yearly_field: newValue.toString() });
      if (created) updateEntriesState(prev => [...prev, created]);
    }
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

  const { data: dbCategories = [] } = useCategories();

  const allTags = useMemo(() => dbCategories.filter(c => c.genre === 5), [dbCategories]);

  const tagEntries = useMemo(
    () => entries.filter(e => e.yearly_type === 'TG').sort((a, b) => Math.abs(a.id) - Math.abs(b.id)),
    [entries]
  );

  const assignedTags = useMemo(() => {
    return tagEntries
      .map(te => {
        const catId = parseInt(te.yearly_field ?? '', 10);
        return dbCategories.find(t => t.id === catId);
      })
      .filter((t): t is Category => !!t);
  }, [tagEntries, dbCategories]);

  const tagEntryMap = useMemo(() => {
    const map: Record<number, number> = {};
    tagEntries.forEach(te => {
      const catId = parseInt(te.yearly_field ?? '', 10);
      if (!isNaN(catId)) map[catId] = te.id;
    });
    return map;
  }, [tagEntries]);

  const handleAddTag = async (categoryId: number) => {
    const created = await yearlyEntriesApi.create({ year, yearly_type: 'TG', yearly_field: String(categoryId) });
    if (created) updateEntriesState(prev => [...prev, created]);
  };

  const handleCreateAndAddTag = async (tagName: string) => {
    const existing = allTags.find(t => t.category_name.toLowerCase() === tagName.toLowerCase());
    if (existing) {
      await handleAddTag(existing.id);
      return;
    }

    const newCat = await api.post<Category>('/categories', {
      category_name: tagName,
      colore: '#6366f1',
      genre: 5,
    });
    if (newCat) {
      const created = await yearlyEntriesApi.create({ year, yearly_type: 'TG', yearly_field: String(newCat.id) });
      if (created) updateEntriesState(prev => [...prev, created]);
    }
  };

  const handleRemoveTag = async (yearlyEntryId: number) => {
    await yearlyEntriesApi.delete(yearlyEntryId);
    updateEntriesState(prev => prev.filter(e => e.id !== yearlyEntryId));
  };

  return {
    entries,
    obiettivo,
    priorita,
    propositi,
    moodsUI,
    spheresUI,
    eventiPositivi,
    eventiNegativi,
    assignedTags,
    allTags,
    tagEntryMap,
    handleSaveObiettivo,
    handleSavePriority,
    handleAddProposito,
    handleUpdateProposito,
    handleDeleteProposito,
    handleUpdateMood,
    handleUpdateSphere,
    handleSaveAnswer,
    handleAddEvento,
    handleUpdateEvento,
    handleDeleteEvento,
    handleAddTag,
    handleCreateAndAddTag,
    handleRemoveTag,
  };
};
