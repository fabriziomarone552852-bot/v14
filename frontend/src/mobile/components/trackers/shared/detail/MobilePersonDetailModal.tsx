import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Search, X } from 'lucide-react';
import type { MediaCreditPerson } from '@/types/people';
import type { PersonModalUiSnapshot } from '@/context/TrackerModalStackContext';
import { usePersonDetailData } from '@/hooks/trackers/usePersonDetailData';
import { useBackHandler } from '@/utils/backButtonManager';
import { resolveImageUrl } from '@/utils/imageUtils';
import { PersonBioCurtainOverlay } from '@/components/trackers/shared/detail/PersonBioCurtainOverlay';
import { PersonDetailHeader } from '@/components/trackers/shared/detail/PersonDetailHeader';
import {
  MobilePersonCreditsSection,
  type MobilePersonCreditPosterItem,
} from './MobilePersonCreditsSection';

export interface MobilePersonDetailModalProps {
  isOpen: boolean;
  person: MediaCreditPerson | null;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
  zIndexClass?: string;
  initialUiState?: Partial<PersonModalUiSnapshot>;
  onUiStateChange?: (patch: Partial<PersonModalUiSnapshot>) => void;
}

const resolvePosterUrl = (
  customPoster?: string | null,
  tmdbPoster?: string | null
): string | null => {
  const raw = customPoster || tmdbPoster;
  if (!raw) return null;
  if (raw.startsWith('http') || raw.startsWith('data:')) return raw;
  if (raw.startsWith('/uploads')) return resolveImageUrl(raw);
  return `https://image.tmdb.org/t/p/w300${raw}`;
};

interface MobilePersonDetailModalContentProps {
  person: MediaCreditPerson;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
  zIndexClass: string;
  initialUiState?: Partial<PersonModalUiSnapshot>;
  onUiStateChange?: (patch: Partial<PersonModalUiSnapshot>) => void;
}

