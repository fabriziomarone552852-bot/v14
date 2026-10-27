import { useMemo } from 'react';
import type { Movie, MovieFilters } from '@/types/movies';
import type { MediaList } from '@/types/trackers';

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

      // 2. Keyword
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(kw);
        const matchesOriginal = m.original_title?.toLowerCase().includes(kw);
        if (!matchesTitle && !matchesOriginal) return false;
      }

      // 3. Genre
      if (filters.genre !== 'all') {
        if (!m.genres || !m.genres.toLowerCase().includes(filters.genre.toLowerCase())) {
          return false;
        }
      }

      // 4. Platform
      if (filters.platform !== 'all') {
        const matchesPlatform = m.logs?.some(
          (log) => log.viewing_platform_name?.toLowerCase() === filters.platform.toLowerCase()
        );
        if (!matchesPlatform) return false;
      }

      // 5. Saga / Collezione
      if (filters.saga !== 'all') {
        const sagaId = Number(filters.saga);
        if (!isNaN(sagaId)) {
          if (m.collection_id !== sagaId) return false;
        } else {
          if (m.collection_name?.toLowerCase() !== filters.saga.toLowerCase()) return false;
        }
      }

      // 6. Year
      if (filters.year && filters.year !== 'all') {
        const yearMatch =
          m.release_date?.startsWith(filters.year) ||
          m.italy_release_date?.startsWith(filters.year);
        if (!yearMatch) return false;
      }

      // 7. Rating personale
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

      // 9. Lista Personale (liste miste MediaList)
      if (filters.listId !== null && myLists) {
        const targetList = myLists.find((l) => l.id === filters.listId);
        if (targetList) {
          const isInList = targetList.items?.some(
            (item) => item.movie_tmdb_id === m.tmdb_id
          );
          if (!isInList) return false;
        } else {
          return false;
        }
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
