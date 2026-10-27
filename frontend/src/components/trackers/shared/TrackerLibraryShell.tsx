import React from 'react';
import { LoadingIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { LoadMoreButton } from './LoadMoreButton';

export interface TrackerLibraryTab<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
}

export interface TrackerLibraryShellProps<T extends string = string> {
  // Barra di ricerca & Filtri
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onOpenFilterModal: () => void;
  hasActiveFilters: boolean;

  // Tabs di stato
  tabs: TrackerLibraryTab<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;

  // Modalità Ricerca / Discover TMDB
  isSearchingOrDiscovering: boolean;
  isSearchLoading: boolean;
  hasNoSearchResults: boolean;
  emptySearchMessage?: string;
  emptySearchIcon?: React.ReactNode;
  searchResultsContent?: React.ReactNode;

  // Paginazione progressiva ("Carica altri risultati")
  hasMoreResults?: boolean;
  isFetchingMore?: boolean;
  onFetchMore?: () => void;

  // Modalità Catalogo Libreria Personale
  isLibraryEmpty: boolean;
  emptyLibraryMessage?: string;
  emptyLibraryIcon?: React.ReactNode;
  children: React.ReactNode;
}

export function TrackerLibraryShell<T extends string = string>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Cerca...',
  onOpenFilterModal,
  hasActiveFilters,
  tabs,
  activeTab,
  onTabChange,
  isSearchingOrDiscovering,
  isSearchLoading,
  hasNoSearchResults,
  emptySearchMessage = 'Nessun risultato trovato.',
  emptySearchIcon,
  searchResultsContent,
  hasMoreResults = false,
  isFetchingMore = false,
  onFetchMore,
  isLibraryEmpty,
  emptyLibraryMessage = 'Nessun elemento presente nella libreria.',
  emptyLibraryIcon,
  children,
}: TrackerLibraryShellProps<T>) {
  return (
    <div className="xl:col-span-8 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-[600px] xl:h-full min-h-0 overflow-hidden relative">
      {/* Top Bar Fluttuante */}
      <div className="absolute top-5 left-5 right-8 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pointer-events-none">
        {/* Barra di Ricerca */}
        <div className="relative w-full sm:flex-1 sm:max-w-sm pointer-events-auto">
          <button
            type="button"
            onClick={onOpenFilterModal}
            className={`absolute inset-y-0 left-0 pl-3 pr-2 flex items-center cursor-pointer transition-colors z-10 outline-none ${
              hasActiveFilters ? 'text-blue-600 drop-shadow-sm' : 'text-gray-400 hover:text-blue-500'
            }`}
            title="Ricerca approfondita e filtri"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {hasActiveFilters && (
              <span className="absolute top-2 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl leading-5 bg-white/95 backdrop-blur-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
          />
        </div>

        {/* Segmented Control / Tabs di stato */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-full border border-gray-200 shrink-0 shadow-sm group transition-all duration-300 hover:gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  title={tab.label}
                  className={`rounded-full flex items-center justify-center transition-all duration-300 ease-in-out overflow-hidden cursor-pointer ${
                    isActive
                      ? 'w-8 h-8 opacity-100 bg-blue-50 shadow-sm text-blue-600'
                      : 'w-0 h-8 opacity-0 group-hover:w-8 group-hover:opacity-100 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                  }`}
                >
                  {tab.icon}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Griglia Locandine con Maschera Sfumata Superiore */}
      <div
        className="relative flex-1 min-h-0 -ml-3 -mr-2"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 40px), transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0px, black 60px, black calc(100% - 40px), transparent 100%)',
        }}
      >
        <div className="absolute inset-0 overflow-y-auto modal-scrollbar pl-3 pr-4 pb-8 pt-[120px] sm:pt-[80px]">
          {isSearchingOrDiscovering ? (
            isSearchLoading ? (
              <div className="h-40 flex flex-col items-center justify-center gap-3 text-blue-500">
                <LoadingIcon className="w-8 h-8 animate-spin" />
                <p className="text-sm font-medium">Ricerca in corso su TMDB...</p>
              </div>
            ) : hasNoSearchResults ? (
              <div className="h-40 flex items-center justify-center">
                <EmptyState
                  message={emptySearchMessage}
                  icon={emptySearchIcon}
                />
              </div>
            ) : (
              <div>
                {searchResultsContent}
                {onFetchMore && (
                  <LoadMoreButton
                    hasMore={hasMoreResults}
                    isLoading={isFetchingMore}
                    onLoadMore={onFetchMore}
                  />
                )}
              </div>
            )
          ) : isLibraryEmpty ? (
            <div className="h-40 flex items-center justify-center">
              <EmptyState
                message={emptyLibraryMessage}
                icon={emptyLibraryIcon}
              />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export default TrackerLibraryShell;
