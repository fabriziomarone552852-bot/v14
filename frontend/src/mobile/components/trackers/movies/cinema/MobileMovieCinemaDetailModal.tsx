// src/mobile/components/trackers/movies/cinema/MobileMovieCinemaDetailModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, Clock, Layers, Star } from 'lucide-react';
import type { Movie, MovieDetailTarget } from '@/types/movies';
import type { MovieInCinemaSummary } from '@/types/cinema';
import {
  useMovieExtras,
  useMovieProviders,
  useMyMovies,
} from '@/hooks/queries/useMovieQueries';
import { useCinemaProvinces } from '@/hooks/queries/useCinemaQueries';
import { useMovieMutations } from '@/hooks/mutations/useMovieMutations';
import { useBackHandler } from '@/utils/backButtonManager';
import { resolveImageUrl } from '@/utils/imageUtils';
import { CloseIcon } from '@/components/shared/utils/Icons';
import {
  MobileTrackerDetailBottomBar,
  type MobileTrackerBottomBarTab,
} from '@/mobile/components/trackers/shared/detail/MobileTrackerDetailBottomBar';
import { MobileMovieSagaTab } from '@/mobile/components/trackers/movies/detail/MobileMovieSagaTab';
import { MobileMovieReviewTab } from '@/mobile/components/trackers/movies/detail/MobileMovieReviewTab';
import { MobileCinemaOverviewView } from './MobileCinemaOverviewView';
import { MobileCinemaShowtimesView } from './MobileCinemaShowtimesView';
import { MobileCinemaProvinceModal } from './MobileCinemaProvinceModal';

export type CinemaModalTab = 'overview' | 'showtimes' | 'saga' | 'review';

export interface MobileMovieCinemaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  selectedProvinceSlug: string;
  selectedProvinceName: string;
  cinemaSummary?: MovieInCinemaSummary;
  onChangeProvince?: (slug: string) => void;
  onToggleTrack?: (tmdbId: number, isTracked: boolean) => void;
  onSelectRecommendation?: (movie: MovieDetailTarget) => void;
  onGenreClick?: (genre: string) => void;
  onPlatformClick?: (platform: string) => void;
  zIndexClass?: string;
}

