// src/hooks/uiYear/useYearlyTags.ts
import { useMemo } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { yearlyEntriesApi } from '@/api/yearlyEntriesApi';
import { useCategories } from '@/hooks/useCategories';
import { useOptimisticTag } from '@/hooks/useOptimisticTag';
import { logger } from '@/utils/logger';
import type { DbYearlyEntry, YearlyType } from '@/types/yearlyentries';
import type { Category } from '@/types/categories';

export interface UseYearlyTagsProps {
  entries: DbYearlyEntry[];
  year: number;
  queryKey: QueryKey;
  updateEntriesState: (updater: (prev: DbYearlyEntry[]) => DbYearlyEntry[]) => void;
}

export function useYearlyTags({
  entries,
  year,
  queryKey,
  updateEntriesState,
}: UseYearlyTagsProps) {
  const queryClient = useQueryClient();
  const { data: dbCategories = [] } = useCategories();

  const allTags = useMemo(() => dbCategories.filter((c) => c.genre === 5), [dbCategories]);

  const tagEntries = useMemo(
    () => entries.filter((e) => e.yearly_type === 'TG').sort((a, b) => Math.abs(a.id) - Math.abs(b.id)),
    [entries]
  );

  const assignedTags = useMemo(() => {
    return tagEntries
      .map((te) => {
        const catId = parseInt(te.yearly_field ?? '', 10);
        return dbCategories.find((t) => t.id === catId);
      })
      .filter((t): t is Category => !!t);
  }, [tagEntries, dbCategories]);

  const tagEntryMap = useMemo(() => {
    const map: Record<number, number> = {};
    tagEntries.forEach((te) => {
      const catId = parseInt(te.yearly_field ?? '', 10);
      if (!isNaN(catId)) map[catId] = te.id;
    });
    return map;
  }, [tagEntries]);

  const handleAddTag = async (categoryId: number) => {
    const tempId = -Date.now();
    const optimisticEntry: DbYearlyEntry = {
      id: tempId,
      user_id: 0,
      year,
      yearly_type: 'TG',
      yearly_field: String(categoryId),
    };
    updateEntriesState((prev) => [...prev, optimisticEntry]);

    try {
      const created = await yearlyEntriesApi.create({
        year,
        yearly_type: 'TG',
        yearly_field: String(categoryId),
      });
      if (created) {
        updateEntriesState((prev) => prev.map((e) => (e.id === tempId ? created : e)));
      }
    } catch (err) {
      logger.error('Errore aggiunta tag anno:', err);
      updateEntriesState((prev) => prev.filter((e) => e.id !== tempId));
    } finally {
      queryClient.invalidateQueries({ queryKey });
    }
  };

  const { handleCreateAndAddTag } = useOptimisticTag<DbYearlyEntry>(
    allTags,
    handleAddTag,
    queryKey,
    {
      fieldName: 'yearly_field',
      typeName: 'yearly_type',
      entriesKey: 'entries',
      createTempEntry: (tempId, tempCatId) => ({
        id: tempId,
        user_id: 0,
        year,
        yearly_type: 'TG' as YearlyType,
        yearly_field: String(tempCatId),
      }),
      createRealEntry: (realCatId) =>
        yearlyEntriesApi.create({
          year,
          yearly_type: 'TG',
          yearly_field: String(realCatId),
        }),
    }
  );

  const handleRemoveTag = async (yearlyEntryId: number) => {
    const backup = entries.find((e) => e.id === yearlyEntryId);
    updateEntriesState((prev) => prev.filter((e) => e.id !== yearlyEntryId));

    try {
      await yearlyEntriesApi.delete(yearlyEntryId);
    } catch (err) {
      logger.error('Errore rimozione tag:', err);
      if (backup) {
        updateEntriesState((prev) => [...prev, backup]);
      }
    } finally {
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return {
    allTags,
    assignedTags,
    tagEntryMap,
    handleAddTag,
    handleCreateAndAddTag,
    handleRemoveTag,
  };
}
