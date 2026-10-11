import { useMemo } from 'react';
import type { TVSeries, MediaList } from '@/types/trackers';
import type { MediaFilterState } from '@/components/trackers/MediaFilterModal';
import { calculateSeriesRating } from '@/utils/ratingUtils';

export const useFilteredTVSeries = (
  series: TVSeries[] | undefined,
  filters: MediaFilterState,
  activeTab: 'all' | 'watching' | 'watched' | 'to_watch',
  myLists: MediaList[] | undefined
) => {
  return useMemo(() => {
    let displaySeries = (series || []).filter(s => {
      // 1. Tab Attiva (Stato Personale)
      if (activeTab !== 'all') {
        if (activeTab === 'watching' && s.status !== 'watching') return false;
        if (activeTab === 'to_watch' && s.status !== 'to_watch') return false;
        if (activeTab === 'watched' && s.status !== 'watched' && s.status !== 'completed') return false;
      }

      // 2. Keyword
      if (filters.keyword && !s.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
      
      // 3. Genre
      if (filters.genre !== 'all') {
        if (!s.genres || !s.genres.includes(filters.genre)) return false;
      }

      // 4. Network
      if (filters.network !== 'all') {
        if (!s.networks || !s.networks.includes(filters.network)) return false;
      }

      // 5. TMDB Status
      if (filters.tmdbStatus !== 'all') {
        if (filters.tmdbStatus === 'Miniseries') {
          if (s.tmdb_status !== 'Miniseries') return false;
        } else {
          if (s.tmdb_status !== filters.tmdbStatus) return false;
        }
      }

      // 6. Year
      if (filters.year && filters.year !== 'all') {
        if (!s.first_air_date || !s.first_air_date.startsWith(filters.year)) return false;
      }

      // 7. Rating Personale
      const activeRatings = filters.ratings || [];
      if (activeRatings.length > 0) {
        const rawR = calculateSeriesRating(s);
        const r = Number(rawR.toFixed(1));

        let matched = false;
        if (activeRatings.includes('unrated') && r === 0) matched = true;
        if (activeRatings.includes('5') && r >= 4.9) matched = true;
        if (activeRatings.includes('4') && r >= 4.0 && r < 4.9) matched = true;
        if (activeRatings.includes('3') && r >= 3.0 && r < 4.0) matched = true;
        if (activeRatings.includes('2') && r >= 2.0 && r < 3.0) matched = true;
        if (activeRatings.includes('1') && r > 0 && r < 2.0) matched = true;
        
        if (!matched) return false;
      }
      
      // 8. Lista Personale
      if (filters.listId !== null && myLists) {
        const targetList = myLists.find(l => l.id === filters.listId);
        if (targetList) {
          const isInList = targetList.items?.some((item) => item.series_tmdb_id === s.tmdb_id);
          if (!isInList) return false;
        } else {
          return false;
        }
      }

      return true;
    });

    displaySeries.sort((a, b) => {
      if (filters.sortBy === 'date_added_desc') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else if (filters.sortBy === 'name_asc') {
        return a.title.localeCompare(b.title);
      } else if (filters.sortBy === 'name_desc') {
        return b.title.localeCompare(a.title);
      } else if (filters.sortBy === 'rating_desc') {
        return calculateSeriesRating(b) - calculateSeriesRating(a);
      } else if (filters.sortBy === 'release_date_desc') {
        return new Date(b.first_air_date || 0).getTime() - new Date(a.first_air_date || 0).getTime();
      } else if (filters.sortBy === 'release_date_asc') {
        return new Date(a.first_air_date || 0).getTime() - new Date(b.first_air_date || 0).getTime();
      }
      return 0;
    });

    return displaySeries;
  }, [series, filters, activeTab, myLists]);
};
