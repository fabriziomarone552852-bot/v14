// src/hooks/useOptimisticTag.ts
//
// Hook condiviso per la creazione ottimistica di tag (categorie con genre=5).
// Usato sia dalla review mensile (useMonthReview) che dalla review annuale (useYearEntries).
//
// Perché esiste: Questa logica era duplicata in entrambi gli hook (~100 righe ciascuno).
// Ora vive in un unico posto, eliminando la duplicazione e garantendo un comportamento identico.

import { useCallback } from 'react';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { logger } from '@/utils/logger';
import type { Category } from '@/types/categories';

/**
 * Configurazione per il tipo di entry (monthly o yearly) da creare col tag.
 * Questo permette all'hook di funzionare sia con le monthly_entries che con le yearly_entries.
 */
interface OptimisticTagConfig<TEntry> {
  /** Il nome del campo dove si salva il category_id (es. 'monthly_field' o 'yearly_field') */
  fieldName: keyof TEntry;
  /** Il nome del campo "type" nell'entry (es. 'monthly_type' o 'yearly_type') */
  typeName: keyof TEntry;
  /** Il nome della chiave nell'oggetto cache che contiene l'array di entries */
  entriesKey: string;
  /** Funzione che crea un entry temporaneo con i campi corretti */
  createTempEntry: (tempId: number, tempCatId: number) => TEntry;
  /** Funzione che crea l'entry definitivo sul backend e ritorna la entry reale */
  createRealEntry: (realCatId: number) => Promise<TEntry | null>;
}

interface UseOptimisticTagReturn {
  handleCreateAndAddTag: (tagName: string) => void;
}

/**
 * Hook generico per creare un tag "al volo" in modo ottimistico.
 *
 * Flusso:
 * 1. Controlla se il tag esiste già → se sì, chiama handleAddTag
 * 2. Inietta una categoria temporanea (id negativo) nella cache
 * 3. Inietta un entry temporaneo nella cache del contesto (mese/anno)
 * 4. Crea la categoria reale sul backend
 * 5. Sostituisce gli ID temporanei con quelli reali
 * 6. Crea l'entry reale sul backend
 * 7. In caso di errore, fa rollback di tutto
 */
export function useOptimisticTag<TEntry>(
  allTags: Category[],
  handleAddTag: (categoryId: number) => void | Promise<void>,
  queryKey: QueryKey,
  config: OptimisticTagConfig<TEntry>,
): UseOptimisticTagReturn {
  const queryClient = useQueryClient();

  const handleCreateAndAddTag = useCallback((tagName: string) => {
    // Se esiste già un tag (genre=5) con lo stesso nome, usalo
    const existing = allTags.find(
      t => t.category_name.toLowerCase() === tagName.toLowerCase()
    );
    if (existing) {
      handleAddTag(existing.id);
      return;
    }

    const tempCatId = -(Date.now());
    const tempEntryId = tempCatId - 1;

    // 1. Inietta categoria temporanea nella cache
    const tempCategory: Category = {
      id: tempCatId,
      category_name: tagName.trim().toLowerCase(),
      colore: '#6366f1',
      user_id: null,
      genre: 5,
    };
    queryClient.setQueryData<Category[]>(['categories'], (old) =>
      old ? [...old, tempCategory] : [tempCategory]
    );

    // 2. Inietta entry temporaneo nella cache del contesto (mese o anno)
    const tempEntry = config.createTempEntry(tempEntryId, tempCatId);
    queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
      if (!old) return old;
      const entries = (old[config.entriesKey] as TEntry[]) || [];
      return { ...old, [config.entriesKey]: [...entries, tempEntry] };
    });

    // 3. In background: crea categoria VERA → poi crea entry VERO
    api.post<Category>('/categories', {
      category_name: tagName,
      colore: '#6366f1',
      genre: 5,
    }).then(newCat => {
      if (!newCat) throw new Error('Creazione categoria fallita');

      // Aggiorna categoria E campo entry insieme → zero flash
      queryClient.setQueryData<Category[]>(['categories'], (old) =>
        (old || []).map(c => c.id === tempCatId ? newCat : c)
      );
      queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const entries = (old[config.entriesKey] as TEntry[]) || [];
        return {
          ...old,
          [config.entriesKey]: entries.map(e => {
            const entryRecord = e as Record<string, unknown>;
            return entryRecord['id'] === tempEntryId
              ? { ...e, [config.fieldName]: String(newCat.id) }
              : e;
          }),
        };
      });

      // Crea l'entry VERO con l'ID categoria reale
      return config.createRealEntry(newCat.id).then(realEntry => {
        if (!realEntry) return;
        // Sostituisci l'entry temporaneo con quello reale
        queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
          if (!old) return old;
          const entries = (old[config.entriesKey] as TEntry[]) || [];
          return {
            ...old,
            [config.entriesKey]: entries.map(e => {
              const entryRecord = e as Record<string, unknown>;
              return entryRecord['id'] === tempEntryId ? realEntry : e;
            }),
          };
        });
      });
    }).catch(err => {
      logger.error('Errore creazione tag:', err);
      // Rollback: rimuovi temporanei
      queryClient.setQueryData<Category[]>(['categories'], (old) =>
        (old || []).filter(c => c.id !== tempCatId)
      );
      queryClient.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        const entries = (old[config.entriesKey] as TEntry[]) || [];
        return {
          ...old,
          [config.entriesKey]: (entries as Array<Record<string, unknown>>).filter(e => e['id'] !== tempEntryId),
        };
      });
    });
  }, [handleAddTag, allTags, queryClient, queryKey, config]);

  return { handleCreateAndAddTag };
}
