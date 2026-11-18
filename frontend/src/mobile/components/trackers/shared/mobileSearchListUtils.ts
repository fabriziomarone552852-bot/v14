// src/mobile/components/trackers/shared/mobileSearchListUtils.ts
import type {
  MediaList,
  MediaListItem,
  TVSeries,
  TMDBSeriesSearchResult,
} from '@/types/trackers';
import type {
  Movie,
  MovieFilters,
  TMDBMovieSearchResult,
} from '@/types/movies';
import type { MediaFilterState } from '@/hooks/trackers/useMediaFilterOptions';
import { calculateSeriesRating } from '@/utils/ratingUtils';
import {
  matchesMoviePlatformFilter,
  matchesSeriesPlatformFilter,
} from '@/utils/platformFilterUtils';
import {
  matchesGenreFilterRule,
  matchesYearMultiFilter,
} from '@/utils/trackerFilterUtils';
import { matchesPeopleCreditsFilter } from '@/utils/trackerPeopleUtils';

const matchesRatingBuckets = (rawRating: number, activeRatings: readonly string[]): boolean => {
  if (activeRatings.length === 0) return true;
  const r = Number(rawRating.toFixed(1));
  if (activeRatings.includes('unrated') && r === 0) return true;
  if (activeRatings.includes('5') && r >= 4.9) return true;
  if (activeRatings.includes('4') && r >= 4.0 && r < 4.9) return true;
  if (activeRatings.includes('3') && r >= 3.0 && r < 4.0) return true;
  if (activeRatings.includes('2') && r >= 2.0 && r < 3.0) return true;
  if (activeRatings.includes('1') && r > 0 && r < 2.0) return true;
  return false;
};

export const filterSeriesListForSearchModal = (params: {
  isOpen: boolean;
  filters: MediaFilterState;
  myLists?: MediaList[];
  series: TVSeries[];
  debouncedQuery: string;
}): TMDBSeriesSearchResult[] | null => {
  const { isOpen, filters, myLists, series, debouncedQuery } = params;
  if (!isOpen || !filters.listIds || filters.listIds.length === 0 || !myLists) {
    return null;
  }

  const targetLists = myLists.filter((l) => filters.listIds.includes(l.id));
  if (targetLists.length === 0) return [];

  const seenIds = new Set<number>();
  const rawListItems: MediaListItem[] = [];
  for (const list of targetLists) {
    for (const item of list.items || []) {
      const isTv = !item.media_type || item.media_type === 'tv' || Boolean(item.series_tmdb_id);
      const tmdbId = item.series_tmdb_id || item.series?.tmdb_id;
      if (isTv && tmdbId && !seenIds.has(tmdbId)) {
        seenIds.add(tmdbId);
        rawListItems.push(item);
      }
    }
  }

  let items = rawListItems.map((item) => {
    const existing = series?.find((s) => s.tmdb_id === item.series_tmdb_id);
    const title = existing?.title || item.series?.title || 'Serie';
    const posterPath = existing?.poster_path || item.series?.poster_path || null;
    const backdropPath = existing?.backdrop_path || null;
    const firstAirDate =
      existing?.first_air_date || item.series?.first_air_date || null;
    const overview = existing?.overview || null;
    const tmdbId = item.series_tmdb_id || existing?.tmdb_id || 0;

    const result: TMDBSeriesSearchResult = {
      id: tmdbId,
      name: title,
      original_name: existing?.original_title || null,
      overview,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      first_air_date: firstAirDate,
    };
    return { result, existing, item };
  });

  const query = (filters.keyword || debouncedQuery || '').trim().toLowerCase();
  if (query) {
    items = items.filter(
      ({ result }) =>
        result.name.toLowerCase().includes(query) ||
        Boolean(result.original_name?.toLowerCase().includes(query))
    );
  }

  if (filters.people?.trim()) {
    items = items.filter(({ existing }) =>
      matchesPeopleCreditsFilter(
        existing?.credits_summary,
        existing?.creators,
        filters.people,
        filters.peopleMode
      )
    );
  }

  items = items.filter(({ existing, item }) =>
    matchesGenreFilterRule(existing?.genres || item.series?.genres, filters.genres)
  );

  if (filters.networks && filters.networks.length > 0) {
    items = items.filter(({ existing }) =>
      matchesSeriesPlatformFilter(existing, filters.networks)
    );
  }

  if (filters.tmdbStatuses && filters.tmdbStatuses.length > 0) {
    items = items.filter(
      ({ existing }) =>
        Boolean(existing?.tmdb_status) &&
        filters.tmdbStatuses.includes(existing?.tmdb_status || '')
    );
  }

  if (filters.ratings && filters.ratings.length > 0) {
    items = items.filter(({ existing }) =>
      existing ? matchesRatingBuckets(calculateSeriesRating(existing), filters.ratings) : false
    );
  }

  if (filters.years && filters.years.length > 0) {
    items = items.filter(({ result }) =>
      matchesYearMultiFilter(result.first_air_date, filters.years)
    );
  }

  items.sort((a, b) => {
    if (filters.sortBy === 'name_asc') {
      return a.result.name.localeCompare(b.result.name);
    }
    if (filters.sortBy === 'name_desc') {
      return b.result.name.localeCompare(a.result.name);
    }
    if (filters.sortBy === 'rating_desc') {
      const rA = a.existing ? calculateSeriesRating(a.existing) : 0;
      const rB = b.existing ? calculateSeriesRating(b.existing) : 0;
      return rB - rA;
    }
    if (filters.sortBy === 'release_date_desc') {
      return (b.result.first_air_date || '').localeCompare(a.result.first_air_date || '');
    }
    if (filters.sortBy === 'release_date_asc') {
      return (a.result.first_air_date || '').localeCompare(b.result.first_air_date || '');
    }
    const dateA = new Date(a.item.added_at || a.existing?.created_at || 0).getTime();
    const dateB = new Date(b.item.added_at || b.existing?.created_at || 0).getTime();
    return dateB - dateA;
  });

  return items.map((i) => i.result);
};

