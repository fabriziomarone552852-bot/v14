import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Search, X } from 'lucide-react';
import type { MediaCreditPerson } from '@/types/people';
import type {
  PersonCreditFilterTab,
  PersonModalUiSnapshot,
} from '@/context/TrackerModalStackContext';
import { usePersonDetailData } from '@/hooks/trackers/usePersonDetailData';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { useBackHandler } from '@/utils/backButtonManager';
import { PersonCreditCardGrid } from './PersonCreditCardGrid';
import { PersonBioCurtainOverlay } from './PersonBioCurtainOverlay';
import { PersonDetailHeader } from './PersonDetailHeader';

export interface PersonDetailModalProps {
  isOpen: boolean;
  person: MediaCreditPerson | null;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
  zIndexClass?: string;
  initialUiState?: Partial<PersonModalUiSnapshot>;
  onUiStateChange?: (patch: Partial<PersonModalUiSnapshot>) => void;
}

type CreditFilterTab = PersonCreditFilterTab;

interface PersonDetailModalContentProps {
  person: MediaCreditPerson;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
  zIndexClass: string;
  initialUiState?: Partial<PersonModalUiSnapshot>;
  onUiStateChange?: (patch: Partial<PersonModalUiSnapshot>) => void;
}

const PersonDetailModalContent: React.FC<PersonDetailModalContentProps> = ({
  person,
  onClose,
  onSelectMovie,
  onSelectSeries,
  zIndexClass,
  initialUiState,
  onUiStateChange,
}) => {
  const [activeTab, setActiveTab] = useState<CreditFilterTab>(
    initialUiState?.activeTab ?? 'all'
  );
  const [bioExpanded, setBioExpanded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasRestoredScrollRef = useRef(false);
  const { handleScroll: handleCreditsScroll, scrollbarClass: creditsScrollbarClass } =
    useFadeScrollbar(800);

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
    totalCreditsCount,
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
      activeTab,
      creditSearch,
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

  return (
    <div
      className={`fixed inset-0 ${zIndexClass} bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4 animate-fadeIn select-none`}
      onClick={onClose}
    >
      <div
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tendina Biografia Espansa in Overlay direttamente dalla testata superiore */}
        {bioExpanded && detail?.biography && (
          <PersonBioCurtainOverlay
            displayName={displayName}
            profilePath={profilePath}
            birthDateLabel={birthDateLabel}
            placeOfBirth={detail.place_of_birth}
            biography={detail.biography}
            onReduce={() => setBioExpanded(false)}
            onCloseModal={onClose}
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
        />

        {/* Area Inferiore (Tabs & Filmografia) */}
        <div className="relative flex-1 min-h-[240px] flex flex-col">

          {/* Barra Tabs + Ricerca interna filmografia */}
          <div className="shrink-0 px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'all', label: 'Tutti', count: totalCreditsCount },
                  { id: 'movies', label: 'Film', count: detail?.movie_credits?.length ?? 0 },
                  { id: 'tv', label: 'Serie TV', count: detail?.tv_credits?.length ?? 0 },
                ] as Array<{ id: CreditFilterTab; label: string; count: number }>
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 focus-within:border-blue-400 min-w-[170px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={creditSearch}
                onChange={(e) => setCreditSearch(e.target.value)}
                placeholder="Filtra titoli o ruoli..."
                className="w-full text-xs text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none select-text"
              />
              {creditSearch && (
                <button
                  type="button"
                  onClick={() => setCreditSearch('')}
                  className="text-gray-400 hover:text-gray-700 cursor-pointer"
                  aria-label="Svuota filtro"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Corpo Filmografia Scrollabile (scrollbar visibile solo in scorrimento) */}
          <div
            ref={scrollContainerRef}
            onScroll={handleCreditsScroll}
            className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-5 bg-gray-50/40 ${creditsScrollbarClass}`}
          >
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-500">
                <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Caricamento filmografia...</span>
              </div>
            ) : isError ? (
              <div className="py-10 text-center text-sm text-red-500 font-medium">
                Impossibile caricare i dettagli della persona da TMDB.
              </div>
            ) : (
              <>
                {(activeTab === 'all' || activeTab === 'movies') && (
                  <PersonCreditCardGrid
                    variant="movie"
                    movieCredits={movieCredits}
                    trackedMoviesByTmdb={trackedMoviesByTmdb}
                    onSelect={handleSelectMovieWithSnapshot}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'tv') && (
                  <PersonCreditCardGrid
                    variant="tv"
                    tvCredits={tvCredits}
                    trackedSeriesByTmdb={trackedSeriesByTmdb}
                    onSelect={handleSelectSeriesWithSnapshot}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({
  isOpen,
  person,
  onClose,
  onSelectMovie,
  onSelectSeries,
  zIndexClass = 'z-[10038]',
  initialUiState,
  onUiStateChange,
}) => {
  const isModalActive = isOpen && Boolean(person);

  useBackHandler(
    isModalActive,
    () => {
      onClose();
      return true;
    },
    35
  );

  useEffect(() => {
    if (!isModalActive) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc, true);
    return () => window.removeEventListener('keydown', handleEsc, true);
  }, [isModalActive, onClose]);

  if (!isModalActive || !person) return null;

  return createPortal(
    <PersonDetailModalContent
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

export default PersonDetailModal;
