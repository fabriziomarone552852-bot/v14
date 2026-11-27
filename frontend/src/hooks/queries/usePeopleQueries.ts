import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { PersonDetailResponse, TMDBPaginatedPersonSearch } from '@/types/people';

export const peopleKeys = {
  all: ['trackers', 'people'] as const,
  search: (query: string, page: number = 1) => [...peopleKeys.all, 'search', query, page] as const,
  detail: (personId: number | null | undefined) => [...peopleKeys.all, 'detail', personId] as const,
};

/**
 * Ricerca live persone (attori, registi, creatori) su TMDB per l'autocompletamento.
 */
export function useSearchTMDBPeople(query: string, enabled: boolean = true, page: number = 1) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: peopleKeys.search(trimmed, page),
    queryFn: async () => {
      return await api.get<TMDBPaginatedPersonSearch>('/trackers/people/search', {
        params: { query: trimmed, page },
      });
    },
    enabled: enabled && trimmed.length >= 2,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

/**
 * Carica profilo biografico e filmografia completa (film e serie TV deduplicati) di una persona TMDB.
 */
export function usePersonDetail(personId: number | null | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: peopleKeys.detail(personId),
    queryFn: async () => {
      return await api.get<PersonDetailResponse>(`/trackers/people/${personId}`);
    },
    enabled: enabled && typeof personId === 'number' && personId > 0,
    staleTime: 1000 * 60 * 60 * 12,
    retry: 1,
  });
}