const MobilePersonDetailModalContent: React.FC<MobilePersonDetailModalContentProps> = ({
  person,
  onClose,
  onSelectMovie,
  onSelectSeries,
  zIndexClass,
  initialUiState,
  onUiStateChange,
}) => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [isMoviesCollapsed, setIsMoviesCollapsed] = useState(
    Boolean(initialUiState?.isMoviesCollapsed)
  );
  const [isTvCollapsed, setIsTvCollapsed] = useState(Boolean(initialUiState?.isTvCollapsed));
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasRestoredScrollRef = useRef(false);

  const {
    detail,
    isLoading,
    isError,
    creditSearch,
    setCreditSearch,
    movieCredits,
    tvCredits,
    trackedMoviesByTmdb,
    trackedSeriesByTmdb,
    displayName,
    profilePath,
    birthDateLabel,
    canExpandBio,
  } = usePersonDetailData(person, initialUiState?.creditSearch ?? '');

  useLayoutEffect(() => {
    if (
      !isLoading &&
      !hasRestoredScrollRef.current &&
      typeof initialUiState?.scrollTop === 'number' &&
      initialUiState.scrollTop > 0 &&
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollTop = initialUiState.scrollTop;
      hasRestoredScrollRef.current = true;
    }
  }, [isLoading, initialUiState?.scrollTop]);

  const persistUiSnapshot = () => {
    onUiStateChange?.({
      creditSearch,
      isMoviesCollapsed,
      isTvCollapsed,
      scrollTop: scrollContainerRef.current?.scrollTop ?? 0,
    });
  };

  const handleSelectMovieWithSnapshot = (movieTmdbId: number) => {
    persistUiSnapshot();
    onSelectMovie(movieTmdbId);
  };

  const handleSelectSeriesWithSnapshot = (seriesTmdbId: number) => {
    persistUiSnapshot();
    onSelectSeries(seriesTmdbId);
  };

  useBackHandler(
    true,
    () => {
      if (bioExpanded) {
        setBioExpanded(false);
        return true;
      }
      onClose();
      return true;
    },
    35
  );

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (bioExpanded) {
          setBioExpanded(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [bioExpanded, onClose]);

  const moviePosterItems = useMemo<MobilePersonCreditPosterItem[]>(
    () =>
      movieCredits.map((item) => {
        const tracked = trackedMoviesByTmdb.get(item.id);
        return {
          id: item.id,
          title: item.title,
          year: item.release_date ? item.release_date.slice(0, 4) : null,
          posterUrl: resolvePosterUrl(tracked?.custom_poster_path, item.poster_path),
          status: tracked?.status ?? null,
          externalStatus: null,
        };
      }),
    [movieCredits, trackedMoviesByTmdb]
  );

  const tvPosterItems = useMemo<MobilePersonCreditPosterItem[]>(
    () =>
      tvCredits.map((item) => {
        const tracked = trackedSeriesByTmdb.get(item.id);
        return {
          id: item.id,
          title: item.name,
          year: item.first_air_date ? item.first_air_date.slice(0, 4) : null,
          posterUrl: resolvePosterUrl(tracked?.custom_poster_path, item.poster_path),
          status: tracked?.status ?? null,
          externalStatus: tracked?.tmdb_status ?? null,
        };
      }),
    [tvCredits, trackedSeriesByTmdb]
  );

  const hasAnyVisibleCredit = moviePosterItems.length > 0 || tvPosterItems.length > 0;
  const hasSearchQuery = creditSearch.trim().length > 0;

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} bg-white h-[100dvh] w-full flex flex-col overflow-hidden animate-fadeIn select-none`}
    >
      {/* Tendina Biografia Espansa in Overlay (solo freccia verso l'alto per ridurre) */}
      {bioExpanded && detail?.biography && (
        <PersonBioCurtainOverlay
          displayName={displayName}
          profilePath={profilePath}
          birthDateLabel={birthDateLabel}
          placeOfBirth={detail.place_of_birth}
          biography={detail.biography}
          onReduce={() => setBioExpanded(false)}
          onCloseModal={onClose}
          iconOnlyReduce={true}
          respectSafeAreaTop={true}
        />
      )}

      {/* Intestazione Persona */}
      <PersonDetailHeader
        displayName={displayName}
        profilePath={profilePath}
        birthDateLabel={birthDateLabel}
        placeOfBirth={detail?.place_of_birth}
        biography={detail?.biography}
        canExpandBio={canExpandBio}
        bioExpanded={bioExpanded}
        onExpandBio={() => setBioExpanded(true)}
        onClose={onClose}
        respectSafeAreaTop={true}
      />

      {/* Barra di Ricerca a tutta ampiezza */}
      <div className="shrink-0 px-3 py-2.5 bg-white border-b border-gray-200 shadow-2xs">
        <div className="w-full max-w-lg mx-auto relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={creditSearch}
            onChange={(e) => setCreditSearch(e.target.value)}
            placeholder="Filtra titoli o ruoli..."
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium shadow-2xs select-text"
          />
          {creditSearch && (
            <button
              type="button"
              onClick={() => setCreditSearch('')}
              className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700 active:scale-90 transition-all cursor-pointer"
              aria-label="Svuota filtro"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Corpo Filmografia stile Catalogo Mobile (Pill centrali collassabili + griglia 3 colonne) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-gray-50/40 pt-1 pb-12"
      >
        <div className="w-full max-w-lg mx-auto px-3">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">Caricamento filmografia...</span>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-red-500 font-medium">
              Impossibile caricare i dettagli della persona da TMDB.
            </div>
          ) : !hasAnyVisibleCredit ? (
            <div className="py-14 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-xs text-gray-500 font-medium">
                {hasSearchQuery
                  ? `Nessun film o serie TV trovato per "${creditSearch.trim()}".`
                  : 'Nessun film o serie TV trovato per questa persona.'}
              </p>
              {hasSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCreditSearch('')}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 active:scale-95 transition-all cursor-pointer"
                >
                  Azzera ricerca
                </button>
              )}
            </div>
          ) : (
            <>
              <MobilePersonCreditsSection
                variant="movie"
                title="Film"
                items={moviePosterItems}
                isCollapsed={isMoviesCollapsed}
                onToggleCollapse={() => setIsMoviesCollapsed((prev) => !prev)}
                onSelect={handleSelectMovieWithSnapshot}
              />

              <MobilePersonCreditsSection
                variant="tv"
                title="Serie TV"
                items={tvPosterItems}
                isCollapsed={isTvCollapsed}
                onToggleCollapse={() => setIsTvCollapsed((prev) => !prev)}
                onSelect={handleSelectSeriesWithSnapshot}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const MobilePersonDetailModal: React.FC<MobilePersonDetailModalProps> = ({
  isOpen,
  person,
  onClose,
  onSelectMovie,
  onSelectSeries,
  zIndexClass = 'z-[10038]',
  initialUiState,
  onUiStateChange,
}) => {
  if (!isOpen || !person) return null;

  return createPortal(
    <MobilePersonDetailModalContent
      key={person.id}
      person={person}
      onClose={onClose}
      onSelectMovie={onSelectMovie}
      onSelectSeries={onSelectSeries}
      zIndexClass={zIndexClass}
      initialUiState={initialUiState}
      onUiStateChange={onUiStateChange}
    />,
    document.body
  );
};

export default MobilePersonDetailModal;
