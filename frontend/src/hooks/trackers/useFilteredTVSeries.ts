import { useMemo } from 'react';
import type { TVSeries, MediaList } from '@/types/trackers';
import type { MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';
import { calculateSeriesRating } from '@/utils/ratingUtils';
import { normalizeMediaStatus } from '@/utils/mediaStatusTheme';
import { matchesSeriesPlatformFilter } from '@/utils/platformFilterUtils';
import {
  matchesGenreFilterRule,
  matchesYearMultiFilter,
} from '@/utils/trackerFilterUtils';

export type FilteredTVSeriesTab =
  | 'all'
  | 'watching'
  | 'watched'
  | 'to_watch'
  | 'waiting'
  | 'completed';

export const useFilteredTVSeries = (
  series: TVSeries[] | undefined,
  filters: MediaFilterState,
  activeTab: FilteredTVSeriesTab,
  myLists: MediaList[] | undefined
): TVSeries[] => {
  return useMemo(() => {
    const displaySeries = (series || []).filter((s) => {
      // 1. Tab Attiva (Stato Personale Normalizzato)
      if (activeTab !== 'all') {
        const norm = normalizeMediaStatus(s.status, s.tmdb_status);
        if (activeTab === 'watching' && norm !== 'watching') return false;
        if (activeTab === 'waiting' && norm !== 'waiting') return false;
        if (
          activeTab === 'to_watch' &&
          !['to_watch', 'dropped', 'on_hold', 'untracked'].includes(norm)
        ) {
          return false;
        }
        if (
          (activeTab === 'watched' || activeTab === 'completed') &&
          norm !== 'completed' &&
          norm !== 'waiting'
        ) {
          return false;
        }
      }

      // 2. Keyword (Titolo italiano o originale)
      if (filters.keyword?.trim()) {
        const kw = filters.keyword.trim().toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(kw);
        const matchesOriginal = Boolean(s.original_title?.toLowerCase().includes(kw));
        if (!matchesTitle && !matchesOriginal) return false;
      }

      // 3. Generi (Includi con E / O + Escludi NO)
      if (!matchesGenreFilterRule(s.genres, filters.genres)) {
        return false;
      }

      // 4. Piattaforme / Network (Multi-selezione O)
      if (!matchesSeriesPlatformFilter(s, filters.networks)) {
        return false;
      }

      // 5. Stato Produzione TMDB (Multi-selezione O)
      if (filters.tmdbStatuses && filters.tmdbStatuses.length > 0) {
        if (!s.tmdb_status || !filters.tmdbStatuses.includes(s.tmdb_status)) {
          return false;
        }
      }

      // 6. Anno di uscita (Multi-selezione O)
      if (!matchesYearMultiFilter(s.first_air_date, filters.years)) {
        return false;
      }

      // 7. Voto Personale (Multi-selezione O)
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

      // 8. Liste Personali (Multi-selezione O)
      if (filters.listIds && filters.listIds.length > 0) {
        if (!myLists) return false;
        const selectedLists = myLists.filter((l) => filters.listIds.includes(l.id));
        const isInAnySelectedList = selectedLists.some((l) =>
          l.items?.some((item) => item.series_tmdb_id === s.tmdb_id)
        );
        if (!isInAnySelectedList) return false;
      }

      return true;
    });

    displaySeries.sort((a, b) => {
      if (filters.sortBy === 'date_added_desc') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (filters.sortBy === 'name_asc') {
        return a.title.localeCompare(b.title);
      }
      if (filters.sortBy === 'name_desc') {
        return b.title.localeCompare(a.title);
      }
      if (filters.sortBy === 'rating_desc') {
        return calculateSeriesRating(b) - calculateSeriesRating(a);
      }
      if (filters.sortBy === 'release_date_desc') {
        return (
          new Date(b.first_air_date || 0).getTime() -
          new Date(a.first_air_date || 0).getTime()
        );
      }
      if (filters.sortBy === 'release_date_asc') {
        return (
          new Date(a.first_air_date || 0).getTime() -
          new Date(b.first_air_date || 0).getTime()
        );
      }
      return 0;
    });

    return displaySeries;
  }, [series, filters, activeTab, myLists]);
};
