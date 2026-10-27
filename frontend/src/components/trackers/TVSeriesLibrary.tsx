import React, { useMemo } from 'react';
import { EyeIcon, EyePlayIcon, EyeHalfOpenIcon, EyeClosedIcon, TvIcon } from '@/components/shared/utils/Icons';
import { TMDBMediaCard } from './shared/TMDBMediaCard';
import { TrackerLibraryShell, type TrackerLibraryTab } from './shared/TrackerLibraryShell';
import { TVSeriesCatalogSections } from './TVSeriesCatalogSections';
import type { TVSeries, TMDBSeriesSearchResult, TMDBPaginatedSearch } from '@/types/trackers';
import type { MediaFilterState as SeriesFilterState } from './MediaFilterModal';
import type { TabType } from './SeriesDetailModal/SeriesDetailModal';

export interface TVSeriesLibraryProps {
  setIsFilterModalOpen: (b: boolean) => void;
  hasActiveFilters: boolean;
  searchQuery: string;
  setDebouncedQuery: (q: string) => void;
  handleFilterChange: (f: SeriesFilterState) => void;
  filters: SeriesFilterState;
  activeTab: string;
  setActiveTab: (t: 'all' | 'watching' | 'watched' | 'to_watch') => void;
  debouncedQuery: string;
  isSearchLoading: boolean;
  isDiscoverLoading: boolean;
  searchResults: TMDBPaginatedSearch | null | undefined;
  discoverData: TMDBPaginatedSearch | null | undefined;
  series: TVSeries[] | undefined;
  setDetailModalSeries: (s: TVSeries | Partial<TVSeries> | TMDBSeriesSearchResult) => void;
  setDetailModalTab: (t: TabType) => void;
  setDetailModalOpen: (b: boolean) => void;
  handleAdd: (id: number, e: React.MouseEvent) => void;
  displaySeries: TVSeries[];
  openSeriesDetail: (s: TVSeries) => void;
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  fetchMoreResults?: () => void;
}

export const TVSeriesLibrary: React.FC<TVSeriesLibraryProps> = ({
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
  series,
  setDetailModalSeries,
  setDetailModalTab,
  setDetailModalOpen,
  handleAdd,
  displaySeries,
  openSeriesDetail,
  hasMoreResults = false,
  isFetchingMore = false,
  fetchMoreResults,
}) => {
  const tabs: TrackerLibraryTab<'watched' | 'watching' | 'all' | 'to_watch'>[] = useMemo(
    () => [
      { id: 'watched', label: 'Visti', icon: <EyeIcon className="w-4 h-4" /> },
      { id: 'watching', label: 'In Corso', icon: <EyePlayIcon className="w-4 h-4" /> },
      { id: 'all', label: 'Tutti', icon: <EyeHalfOpenIcon className="w-4 h-4" /> },
      { id: 'to_watch', label: 'Non Visti', icon: <EyeClosedIcon className="w-4 h-4" /> },
    ],
    []
  );

  const isSearchingOrDiscovering = Boolean(
    debouncedQuery ||
    (filters.globalSearch &&
      (filters.genre !== 'all' || filters.network !== 'all' || filters.year !== 'all'))
  );

  const isSearchLoadingState = debouncedQuery ? isSearchLoading : isDiscoverLoading;
  const results = debouncedQuery ? searchResults?.results : discoverData?.results;
  const hasNoSearchResults = !results || results.length === 0;

  return (
    <TrackerLibraryShell<'watched' | 'watching' | 'all' | 'to_watch'>
      searchQuery={searchQuery}
      onSearchChange={(val) => {
        setDebouncedQuery(val);
        handleFilterChange({ ...filters, keyword: val });
      }}
      searchPlaceholder="Cerca serie TV..."
      onOpenFilterModal={() => setIsFilterModalOpen(true)}
      hasActiveFilters={hasActiveFilters}
      tabs={tabs}
      activeTab={activeTab as 'watched' | 'watching' | 'all' | 'to_watch'}
      onTabChange={(t) => setActiveTab(t)}
      isSearchingOrDiscovering={isSearchingOrDiscovering}
      isSearchLoading={isSearchLoadingState}
      hasNoSearchResults={hasNoSearchResults}
      emptySearchMessage={
        debouncedQuery
          ? `Nessun risultato trovato per "${debouncedQuery}"`
          : 'Nessun risultato trovato'
      }
      emptySearchIcon={<TvIcon className="w-12 h-12 opacity-20" />}
      searchResultsContent={
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 content-start">
          {results?.map((res: TMDBSeriesSearchResult) => {
            const existingSeries = series?.find((s) => s.tmdb_id === res.id);
            return (
              <TMDBMediaCard
                key={res.id}
                id={res.id}
                title={res.name}
                posterPath={res.poster_path}
                isTracked={Boolean(existingSeries)}
                status={existingSeries?.status}
                externalStatus={existingSeries?.tmdb_status}
                onCardClick={() => {
                  const mockSeries = {
                    tmdb_series: {
                      tmdb_id: res.id,
                      title: res.name,
                      original_title: res.original_name,
                      overview: res.overview,
                      poster_path: res.poster_path,
                      backdrop_path: res.backdrop_path,
                      first_air_date: res.first_air_date,
                    },
                  };
                  setDetailModalSeries((existingSeries || mockSeries) as Partial<TVSeries>);
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
      isLibraryEmpty={displaySeries.length === 0}
      emptyLibraryMessage="Nessuna serie trovata."
      emptyLibraryIcon={<TvIcon className="w-12 h-12 opacity-20" />}
    >
      <TVSeriesCatalogSections
        series={displaySeries}
        openSeriesDetail={openSeriesDetail}
      />
    </TrackerLibraryShell>
  );
};

export default TVSeriesLibrary;
