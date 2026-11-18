import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronDown, Loader2, MapPin, Search, User, X } from 'lucide-react';
import type {
  MediaCreditPerson,
  PersonCreditMovieItem,
  PersonCreditSeriesItem,
} from '@/types/people';
import type { Movie } from '@/types/movies';
import type { TVSeries } from '@/types/trackers';
import { usePersonDetail } from '@/hooks/queries/usePeopleQueries';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';
import { useBackHandler } from '@/utils/backButtonManager';
import { PersonCreditCardGrid } from './PersonCreditCardGrid';
import { PersonBioCurtainOverlay } from './PersonBioCurtainOverlay';

export interface PersonDetailModalProps {
  isOpen: boolean;
  person: MediaCreditPerson | null;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
}

type CreditFilterTab = 'all' | 'movies' | 'tv';

const formatBirthDate = (isoDate?: string | null): string | null => {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface PersonDetailModalContentProps {
  person: MediaCreditPerson;
  onClose: () => void;
  onSelectMovie: (movieTmdbId: number) => void;
  onSelectSeries: (seriesTmdbId: number) => void;
}

const PersonDetailModalContent: React.FC<PersonDetailModalContentProps> = ({
  person,
  onClose,
  onSelectMovie,
  onSelectSeries,
}) => {
  const [activeTab, setActiveTab] = useState<CreditFilterTab>('all');
  const [bioExpanded, setBioExpanded] = useState(false);
  const [creditSearch, setCreditSearch] = useState('');
  const { handleScroll: handleCreditsScroll, scrollbarClass: creditsScrollbarClass } =
    useFadeScrollbar(800);

  const { data: detail, isLoading, isError } = usePersonDetail(person.id, true);
  const { data: myMovies = [] } = useMyMovies();
  const { data: mySeries = [] } = useMySeries();

  const trackedMoviesByTmdb = useMemo(
    () => new Map<number, Movie>(myMovies.map((m) => [m.tmdb_id, m])),
    [myMovies]
  );
  const trackedSeriesByTmdb = useMemo(
    () => new Map<number, TVSeries>(mySeries.map((s) => [s.tmdb_id, s])),
    [mySeries]
  );

  const normalizedFilter = creditSearch.trim().toLowerCase();

  const movieCredits = useMemo<PersonCreditMovieItem[]>(() => {
    const list = detail?.movie_credits || [];
    if (!normalizedFilter) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(normalizedFilter) ||
        Boolean(item.original_title?.toLowerCase().includes(normalizedFilter)) ||
        item.roles.some((r) => r.toLowerCase().includes(normalizedFilter))
    );
  }, [detail?.movie_credits, normalizedFilter]);

  const tvCredits = useMemo<PersonCreditSeriesItem[]>(() => {
    const list = detail?.tv_credits || [];
    if (!normalizedFilter) return list;
    return list.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedFilter) ||
        Boolean(item.original_name?.toLowerCase().includes(normalizedFilter)) ||
        item.roles.some((r) => r.toLowerCase().includes(normalizedFilter))
    );
  }, [detail?.tv_credits, normalizedFilter]);

  const displayName = detail?.name || person.name;
  const profilePath = detail?.profile_path || person.profile_path;
  const birthDateLabel = formatBirthDate(detail?.birthday);
  const totalCreditsCount =
    (detail?.movie_credits?.length ?? 0) + (detail?.tv_credits?.length ?? 0);
  const canExpandBio = Boolean(detail?.biography && detail.biography.length > 180);

  return (
    <div
      className="fixed inset-0 z-[10060] bg-black/60 backdrop-blur-xs flex items-center justify-center sm:p-4 animate-fadeIn select-none"
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
        <div className="shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white p-4 sm:p-5 flex items-start gap-4 relative z-10">
          <div className="w-20 h-24 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-slate-700/70 border border-white/15 shadow-lg shrink-0 flex items-center justify-center">
            {profilePath ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${profilePath}`}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-8">
            <h2 className="text-lg sm:text-2xl font-extrabold leading-tight truncate">
              {displayName}
            </h2>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              {birthDateLabel && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{birthDateLabel}</span>
                </span>
              )}
              {detail?.place_of_birth && (
                <span className="inline-flex items-center gap-1 truncate max-w-full">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{detail.place_of_birth}</span>
                </span>
              )}
            </div>

            {detail?.biography && (
              <div className="mt-2.5 text-xs text-slate-200/90 leading-relaxed">
                <p className="line-clamp-3">{detail.biography}</p>
                {canExpandBio && (
                  <button
                    type="button"
                    onClick={() => setBioExpanded(true)}
                    className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-blue-200 cursor-pointer transition-opacity ${
                      bioExpanded ? 'opacity-0 pointer-events-none' : ''
                    }`}
                  >
                    <span>Espandi</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Chiudi scheda persona"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

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
                    onSelect={onSelectMovie}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'tv') && (
                  <PersonCreditCardGrid
                    variant="tv"
                    tvCredits={tvCredits}
                    trackedSeriesByTmdb={trackedSeriesByTmdb}
                    onSelect={onSelectSeries}
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
    />,
    document.body
  );
};

export default PersonDetailModal;
