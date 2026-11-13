import { useMemo } from 'react';
import type { TVSeries } from '@/types/trackers';
import { useTMDBGenres, useTMDBProviders } from '@/hooks/queries/useTrackersQueries';
import { deduplicatePlatformOptions } from '@/utils/platformFilterUtils';
import { useAuth } from '@/context/AuthContext';
import {
  EMPTY_GENRE_FILTER,
  isGenreFilterActive,
  type GenreFilterRule,
} from '@/utils/trackerFilterUtils';

export interface MediaFilterState {
  keyword: string;
  genres: GenreFilterRule;
  networks: string[];
  ratings: string[];
  tmdbStatuses: string[];
  years: string[];
  sortBy: string;
  listIds: number[];
  globalSearch?: boolean;
}

export const DEFAULT_SERIES_FILTERS: MediaFilterState = {
  keyword: '',
  genres: EMPTY_GENRE_FILTER,
  networks: [],
  ratings: [],
  tmdbStatuses: [],
  years: [],
  sortBy: 'date_added_desc',
  listIds: [],
  globalSearch: false,
};

export const hasActiveSeriesFilters = (
  filters: MediaFilterState,
  options?: { ignoreGlobalSearch?: boolean }
): boolean => {
  return (
    Boolean(filters.keyword?.trim()) ||
    isGenreFilterActive(filters.genres) ||
    (filters.networks?.length ?? 0) > 0 ||
    (filters.ratings?.length ?? 0) > 0 ||
    (filters.tmdbStatuses?.length ?? 0) > 0 ||
    (filters.years?.length ?? 0) > 0 ||
    (filters.listIds?.length ?? 0) > 0 ||
    (Boolean(filters.sortBy) && filters.sortBy !== 'date_added_desc') ||
    (!options?.ignoreGlobalSearch && Boolean(filters.globalSearch))
  );
};

export const hasSeriesTMDBFilterCriteria = (filters: MediaFilterState): boolean => {
  return (
    isGenreFilterActive(filters.genres) ||
    (filters.networks?.length ?? 0) > 0 ||
    (filters.tmdbStatuses?.length ?? 0) > 0 ||
    (filters.years?.length ?? 0) > 0
  );
};

export const RATING_OPTIONS = [
  { value: '5', label: '5⭐' },
  { value: '4', label: '4⭐' },
  { value: '3', label: '3⭐' },
  { value: '2', label: '2⭐' },
  { value: '1', label: '1⭐' },
  { value: 'unrated', label: '🚫' },
];

export const TMDB_STATUS_OPTIONS = [
  { value: 'Ended', label: 'Conclusa' },
  { value: 'Returning Series', label: 'In produzione' },
  { value: 'Canceled', label: 'Cancellata' },
  { value: 'Miniseries', label: 'Miniserie' },
];

export const SORT_OPTIONS = [
  { value: 'date_added_desc', label: 'Aggiunte di recente' },
  { value: 'rating_desc', label: 'Voto migliore' },
  { value: 'name_asc', label: 'Nome (A-Z)' },
  { value: 'name_desc', label: 'Nome (Z-A)' },
  { value: 'release_date_desc', label: 'Anno (Più recenti)' },
  { value: 'release_date_asc', label: 'Anno (Più vecchie)' },
];

interface UseMediaFilterOptionsProps {
  series: TVSeries[];
  filters: MediaFilterState;
  onFilterChange: (newFilters: MediaFilterState) => void;
}

export const useMediaFilterOptions = ({
  series,
  filters,
  onFilterChange,
}: UseMediaFilterOptionsProps) => {
  const { user } = useAuth();

  const { data: tmdbGenres = [] } = useTMDBGenres();
  const { data: tmdbProviders = [] } = useTMDBProviders();
  const userProviders = user?.streaming_providers ?? [];

  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();

    if (filters.globalSearch) {
      tmdbGenres.forEach((g) => {
        if (g.name?.trim()) genresSet.add(g.name.trim());
      });
    } else {
      series.forEach((s) => {
        if (s.genres) {
          s.genres.split(',').forEach((g) => {
            if (g.trim()) genresSet.add(g.trim());
          });
        }
      });
    }

    filters.genres?.include?.forEach((g) => genresSet.add(g));
    filters.genres?.exclude?.forEach((g) => genresSet.add(g));

    return Array.from(genresSet)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'it'))
      .map((name) => ({ value: name, label: name }));
  }, [series, filters.globalSearch, filters.genres, tmdbGenres]);

  const availableNetworks = useMemo(() => {
    const userProviderNames = userProviders.map((p) => p.provider_name);

    if (filters.globalSearch) {
      return deduplicatePlatformOptions(
        tmdbProviders.map((p) => p.provider_name),
        [...userProviderNames, ...(filters.networks || [])]
      );
    }

    const watchProviderNames: string[] = [];
    const fallbackNames: string[] = [...userProviderNames, ...(filters.networks || [])];

    series.forEach((s) => {
      s.watch_providers?.forEach((wp) => {
        if (wp.provider_name) {
          watchProviderNames.push(wp.provider_name);
        }
      });
      s.episodes?.forEach((ep) => {
        ep.logs?.forEach((log) => {
          if (log.viewing_platform_name) {
            fallbackNames.push(log.viewing_platform_name);
          }
        });
      });
      if (s.networks) {
        s.networks.split(',').forEach((n) => fallbackNames.push(n));
      }
    });

    return deduplicatePlatformOptions(watchProviderNames, fallbackNames);
  }, [series, filters.globalSearch, filters.networks, tmdbProviders, userProviders]);

  const handleFieldChange = <K extends keyof MediaFilterState>(
    field: K,
    value: MediaFilterState[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const toggleRating = (val: string) => {
    const current = filters.ratings || [];
    const nextRatings = current.includes(val)
      ? current.filter((r) => r !== val)
      : [...current, val];
    handleFieldChange('ratings', nextRatings);
  };

  const handleToggleGlobalSearch = () => {
    onFilterChange({
      ...filters,
      globalSearch: !filters.globalSearch,
    });
  };

  return {
    availableGenres,
    availableNetworks,
    ratingOptions: RATING_OPTIONS,
    tmdbStatusOptions: TMDB_STATUS_OPTIONS,
    sortOptions: SORT_OPTIONS,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
  };
};
