import { useMemo } from 'react';
import type { Movie, MovieFilters } from '@/types/movies';
import type { MediaList } from '@/types/trackers';
import { matchesMoviePlatformFilter } from '@/utils/platformFilterUtils';
import {
  matchesGenreFilterRule,
  matchesYearMultiFilter,
} from '@/utils/trackerFilterUtils';

export const useFilteredMovies = (
  movies: Movie[] | undefined,
  filters: MovieFilters,
  activeTab: 'all' | 'to_watch' | 'watched',
  myLists: MediaList[] | undefined
): Movie[] => {
  return useMemo(() => {
    if (!movies) return [];

    const filtered = movies.filter((m) => {
      // 1. Tab attiva ('all' | 'to_watch' | 'watched')
      if (activeTab === 'to_watch' && m.status !== 'to_watch') return false;
      if (activeTab === 'watched' && m.status !== 'watched') return false;

      // 2. Keyword (Titolo italiano o originale)
      if (filters.keyword?.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(kw);
        const matchesOriginal = Boolean(m.original_title?.toLowerCase().includes(kw));
        if (!matchesTitle && !matchesOriginal) return false;
      }

      // 3. Generi (Includi con E / O + Escludi NO)
      if (!matchesGenreFilterRule(m.genres, filters.genres)) {
        return false;
      }

      // 4. Piattaforme (Multi-selezione O)
      if (!matchesMoviePlatformFilter(m, filters.platforms)) {
        return false;
      }

      // 5. Saga / Collezione (Multi-selezione O)
      if (filters.sagas && filters.sagas.length > 0) {
        const matchesSaga = filters.sagas.some((sagaToken) => {
          const sagaId = Number(sagaToken);
          if (!Number.isNaN(sagaId) && m.collection_id === sagaId) {
            return true;
          }
          return m.collection_name?.toLowerCase() === sagaToken.toLowerCase();
        });
        if (!matchesSaga) return false;
      }

      // 6. Anno di uscita (Multi-selezione O)
      if (filters.years && filters.years.length > 0) {
        const yearMatch =
          matchesYearMultiFilter(m.release_date, filters.years) ||
          matchesYearMultiFilter(m.italy_release_date, filters.years);
        if (!yearMatch) return false;
      }

      // 7. Voto Personale (Multi-selezione O)
      const activeRatings = filters.ratings || [];
      if (activeRatings.length > 0) {
        const r = m.my_rating != null ? Number(m.my_rating.toFixed(1)) : 0;
        let matched = false;
        if (activeRatings.includes('unrated') && (!m.my_rating || r === 0)) matched = true;
        if (activeRatings.includes('5') && r >= 4.9) matched = true;
        if (activeRatings.includes('4') && r >= 4.0 && r < 4.9) matched = true;
        if (activeRatings.includes('3') && r >= 3.0 && r < 4.0) matched = true;
        if (activeRatings.includes('2') && r >= 2.0 && r < 3.0) matched = true;
        if (activeRatings.includes('1') && r > 0 && r < 2.0) matched = true;

        if (!matched) return false;
      }

      // 8. Ottenuto / Disponibilità
      if (filters.obtainedFilter && filters.obtainedFilter !== 'all') {
        const isObtained = Boolean(m.obtained_at);
        if (filters.obtainedFilter === 'obtained' && !isObtained) return false;
        if (filters.obtainedFilter === 'not_obtained' && isObtained) return false;
      }

      // 9. Liste Personali (Multi-selezione O)
      if (filters.listIds && filters.listIds.length > 0) {
        if (!myLists) return false;
        const selectedLists = myLists.filter((l) => filters.listIds.includes(l.id));
        const isInAnySelectedList = selectedLists.some((l) =>
          l.items?.some((item) => item.movie_tmdb_id === m.tmdb_id)
        );
        if (!isInAnySelectedList) return false;
      }

      return true;
    });

    // Ordinamento
    filtered.sort((a, b) => {
      if (filters.sortBy === 'date_added_desc') {
        const dateA = new Date(a.added_at || a.updated_at || 0).getTime();
        const dateB = new Date(b.added_at || b.updated_at || 0).getTime();
        return dateB - dateA;
      }
      if (filters.sortBy === 'obtained_desc') {
        const dateA = new Date(a.obtained_at || 0).getTime();
        const dateB = new Date(b.obtained_at || 0).getTime();
        return dateB - dateA;
      }
      if (filters.sortBy === 'name_asc') {
        return a.title.localeCompare(b.title);
      }
      if (filters.sortBy === 'name_desc') {
        return b.title.localeCompare(a.title);
      }
      if (filters.sortBy === 'rating_desc') {
        return (b.my_rating || 0) - (a.my_rating || 0);
      }
      if (filters.sortBy === 'release_date_desc') {
        const dateA = new Date(a.release_date || a.italy_release_date || 0).getTime();
        const dateB = new Date(b.release_date || b.italy_release_date || 0).getTime();
        return dateB - dateA;
      }
      if (filters.sortBy === 'release_date_asc') {
        const dateA = new Date(a.release_date || a.italy_release_date || 0).getTime();
        const dateB = new Date(b.release_date || b.italy_release_date || 0).getTime();
        return dateA - dateB;
      }
      return 0;
    });

    return filtered;
  }, [movies, filters, activeTab, myLists]);
};
