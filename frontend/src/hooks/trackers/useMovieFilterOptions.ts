import { useMemo } from 'react';
import type { Movie, MovieFilters } from '@/types/movies';
import { useTMDBMovieGenres, useTMDBMovieProviders } from '@/hooks/queries/useMovieQueries';
import { deduplicatePlatformOptions } from '@/utils/platformFilterUtils';
import { useAuth } from '@/context/AuthContext';
import {
  EMPTY_GENRE_FILTER,
  isGenreFilterActive,
} from '@/utils/trackerFilterUtils';

export const DEFAULT_MOVIE_FILTERS: MovieFilters = {
  keyword: '',
  people: '',
  peopleMode: 'AND',
  genres: EMPTY_GENRE_FILTER,
  platforms: [],
  years: [],
  sagas: [],
  ratings: [],
  sortBy: 'date_added_desc',
  listIds: [],
  obtainedFilter: 'all',
  globalSearch: false,
};

export const hasActiveMovieFilters = (
  filters: MovieFilters,
  options?: { ignoreGlobalSearch?: boolean }
): boolean => {
  return (
    Boolean(filters.keyword?.trim()) ||
    Boolean(filters.people?.trim()) ||
    isGenreFilterActive(filters.genres) ||
    (filters.platforms?.length ?? 0) > 0 ||
    (filters.years?.length ?? 0) > 0 ||
    (filters.sagas?.length ?? 0) > 0 ||
    (filters.ratings?.length ?? 0) > 0 ||
    (filters.listIds?.length ?? 0) > 0 ||
    (Boolean(filters.obtainedFilter) && filters.obtainedFilter !== 'all') ||
    (Boolean(filters.sortBy) && filters.sortBy !== 'date_added_desc') ||
    (!options?.ignoreGlobalSearch && Boolean(filters.globalSearch))
  );
};

export const hasMovieTMDBFilterCriteria = (filters: MovieFilters): boolean => {
  return (
    Boolean(filters.people?.trim()) ||
    isGenreFilterActive(filters.genres) ||
    (filters.platforms?.length ?? 0) > 0 ||
    (filters.years?.length ?? 0) > 0
  );
};

export const MOVIE_RATING_OPTIONS = [
  { value: '5', label: '5⭐' },
  { value: '4', label: '4⭐' },
  { value: '3', label: '3⭐' },
  { value: '2', label: '2⭐' },
  { value: '1', label: '1⭐' },
  { value: 'unrated', label: '🚫' },
];

export const MOVIE_SORT_OPTIONS = [
  { value: 'date_added_desc', label: 'Aggiunti di recente' },
  { value: 'obtained_desc', label: 'Ottenuti di recente' },
  { value: 'rating_desc', label: 'Voto migliore' },
  { value: 'name_asc', label: 'Titolo (A-Z)' },
  { value: 'name_desc', label: 'Titolo (Z-A)' },
  { value: 'release_date_desc', label: 'Anno (Più recenti)' },
  { value: 'release_date_asc', label: 'Anno (Più vecchi)' },
];

export const MOVIE_OBTAINED_OPTIONS = [
  { value: 'all', label: 'Tutti (Ottenuti e non)' },
  { value: 'obtained', label: 'Solo ottenuti (Disponibili)' },
  { value: 'not_obtained', label: 'Da ottenere' },
];

interface UseMovieFilterOptionsProps {
  movies: Movie[];
  filters: MovieFilters;
  onFilterChange: (newFilters: MovieFilters) => void;
}

export const useMovieFilterOptions = ({
  movies,
  filters,
  onFilterChange,
}: UseMovieFilterOptionsProps) => {
  const { user } = useAuth();

  const { data: tmdbGenres = [] } = useTMDBMovieGenres();
  const { data: tmdbProviders = [] } = useTMDBMovieProviders();
  const userProviders = user?.streaming_providers ?? [];

  const availableGenres = useMemo(() => {
    const genresSet = new Set<string>();

    if (filters.globalSearch) {
      tmdbGenres.forEach((g) => {
        if (g.name?.trim()) genresSet.add(g.name.trim());
      });
    } else {
      movies.forEach((m) => {
        if (m.genres) {
          m.genres.split(',').forEach((g) => {
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
  }, [movies, filters.globalSearch, filters.genres, tmdbGenres]);

  const availablePlatforms = useMemo(() => {
    const userProviderNames = userProviders.map((p) => p.provider_name);

    if (filters.globalSearch) {
      return deduplicatePlatformOptions(
        tmdbProviders.map((p) => p.provider_name),
        [...userProviderNames, ...(filters.platforms || [])]
      );
    }

    const watchProviderNames: string[] = [];
    const logPlatformNames: string[] = [...userProviderNames, ...(filters.platforms || [])];

    movies.forEach((m) => {
      m.watch_providers?.forEach((wp) => {
        if (wp.provider_name) {
          watchProviderNames.push(wp.provider_name);
        }
      });
      m.logs?.forEach((log) => {
        if (log.viewing_platform_name) {
          logPlatformNames.push(log.viewing_platform_name);
        }
      });
    });

    return deduplicatePlatformOptions(watchProviderNames, logPlatformNames);
  }, [movies, filters.globalSearch, filters.platforms, tmdbProviders, userProviders]);

  const availableSagas = useMemo(() => {
    const sagaMap = new Map<string, string>();
    movies.forEach((m) => {
      if (m.collection_id && m.collection_name) {
        sagaMap.set(String(m.collection_id), m.collection_name);
      }
    });
    return Array.from(sagaMap.entries())
      .map(([id, name]) => ({ value: id, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label, 'it'));
  }, [movies]);

  const handleFieldChange = <K extends keyof MovieFilters>(
    field: K,
    value: MovieFilters[K]
  ) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const toggleRating = (ratingValue: string) => {
    const current = filters.ratings || [];
    const updated = current.includes(ratingValue)
      ? current.filter((r) => r !== ratingValue)
      : [...current, ratingValue];
    handleFieldChange('ratings', updated);
  };

  const handleToggleGlobalSearch = () => {
    onFilterChange({
      ...filters,
      globalSearch: !filters.globalSearch,
    });
  };

  return {
    availableGenres,
    availablePlatforms,
    availableSagas,
    ratingOptions: MOVIE_RATING_OPTIONS,
    sortOptions: MOVIE_SORT_OPTIONS,
    obtainedOptions: MOVIE_OBTAINED_OPTIONS,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
  };
};
