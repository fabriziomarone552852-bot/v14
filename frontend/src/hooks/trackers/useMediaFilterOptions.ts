import { useMemo, useState } from 'react';
import type { TVSeries } from '@/types/trackers';
import { useTMDBGenres, useTMDBProviders } from '@/hooks/queries/useTrackersQueries';

export interface MediaFilterState {
  keyword: string;
  genre: string;
  network: string;
  ratings: string[];
  tmdbStatus: string;
  year: string;
  sortBy: string;
  listId: number | null;
  globalSearch?: boolean;
}

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { data: tmdbGenres = [] } = useTMDBGenres();
  const { data: tmdbProviders = [] } = useTMDBProviders();

  const availableGenres = useMemo(() => {
    if (filters.globalSearch) {
      return tmdbGenres
        .map((g) => ({ value: String(g.id), label: g.name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    const genresSet = new Set<string>();
    series.forEach((s) => {
      if (s.genres) {
        s.genres.split(',').forEach((g) => genresSet.add(g.trim()));
      }
    });
    return Array.from(genresSet)
      .filter(Boolean)
      .sort()
      .map((g) => ({ value: g, label: g }));
  }, [series, filters.globalSearch, tmdbGenres]);

  const availableNetworks = useMemo(() => {
    if (filters.globalSearch) {
      return tmdbProviders
        .map((p) => ({ value: String(p.provider_id), label: p.provider_name }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
    const networksSet = new Set<string>();
    series.forEach((s) => {
      if (s.networks) {
        s.networks.split(',').forEach((n) => networksSet.add(n.trim()));
      }
    });
    return Array.from(networksSet)
      .filter(Boolean)
      .sort()
      .map((n) => ({ value: n, label: n }));
  }, [series, filters.globalSearch, tmdbProviders]);

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
    let newRatings = [...(filters.ratings || [])];
    if (newRatings.includes(val)) {
      newRatings = newRatings.filter((r) => r !== val);
    } else {
      newRatings.push(val);
    }
    handleFieldChange('ratings', newRatings);
  };

  const handleToggleGlobalSearch = () => {
    const isNowGlobal = !filters.globalSearch;
    const newFilters: MediaFilterState = { ...filters, globalSearch: isNowGlobal };
    if (isNowGlobal) {
      newFilters.genre = 'all';
      newFilters.network = 'all';
    }
    onFilterChange(newFilters);
  };

  const handleYearChange = (date: string | null) => {
    const newYear = date ? date.substring(0, 4) : 'all';
    handleFieldChange('year', newYear);
    setIsDatePickerOpen(false);
  };

  return {
    availableGenres,
    availableNetworks,
    ratingOptions: RATING_OPTIONS,
    tmdbStatusOptions: TMDB_STATUS_OPTIONS,
    sortOptions: SORT_OPTIONS,
    isDatePickerOpen,
    setIsDatePickerOpen,
    handleFieldChange,
    toggleRating,
    handleToggleGlobalSearch,
    handleYearChange,
  };
};
