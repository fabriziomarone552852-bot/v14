// src/hooks/trackers/useUpcomingMoviesCarousel.ts
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useUpcomingMovies } from '@/hooks/queries/useMovieQueries';
import { useCinemaProvinceSelection } from '@/hooks/trackers/useCinemaProvinceSelection';
import type { Movie } from '@/types/movies';
import type { MovieInCinemaSummary } from '@/types/cinema';

export interface CinemaCarouselItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDateStr: string;
  releaseDate: Date;
  isRecentRelease: boolean;
  isInCinema: boolean;
  daysUntilText: string;
}

export const formatDateIt = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return dateStr;
  }
};

const getDaysUntil = (d: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Oggi';
  if (diffDays === 1) return 'Domani';
  if (diffDays < 7) return `tra ${diffDays} gg`;
  if (diffDays < 14) return 'tra 1 sett.';
  if (diffDays < 30) return `tra ${Math.round(diffDays / 7)} sett.`;
  return `tra ${Math.round(diffDays / 30)} mesi`;
};

export const useUpcomingMoviesCarousel = (movies: Movie[]) => {
  const [startIndex, setStartIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState<'next' | 'prev' | null>(null);

  const resetCarousel = useCallback(() => {
    setStartIndex(0);
  }, []);

  const {
    provinces,
    selectedProvinceSlug,
    provinceData,
    isLoadingCinema,
    currentProvince,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
  } = useCinemaProvinceSelection(resetCarousel);

  const { data: upcomingFromApi = [] } = useUpcomingMovies();

  // Mappa film ComingSoon per matching rapido con i film salvati dall'utente
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

  // Set di film recenti da TMDB per arricchimento
  const recentTmdbSet = useMemo(() => {
    return new Set(
      upcomingFromApi.filter((u) => u.is_recent_release).map((u) => u.movie_tmdb_id)
    );
  }, [upcomingFromApi]);

  // Set di film già visti (da escludere categoricamente)
  const watchedTmdbSet = useMemo(() => {
    const s = new Set<number>();
    movies.forEach((m) => {
      const isWatched =
        m.status === 'watched' || (typeof m.watch_count === 'number' && m.watch_count > 0);
      if (isWatched && m.tmdb_id) {
        s.add(m.tmdb_id);
      }
    });
    return s;
  }, [movies]);

  // Costruzione della lista film: SOLO ed ESCLUSIVAMENTE dai film dell'utente (movies)
  const displayItems: CinemaCarouselItem[] = useMemo(() => {
    if (!movies || movies.length === 0) return [];

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const itemsMap = new Map<number, CinemaCarouselItem>();

    movies.forEach((m) => {
      if (watchedTmdbSet.has(m.tmdb_id)) return;

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

      const isCsPlaying = Boolean(csMatch);
      const isRecentRelease = recentTmdbSet.has(m.tmdb_id);
      const daysAgo = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      const isInTheatrical = daysAgo >= 0 && daysAgo <= 60;

      if (isCsPlaying || isRecentRelease || isInTheatrical || isFuture) {
        itemsMap.set(m.tmdb_id, {
          id: m.tmdb_id,
          title: m.title,
          posterPath: m.poster_path || csMatch?.poster || null,
          releaseDateStr: relStr,
          releaseDate: d,
          isRecentRelease,
          isInCinema: isCsPlaying || isRecentRelease || isInTheatrical,
          daysUntilText: isFuture ? getDaysUntil(d) : 'In sala',
        });
      }
    });

    // Ordinamento cronologico rigoroso: film uscito prima per primo, poi a seguire a destra
    return Array.from(itemsMap.values()).sort(
      (a, b) => a.releaseDate.getTime() - b.releaseDate.getTime()
    );
  }, [movies, watchedTmdbSet, comingSoonMap, recentTmdbSet]);

  // Calcolo carosello continuo a scatto
  const total = displayItems.length;
  const safeStartIndex = total > 0 ? startIndex % total : 0;

  const stepNext = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating('next');
    setTimeout(() => {
      setStartIndex((prev) => (prev + 1) % total);
      setIsAnimating(null);
    }, 280);
  }, [total, isAnimating]);

  const stepPrev = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating('prev');
    setTimeout(() => {
      setStartIndex((prev) => (prev - 1 + total) % total);
      setIsAnimating(null);
    }, 280);
  }, [total, isAnimating]);

  // Scorrimento discreto con listener wheel non-passivo per bloccare la navigazione "Indietro" del browser
  const carouselContainerRef = useRef<HTMLDivElement | null>(null);
  const lastWheelTimeRef = useRef(0);
  const wheelStateRef = useRef({ stepNext, stepPrev, total });

  useEffect(() => {
    wheelStateRef.current = { stepNext, stepPrev, total };
  }, [stepNext, stepPrev, total]);

  useEffect(() => {
    const el = carouselContainerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      const { stepNext: next, stepPrev: prev, total: count } = wheelStateRef.current;

      if (Math.abs(e.deltaX) > 0 || count > 1) {
        e.preventDefault();
        e.stopPropagation();
      }

      const now = Date.now();
      if (now - lastWheelTimeRef.current < 300) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > 20 || absY > 20) {
        lastWheelTimeRef.current = now;
        const primaryDelta = absX >= absY ? e.deltaX : e.deltaY;
        if (primaryDelta > 0) {
          next();
        } else {
          prev();
        }
      }
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // Costruzione sequenza ciclica continua
  const visibleItems = useMemo(() => {
    if (total === 0) return [];
    const res: Array<{ item: CinemaCarouselItem; originalIndex: number }> = [];
    const count = Math.min(total, 6);
    for (let i = 0; i < count; i++) {
      const idx = (safeStartIndex + i) % total;
      res.push({ item: displayItems[idx], originalIndex: idx });
    }
    return res;
  }, [displayItems, safeStartIndex, total]);

  const isLoading = isLoadingCinema && !provinceData && movies.length === 0;

  return {
    carouselContainerRef,
    provinces,
    selectedProvinceSlug,
    currentProvince,
    isProvinceModalOpen,
    setIsProvinceModalOpen,
    handleSelectProvince,
    visibleItems,
    total,
    isLoading,
    isAnimating,
    stepNext,
    setStartIndex,
  };
};