export const MobileMovieCinemaDetailModal: React.FC<MobileMovieCinemaDetailModalProps> = ({
  isOpen,
  onClose,
  movie,
  selectedProvinceSlug,
  selectedProvinceName,
  cinemaSummary,
  onChangeProvince,
  onToggleTrack,
  onSelectRecommendation,
  onGenreClick,
  onPlatformClick,
  zIndexClass = 'z-[10030]',
}) => {
  const [activeTab, setActiveTab] = useState<CinemaModalTab>('overview');
  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
    }
  }, [isOpen]);

  const tmdbId = movie?.tmdb_id;

  // Dati utente & TMDB extras
  const { data: myMovies } = useMyMovies();
  const { data: provinces = [] } = useCinemaProvinces();
  const userMovie = useMemo(() => {
    if (!tmdbId || !myMovies) return movie;
    return myMovies.find((m) => m.tmdb_id === tmdbId) || movie;
  }, [myMovies, tmdbId, movie]);

  const { data: extras, isLoading: isExtrasLoading } = useMovieExtras(tmdbId, isOpen);
  const { data: providersData } = useMovieProviders(tmdbId, isOpen);
  const { addMovieMutation, deleteMovieMutation } = useMovieMutations();

  const handleToggleLibrary = () => {
    if (!tmdbId) return;
    const isCurrentlyTracked = Boolean(myMovies?.some((m) => m.tmdb_id === tmdbId));
    if (isCurrentlyTracked) {
      deleteMovieMutation.mutate(tmdbId);
      if (onToggleTrack) onToggleTrack(tmdbId, false);
    } else {
      addMovieMutation.mutate({
        tmdb_id: tmdbId,
        status: 'to_watch',
        movieDetails: {
          title: movie.title,
          poster_path: movie.poster_path || undefined,
          backdrop_path: movie.backdrop_path || undefined,
        },
      });
      if (onToggleTrack) onToggleTrack(tmdbId, true);
    }
  };

  // Selettore saghe condizionale
  const hasCollection = Boolean(
    extras?.collection?.parts && extras.collection.parts.length > 0
  );

  // Se la scheda saga era attiva ma il film non ha saghe, torna a 'overview'
  useEffect(() => {
    if (activeTab === 'saga' && !hasCollection) {
      setActiveTab('overview');
    }
  }, [activeTab, hasCollection]);

  // Gestione tasto indietro hardware Android
  useBackHandler(
    isOpen,
    () => {
      if (isProvinceModalOpen) {
        setIsProvinceModalOpen(false);
        return true;
      }
      onClose();
      return true;
    },
    29
  );

  // Immagine backdrop per il banner superiore
  const backdropUrl = useMemo(() => {
    const custom = userMovie?.custom_backdrop_path || movie.custom_backdrop_path;
    if (custom) return resolveImageUrl(custom);
    const raw = userMovie?.backdrop_path || movie.backdrop_path;
    if (raw) {
      if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
        return raw;
      }
      return `https://image.tmdb.org/t/p/original${raw}`;
    }
    return null;
  }, [userMovie, movie]);

  // Lista generi del film
  const genresList: string[] = useMemo(() => {
    const raw = movie.genres || userMovie?.genres;
    if (raw) {
      return raw.split(',').map((g) => g.trim()).filter(Boolean);
    }
    if (cinemaSummary?.genre) {
      return [cinemaSummary.genre];
    }
    return [];
  }, [movie.genres, userMovie?.genres, cinemaSummary?.genre]);

  const title = movie.title || userMovie?.title || cinemaSummary?.title || 'Dettaglio Film';
  const originalTitle = movie.original_title || userMovie?.original_title || undefined;
  const releaseDateStr = movie.italy_release_date || movie.release_date || userMovie?.italy_release_date || userMovie?.release_date;
  const runtime = movie.runtime || userMovie?.runtime || null;
  const overview = movie.overview || userMovie?.overview || null;
  const userLogs = userMovie?.logs || [];

  // Barra di navigazione inferiore con schede dinamiche
  const tabs = useMemo<MobileTrackerBottomBarTab<CinemaModalTab>[]>(() => {
    const list: MobileTrackerBottomBarTab<CinemaModalTab>[] = [
      {
        id: 'overview',
        label: 'Informazioni',
        icon: (
          <Info
            className={`w-5 h-5 ${
              activeTab === 'overview' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      },
      {
        id: 'showtimes',
        label: 'Orari Cinema',
        icon: (
          <Clock
            className={`w-5 h-5 ${
              activeTab === 'showtimes' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      },
    ];

    if (hasCollection) {
      list.push({
        id: 'saga',
        label: 'Saga',
        icon: (
          <Layers
            className={`w-5 h-5 ${
              activeTab === 'saga' ? 'stroke-[2.5]' : 'stroke-2'
            }`}
          />
        ),
      });
    }

    list.push({
      id: 'review',
      label: 'Recensioni',
      icon: (
        <Star
          className={`w-5 h-5 ${
            activeTab === 'review'
              ? 'fill-blue-500 text-blue-600 stroke-[2.5]'
              : 'stroke-2'
          }`}
        />
      ),
      badge: userLogs.length > 0 ? userLogs.length : undefined,
    });

    return list;
  }, [activeTab, hasCollection, userLogs.length]);

  if (!isOpen || !movie) return null;

  const content = (
    <div
      className={`fixed inset-0 ${
        zIndexClass || 'z-[10030]'
      } bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none`}
    >
      {/* 1. BANNER FOTOGRAFICO SUPERIORE (Stile MobileMediaDetailBanner) */}
      <div className="relative w-full h-56 shrink-0 bg-gray-900 select-none overflow-hidden">
        {/* Backdrop Image nitida */}
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
        )}

        {/* Sfumatura di contrasto per garantire massima leggibilità di testi e icone */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/95 via-gray-950/30 to-black/40 pointer-events-none" />

        {/* Generi in ALTO A SINISTRA (conforme a MobileMediaDetailBanner) */}
        {genresList.length > 0 && (
          <div className="absolute top-3 left-3 max-w-[calc(100%-84px)] z-20 flex flex-wrap gap-1.5 items-center">
            {genresList.map((g: string) => (
              <span
                key={g}
                onClick={() => onGenreClick && onGenreClick(g)}
                className={`px-3 py-1 bg-black/40 text-white text-xs font-bold rounded-full backdrop-blur-md border border-white/20 shadow-lg ${
                  onGenreClick ? 'cursor-pointer hover:bg-black/60 transition-colors' : ''
                }`}
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Pulsante "X" per chiudere in ALTO A DESTRA */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center cursor-pointer transition-colors active:scale-90 shadow-lg"
            title="Chiudi"
            aria-label="Chiudi dettaglio film"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Titolo del Film in BASSO */}
        <div className="absolute bottom-3 left-3.5 right-4 z-20 flex items-center gap-2.5">
          <h1 className="font-black text-white text-lg sm:text-xl drop-shadow-md leading-tight line-clamp-2">
            {title}
          </h1>
        </div>
      </div>

      {/* 2. CONTENUTO SCROLLABILE (Schede Film) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col relative">
        {/* Scheda 1: Informazioni (Data al cinema, durata, regista, trama, cast) */}
        {activeTab === 'overview' && (
          <MobileCinemaOverviewView
            title={title}
            originalTitle={originalTitle}
            releaseDateStr={releaseDateStr || undefined}
            runtime={runtime}
            director={extras?.director}
            overview={overview}
            cast={extras?.cast}
            isExtrasLoading={isExtrasLoading}
            providersData={providersData}
            onPlatformClick={onPlatformClick}
          />
        )}

        {/* Scheda 2: Orari Cinema (Programmazione sale ComingSoon) */}
        {activeTab === 'showtimes' && (
          <MobileCinemaShowtimesView
            provinceSlug={selectedProvinceSlug}
            provinceName={selectedProvinceName}
            idf={cinemaSummary?.idf}
            tmdbId={tmdbId}
            movieTitle={title}
            onChangeProvinceClick={() => setIsProvinceModalOpen(true)}
          />
        )}

        {/* Scheda 3: Saga (Mostrata condizionalmente se il film appartiene a una collezione TMDB) */}
        {activeTab === 'saga' && hasCollection && (
          <MobileMovieSagaTab
            collection={extras?.collection}
            currentMovieId={tmdbId}
            isLoading={isExtrasLoading}
            onSelectMovie={(selected) => onSelectRecommendation?.(selected)}
            onQuickAdd={(sagaTmdbId) => {
              if (onToggleTrack) onToggleTrack(sagaTmdbId, false);
            }}
          />
        )}

        {/* Scheda 4: Recensioni e Citazioni */}
        {activeTab === 'review' && (
          <MobileMovieReviewTab
            movieTmdbId={tmdbId || 0}
            movie={movie}
            userMovie={userMovie}
            onAddTracking={handleToggleLibrary}
          />
        )}
      </div>

      {/* 3. BARRA DI NAVIGAZIONE INFERIORE */}
      <MobileTrackerDetailBottomBar
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* 4. MODALE CAMBIO PROVINCIA */}
      {isProvinceModalOpen && (
        <MobileCinemaProvinceModal
          isOpen={isProvinceModalOpen}
          onClose={() => setIsProvinceModalOpen(false)}
          provinces={provinces}
          selectedSlug={selectedProvinceSlug}
          onSelectProvince={(newSlug) => {
            onChangeProvince?.(newSlug);
            setIsProvinceModalOpen(false);
          }}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMovieCinemaDetailModal;
