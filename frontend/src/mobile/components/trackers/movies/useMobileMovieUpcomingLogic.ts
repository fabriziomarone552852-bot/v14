// src/mobile/components/trackers/movies/useMobileMovieUpcomingLogic.ts
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import { useUpcomingMovies } from '@/hooks/queries/useMovieQueries';
import {
  useCinemaProvinces,
  useProvinceCinemaData,
} from '@/hooks/queries/useCinemaQueries';
import { useUserStreamingProviders } from '@/hooks/trackers/useUserStreamingProviders';
import { resolveImageUrl } from '@/utils/imageUtils';
import type { Movie, MovieWatchProvider } from '@/types/movies';
import type { MovieInCinemaSummary } from '@/types/cinema';

export interface ProcessedCinemaMovieItem {
  movie: Movie;
  releaseDateStr: string;
  releaseDate: Date;
  cinemaSummary?: MovieInCinemaSummary;
}

export interface StreamingCatalogMovieItem {
  movie: Movie;
  matchedProviders: MovieWatchProvider[];
}

interface SyncProvidersResponse {
  synced_count: number;
  remaining_count: number;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export const resolveMovieMediaUrl = (
  rawPath: string | null | undefined,
  size: 'w200' | 'w780' = 'w200'
): string | null => {
  if (!rawPath) return null;
  if (rawPath.startsWith('http') || rawPath.startsWith('data:')) return rawPath;
  if (rawPath.startsWith('/uploads')) return resolveImageUrl(rawPath);
  return `https://image.tmdb.org/t/p/${size}${rawPath}`;
};

export const formatDalDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `dal ${day}/${month}`;
  } catch {
    return dateStr;
  }
};

export const getDaysUntilText = (d: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Oggi';
  if (diffDays === 1) return 'Domani';
  if (diffDays < 7) return `tra ${diffDays} giorni`;
  if (diffDays < 14) return 'tra 1 sett.';
  if (diffDays < 30) return `tra ${Math.round(diffDays / 7)} sett.`;
  return `tra ${Math.round(diffDays / 30)} mesi`;
};

