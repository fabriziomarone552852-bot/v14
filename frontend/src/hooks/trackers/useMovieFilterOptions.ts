import { useMemo, useState } from 'react';
import type { Movie, MovieFilters } from '@/types/movies';
import { useTMDBMovieGenres, useTMDBMovieProviders } from '@/hooks/queries/useMovieQueries';

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { data: tmdbGenres = [] } = useTMDBMovieGenres();
  const { data: tmdbProviders = [] } = useTMDBMovieProviders();

  const availableGenres = useMemo(() => {
    if (filters.globalSearch) {
      return tmdbGenres
        .map((g) => ({ value: String(g.id), label: g.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    const genresSet = new Set<string>();
    movies.forEach((m) => {
      if (m.genres) {
        m.genres.split(',').forEach((g) => genresSet.add(g.trim()));
      }
    });
    return Array.from(genresSet)
      .filter(Boolean)
      .sort()
      .map((g) => ({ value: g, label: g }));
  }, [movies, filters.globalSearch, tmdbGenres]);

  const availablePlatforms = useMemo(() => {
    if (filters.globalSearch) {
      return tmdbProviders
        .map((p) => ({ value: String(p.provider_id), label: p.provider_name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    const platformSet = new Set<string>();
    movies.forEach((m) => {
      m.logs?.forEach((log) => {
        if (log.viewing_platform_name) {
          platformSet.add(log.viewing_platform_name.trim());
        }
      });
    });
    return Array.from(platformSet)
      .filter(Boolean)
      .sort()
      .map((p) => ({ value: p, label: p }));
  }, [movies, filters.globalSearch, tmdbProviders]);

  const availableSagas = useMemo(() => {
    const sagaMap = new Map<number, string>();
    movies.forEach((m) => {
      if (m.collection_id && m.collection_name) {
        sagaMap.set(m.collection_id, m.collection_name);
      }
    });
    return Array.from(sagaMap.entries())
      .map(([id, name]) => ({ value: String(id), label: name }))
      .sort((a, b) => a.label.localeCompare(b.label));
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
    const exists = current.includes(ratingValue);
    const updated = exists
      ? current.filter((r) => r !== ratingValue)
      : [...current, ratingValue];

    handleFieldChange('ratings', updated);
  };

  const handleToggleGlobalSearch = () => {
    const nextGlobal = !filters.globalSearch;
    onFilterChange({
      ...filters,
      globalSearch: nextGlobal,
      genre: 'all',
      platform: 'all',
      saga: 'all',
    });
  };

  const handleYearChange = (date: string | null) => {
    const newYear = date ? date.substring(0, 4) : 'all';
    handleFieldChange('year', newYear);
    setIsDatePickerOpen(false);
  };

  return {
    availableGenres,
    availablePlatforms,
    availableSagas,
    ratingOptions: MOVIE_RATING_OPTIONS,
    sortOptions: MOVIE_SORT_OPTIONS,
    obtainedOptions: MOVIE_OBTAINED_OPTIONS,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
    handleYearChange,
  };
};