export const filterMoviesListForSearchModal = (params: {
  isOpen: boolean;
  filters: MovieFilters;
  myLists?: MediaList[];
  movies: Movie[];
  debouncedQuery: string;
}): TMDBMovieSearchResult[] | null => {
  const { isOpen, filters, myLists, movies, debouncedQuery } = params;
  if (!isOpen || !filters.listIds || filters.listIds.length === 0 || !myLists) {
    return null;
  }

  const targetLists = myLists.filter((l) => filters.listIds.includes(l.id));
  if (targetLists.length === 0) return [];

  const seenIds = new Set<number>();
  const rawListItems: MediaListItem[] = [];
  for (const list of targetLists) {
    for (const item of list.items || []) {
      const isMovie = item.media_type === 'movie' || Boolean(item.movie_tmdb_id);
      const tmdbId = item.movie_tmdb_id || item.movie?.tmdb_id;
      if (isMovie && tmdbId && !seenIds.has(tmdbId)) {
        seenIds.add(tmdbId);
        rawListItems.push(item);
      }
    }
  }

  let items = rawListItems.map((item) => {
    const existing = movies?.find((m) => m.tmdb_id === item.movie_tmdb_id);
    const title = existing?.title || item.movie?.title || 'Film';
    const posterPath =
      existing?.custom_poster_path ||
      existing?.poster_path ||
      item.movie?.poster_path ||
      null;
    const backdropPath = existing?.backdrop_path || null;
    const releaseDate =
      existing?.release_date ||
      existing?.italy_release_date ||
      item.movie?.release_date ||
      null;
    const overview = existing?.overview || null;
    const tmdbId = item.movie_tmdb_id || existing?.tmdb_id || 0;

    const result: TMDBMovieSearchResult = {
      id: tmdbId,
      title,
      original_title: existing?.original_title || null,
      overview,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      release_date: releaseDate,
    };
    return { result, existing, item };
  });

  const query = (filters.keyword || debouncedQuery || '').trim().toLowerCase();
  if (query) {
    items = items.filter(
      ({ result }) =>
        result.title.toLowerCase().includes(query) ||
        Boolean(result.original_title?.toLowerCase().includes(query))
    );
  }

  if (filters.people?.trim()) {
    items = items.filter(({ existing }) =>
      matchesPeopleCreditsFilter(
        existing?.credits_summary,
        null,
        filters.people,
        filters.peopleMode
      )
    );
  }

  items = items.filter(({ existing, item }) =>
    matchesGenreFilterRule(existing?.genres || item.movie?.genres, filters.genres)
  );

  if (filters.platforms && filters.platforms.length > 0) {
    items = items.filter(({ existing }) =>
      matchesMoviePlatformFilter(existing, filters.platforms)
    );
  }

  if (filters.sagas && filters.sagas.length > 0) {
    items = items.filter(({ existing }) => {
      if (!existing) return false;
      return filters.sagas.some((sagaToken) => {
        const sagaId = Number(sagaToken);
        if (!Number.isNaN(sagaId) && existing.collection_id === sagaId) return true;
        return existing.collection_name?.toLowerCase() === sagaToken.toLowerCase();
      });
    });
  }

  if (filters.ratings && filters.ratings.length > 0) {
    items = items.filter(({ existing }) =>
      existing ? matchesRatingBuckets(existing.my_rating || 0, filters.ratings) : false
    );
  }

  if (filters.obtainedFilter && filters.obtainedFilter !== 'all') {
    items = items.filter(({ existing }) => {
      const isObtained = Boolean(existing?.obtained_at);
      return filters.obtainedFilter === 'obtained' ? isObtained : !isObtained;
    });
  }

  if (filters.years && filters.years.length > 0) {
    items = items.filter(({ result }) =>
      matchesYearMultiFilter(result.release_date, filters.years)
    );
  }

  items.sort((a, b) => {
    if (filters.sortBy === 'name_asc') {
      return a.result.title.localeCompare(b.result.title);
    }
    if (filters.sortBy === 'name_desc') {
      return b.result.title.localeCompare(a.result.title);
    }
    if (filters.sortBy === 'rating_desc') {
      return (b.existing?.my_rating || 0) - (a.existing?.my_rating || 0);
    }
    if (filters.sortBy === 'release_date_desc') {
      return (b.result.release_date || '').localeCompare(a.result.release_date || '');
    }
    if (filters.sortBy === 'release_date_asc') {
      return (a.result.release_date || '').localeCompare(b.result.release_date || '');
    }
    const dateA = new Date(a.item.added_at || a.existing?.added_at || 0).getTime();
    const dateB = new Date(b.item.added_at || b.existing?.added_at || 0).getTime();
    return dateB - dateA;
  });

  return items.map((i) => i.result);
};
