import React, { useMemo } from 'react';
import { EyeIcon, EyeHalfOpenIcon, EyeClosedIcon, FilmIcon } from '@/components/shared/utils/Icons';
import { TMDBMediaCard } from '@/components/trackers/shared/TMDBMediaCard';
import { TrackerLibraryShell, type TrackerLibraryTab } from '@/components/trackers/shared/TrackerLibraryShell';
import { MovieCatalogSections } from './MovieCatalogSections';
import type {
  Movie,
  TMDBMovieSearchResult,
  TMDBPaginatedMovieSearch,
  MovieFilters,
  MovieDetailTarget,
} from '@/types/movies';
import type { MovieDetailTabType } from '@/hooks/trackers/useMovieUrlParams';

export interface MovieLibraryProps {
  setIsFilterModalOpen: (b: boolean) => void;
  hasActiveFilters: boolean;
  searchQuery: string;
  setDebouncedQuery: (q: string) => void;
  handleFilterChange: (f: MovieFilters) => void;
  filters: MovieFilters;
  activeTab: 'all' | 'to_watch' | 'watched';
  setActiveTab: (t: 'all' | 'to_watch' | 'watched') => void;
  debouncedQuery: string;
  isSearchLoading: boolean;
  isDiscoverLoading: boolean;
  searchResults: TMDBPaginatedMovieSearch | null | undefined;
  discoverData: TMDBPaginatedMovieSearch | null | undefined;
  movies: Movie[] | undefined;
  setDetailModalMovie: (m: MovieDetailTarget) => void;
  setDetailModalTab: (t: MovieDetailTabType) => void;
  setDetailModalOpen: (b: boolean) => void;
  handleAdd: (id: number, e: React.MouseEvent) => void;
  displayMovies: Movie[];
  openMovieDetail: (m: MovieDetailTarget) => void;
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  fetchMoreResults?: () => void;
}

export const MovieLibrary: React.FC<MovieLibraryProps> = ({
  setIsFilterModalOpen,
  hasActiveFilters,
  searchQuery,
  setDebouncedQuery,
  handleFilterChange,
  filters,
  activeTab,
  setActiveTab,
  debouncedQuery,
  isSearchLoading,
  isDiscoverLoading,
  searchResults,
  discoverData,
  movies,
  setDetailModalMovie,
  setDetailModalTab,
  setDetailModalOpen,
  handleAdd,
  displayMovies,
  openMovieDetail,
  hasMoreResults = false,
  isFetchingMore = false,
  fetchMoreResults,
}) => {
  const tabs: TrackerLibraryTab<'watched' | 'all' | 'to_watch'>[] = useMemo(
    () => [
      { id: 'watched', label: 'Visti', icon: <EyeIcon className="w-4 h-4" /> },
      { id: 'all', label: 'Tutti', icon: <EyeHalfOpenIcon className="w-4 h-4" /> },
      { id: 'to_watch', label: 'In lista', icon: <EyeClosedIcon className="w-4 h-4" /> },
    ],
    []
  );

  const isSearchingOrDiscovering = Boolean(
    debouncedQuery ||
    (filters.globalSearch &&
      (filters.genre !== 'all' || filters.platform !== 'all' || filters.year !== 'all'))
  );

  const isSearchLoadingState = debouncedQuery ? isSearchLoading : isDiscoverLoading;
  const results = debouncedQuery ? searchResults?.results : discoverData?.results;
  const hasNoSearchResults = !results || results.length === 0;

  return (
    <TrackerLibraryShell<'watched' | 'all' | 'to_watch'>
      searchQuery={searchQuery}
      onSearchChange={(val) => {
        setDebouncedQuery(val);
        handleFilterChange({ ...filters, keyword: val });
      }}
      searchPlaceholder="Cerca film..."
      onOpenFilterModal={() => setIsFilterModalOpen(true)}
      hasActiveFilters={hasActiveFilters}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(t) => setActiveTab(t)}
      isSearchingOrDiscovering={isSearchingOrDiscovering}
      isSearchLoading={isSearchLoadingState}
      hasNoSearchResults={hasNoSearchResults}
      emptySearchMessage={
        debouncedQuery
          ? `Nessun risultato trovato per "${debouncedQuery}"`
          : 'Nessun risultato trovato'
      }
      emptySearchIcon={<FilmIcon className="w-12 h-12 opacity-20" />}
      searchResultsContent={
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 content-start">
          {results?.map((res: TMDBMovieSearchResult) => {
            const existingMovie = movies?.find((m) => m.tmdb_id === res.id);
            return (
              <TMDBMediaCard
                key={res.id}
                id={res.id}
                title={res.title}
                posterPath={res.poster_path}
                isTracked={Boolean(existingMovie)}
                status={existingMovie?.status}
                externalStatus="Movie"
                onCardClick={() => {
                  const mockMovie: Partial<Movie> = {
                    tmdb_id: res.id,
                    title: res.title,
                    original_title: res.original_title,
                    overview: res.overview,
                    poster_path: res.poster_path,
                    backdrop_path: res.backdrop_path,
                    release_date: res.release_date,
                    italy_release_date: res.italy_release_date,
                    vote_average: res.vote_average,
                  };
                  setDetailModalMovie(existingMovie || mockMovie);
                  setDetailModalTab('overview');
                  setDetailModalOpen(true);
                }}
                onAddClick={(e) => handleAdd(res.id, e)}
              />
            );
          })}
        </div>
      }
      hasMoreResults={hasMoreResults}
      isFetchingMore={isFetchingMore}
      onFetchMore={fetchMoreResults}
      isLibraryEmpty={displayMovies.length === 0}
      emptyLibraryMessage="Nessun film trovato nella libreria."
      emptyLibraryIcon={<FilmIcon className="w-12 h-12 opacity-20" />}
    >
      <MovieCatalogSections movies={displayMovies} openMovieDetail={openMovieDetail} />
    </TrackerLibraryShell>
  );
};

export default MovieLibrary;