export const useMobileMovieUpcomingLogic = (movies: Movie[]) => {
  const queryClient = useQueryClient();

  // Gestione provincia cinema (persistenza affidabile in localStorage)
  const [selectedProvinceSlug, setSelectedProvinceSlug] = useState<string>(() => {
    return localStorage.getItem('vita_cinema_province') || 'milano';
  });

  const [isProvinceModalOpen, setIsProvinceModalOpen] = useState(false);
  const [isPlatformsModalOpen, setIsPlatformsModalOpen] = useState(false);
  const [selectedCinemaModalMovie, setSelectedCinemaModalMovie] =
    useState<ProcessedCinemaMovieItem | null>(null);

  // Queries Cinema & Prossime uscite
  const { data: upcomingFromApi = [] } = useUpcomingMovies();
  const { data: provinces = [] } = useCinemaProvinces();
  const { data: provinceData, isLoading: isLoadingCinema } =
    useProvinceCinemaData(selectedProvinceSlug);

  // Piattaforme streaming disponibili all'utente
  const streamingProvidersState = useUserStreamingProviders();
  const { userProviderIds } = streamingProvidersState;

  const currentProvince = useMemo(() => {
    return (
      provinces.find((p) => p.slug === selectedProvinceSlug) || {
        name: provinceData?.province_name || selectedProvinceSlug.toUpperCase(),
        slug: selectedProvinceSlug,
      }
    );
  }, [provinces, selectedProvinceSlug, provinceData]);

  const handleSelectProvince = (slug: string) => {
    setSelectedProvinceSlug(slug);
    localStorage.setItem('vita_cinema_province', slug);
  };

  // Sincronizzazione automatica silenziosa dei watch_providers mancanti o scaduti per i film a catalogo
  const syncInFlightRef = useRef(false);
  const syncBatchesCountRef = useRef(0);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    if (syncInFlightRef.current || syncBatchesCountRef.current >= 4) return;

    const nowMs = Date.now();
    const needsSync = movies.some((m) => {
      if (m.watch_providers === null || m.watch_providers === undefined) return true;
      if (!m.providers_synced_at) return true;
      const syncedTime = new Date(m.providers_synced_at).getTime();
      return isNaN(syncedTime) || nowMs - syncedTime > FOURTEEN_DAYS_MS;
    });

    if (!needsSync) return;

    syncInFlightRef.current = true;
    syncBatchesCountRef.current += 1;

    api
      .post<SyncProvidersResponse>('/trackers/movies/sync-providers', {})
      .then((res) => {
        if (res && res.synced_count > 0) {
          void queryClient.invalidateQueries({ queryKey: ['trackers', 'movies'] });
        }
      })
      .catch(() => {
        // Silenzioso in background: riproverà alla prossima sessione se offline
      })
      .finally(() => {
        syncInFlightRef.current = false;
      });
  }, [movies, queryClient]);

  // Mappa film ComingSoon per matching sale cinematografiche
  const comingSoonMap = useMemo(() => {
    const byTmdbId = new Map<number, MovieInCinemaSummary>();
    const byTitle = new Map<string, MovieInCinemaSummary>();
    const byNorm = new Map<string, MovieInCinemaSummary>();

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    (provinceData?.movies || []).forEach((cm) => {
      if (cm.tmdb_id) byTmdbId.set(cm.tmdb_id, cm);
      const clean = cm.title.trim().toLowerCase();
      byTitle.set(clean, cm);
      byNorm.set(normalize(clean), cm);
    });

    return { byTmdbId, byTitle, byNorm, normalize };
  }, [provinceData?.movies]);

  const recentTmdbSet = useMemo(() => {
    return new Set(
      upcomingFromApi.filter((u) => u.is_recent_release).map((u) => u.movie_tmdb_id)
    );
  }, [upcomingFromApi]);

  // Calcolo ORA AL CINEMA e PROSSIMAMENTE IN USCITA
  const { nowInCinemaMovies, upcomingMovies } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const cinemaList: ProcessedCinemaMovieItem[] = [];
    const upcomingList: ProcessedCinemaMovieItem[] = [];

    movies.forEach((m) => {
      const isWatched =
        m.status === 'watched' || (typeof m.watch_count === 'number' && m.watch_count > 0);
      if (isWatched) return;

      const relStr = m.italy_release_date || m.release_date;
      if (!relStr) return;

      const d = new Date(relStr);
      if (isNaN(d.getTime())) return;

      const isFuture = d.getTime() > today.getTime();
      const cleanTitle = m.title.trim().toLowerCase();
      const normTitle = comingSoonMap.normalize(cleanTitle);
      const csMatch =
        comingSoonMap.byTmdbId.get(m.tmdb_id) ||
        comingSoonMap.byTitle.get(cleanTitle) ||
        comingSoonMap.byNorm.get(normTitle);

      if (isFuture) {
        upcomingList.push({
          movie: m,
          releaseDateStr: relStr,
          releaseDate: d,
          cinemaSummary: csMatch,
        });
      } else {
        const isCsPlaying = Boolean(csMatch);
        const isRecentRelease = recentTmdbSet.has(m.tmdb_id);
        const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
        const isInTheatricalWindow = daysAgo >= 0 && daysAgo <= 60;

        if (isCsPlaying || isRecentRelease || isInTheatricalWindow) {
          cinemaList.push({
            movie: m,
            releaseDateStr: relStr,
            releaseDate: d,
            cinemaSummary: csMatch,
          });
        }
      }
    });

    cinemaList.sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());
    upcomingList.sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

    return { nowInCinemaMovies: cinemaList, upcomingMovies: upcomingList };
  }, [movies, comingSoonMap, recentTmdbSet]);

  // Calcolo film nel catalogo personale (non ancora visti) disponibili sulle piattaforme dell'utente
  const streamingCatalogMovies: StreamingCatalogMovieItem[] = useMemo(() => {
    if (userProviderIds.size === 0 || movies.length === 0) return [];

    const matched: StreamingCatalogMovieItem[] = [];

    movies.forEach((m) => {
      const isWatched =
        m.status === 'watched' || (typeof m.watch_count === 'number' && m.watch_count > 0);
      if (isWatched) return;

      if (!Array.isArray(m.watch_providers) || m.watch_providers.length === 0) return;

      const providersForUser = m.watch_providers.filter((wp) =>
        userProviderIds.has(wp.provider_id)
      );

      if (providersForUser.length > 0) {
        matched.push({
          movie: m,
          matchedProviders: providersForUser,
        });
      }
    });

    matched.sort((a, b) => {
      const timeA = new Date(a.movie.added_at || a.movie.updated_at || 0).getTime();
      const timeB = new Date(b.movie.added_at || b.movie.updated_at || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return a.movie.title.localeCompare(b.movie.title, 'it');
    });

    return matched;
  }, [movies, userProviderIds]);

  const hasCinemaOrUpcoming = nowInCinemaMovies.length > 0 || upcomingMovies.length > 0;
  const showStreamingFallback = !hasCinemaOrUpcoming && streamingCatalogMovies.length > 0;

  return {
    provinces,
    selectedProvinceSlug,
    currentProvince,
    isLoadingCinema,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
    selectedCinemaModalMovie,
    setSelectedCinemaModalMovie,
    isPlatformsModalOpen,
    setIsPlatformsModalOpen,
    streamingProvidersState,
    nowInCinemaMovies,
    upcomingMovies,
    streamingCatalogMovies,
    showStreamingFallback,
  };
};
