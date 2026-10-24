// src/mobile/hooks/useMobileTVEpisodesTimeline.ts
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpcomingEpisodes, fetchUpcomingEpisodes } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import type { UpcomingEpisode, TVSeries } from '@/types/trackers';

export interface UseMobileTVEpisodesTimelineProps {
  series?: TVSeries[];
}

export function useMobileTVEpisodesTimeline({ series }: UseMobileTVEpisodesTimelineProps) {
  const queryClient = useQueryClient();
  const { toggleEpisodeWatched } = useTrackersMutations();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayAnchorRef = useRef<HTMLDivElement>(null);
  const hasScrolledToToday = useRef<boolean>(false);
  const userHasScrolledManually = useRef<boolean>(false);

  const isFetchingEarlierRef = useRef<boolean>(false);
  const isFetchingLaterRef = useRef<boolean>(false);
  const hasReachedStartOfHistory = useRef<boolean>(false);
  const hasReachedEndOfFuture = useRef<boolean>(false);
  const topEpisodeIdRef = useRef<number | null>(null);

  const [episodes, setEpisodes] = useState<UpcomingEpisode[]>([]);
  const [isFetchingEarlier, setIsFetchingEarlier] = useState<boolean>(false);
  const [isFetchingLater, setIsFetchingLater] = useState<boolean>(false);
  const [showBackToToday, setShowBackToToday] = useState<boolean>(false);
  const [isTodayAnchorBelow, setIsTodayAnchorBelow] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulisce timeout di scorrimento al dismount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Helper per estrarre YYYY-MM-DD
  const getCleanDate = useCallback((dateVal?: string | null) => {
    if (!dateVal) return '';
    return dateVal.substring(0, 10);
  }, []);

  // Data odierna YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Verifica se tra gli episodi caricati ce ne sono nel futuro o oggi
  const hasFutureEpisodes = useMemo(() => {
    return episodes.some((ep) => getCleanDate(ep.air_date) >= todayStr);
  }, [episodes, todayStr, getCleanDate]);

  // Spazio inferiore dinamico (solo per timeline con puntate future per consentire all'ancora di raggiungere la cima)
  const [bottomPadding, setBottomPadding] = useState<number>(32);

  // Mappa locandine personalizzate
  const customPosterMap = useMemo(() => {
    const map = new Map<number, string>();
    if (!series) return map;
    for (const s of series) {
      if (s.custom_poster_path) {
        map.set(s.tmdb_id, s.custom_poster_path);
      }
    }
    return map;
  }, [series]);

  // Finestra iniziale date: da 2 mesi fa a 3 mesi avanti
  const { startDateStr, endDateStr } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const start = new Date(currentYear, currentMonth - 2, 1);
    const end = new Date(currentYear, currentMonth + 4, 0);

    const formatISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return {
      startDateStr: formatISO(start),
      endDateStr: formatISO(end),
    };
  }, []);

  const {
    data: initialUpcomingData,
    isLoading,
    isError,
    refetch,
  } = useUpcomingEpisodes(startDateStr, endDateStr);

  // Ordinamento cronologico crescente (dal passato verso il futuro) per timeline standard
  const sortEpisodesAsc = useCallback((list: UpcomingEpisode[]) => {
    return [...list].sort((a, b) => {
      const dateA = (a.air_date || '').substring(0, 10);
      const dateB = (b.air_date || '').substring(0, 10);
      const dateCmp = dateA.localeCompare(dateB);
      if (dateCmp !== 0) return dateCmp;

      const titleCmp = (a.series_title || '').localeCompare(b.series_title || '');
      if (titleCmp !== 0) return titleCmp;
      if (a.season_number !== b.season_number) return a.season_number - b.season_number;
      return a.episode_number - b.episode_number;
    });
  }, []);

  // Ordinamento cronologico decrescente (dal più recente al più vecchio) per storico senza uscite future
  const sortEpisodesDesc = useCallback((list: UpcomingEpisode[]) => {
    return [...list].sort((a, b) => {
      const dateA = (a.air_date || '').substring(0, 10);
      const dateB = (b.air_date || '').substring(0, 10);
      const dateCmp = dateB.localeCompare(dateA);
      if (dateCmp !== 0) return dateCmp;

      const titleCmp = (a.series_title || '').localeCompare(b.series_title || '');
      if (titleCmp !== 0) return titleCmp;
      if (a.season_number !== b.season_number) return b.season_number - a.season_number;
      return b.episode_number - a.episode_number;
    });
  }, []);

  // Inizializzazione della lista intelligente:
  // Se ci sono episodi futuri -> ordine crescente per timeline bidirezionale
  // Se non ci sono episodi futuri -> verifica oltre la finestra iniziale. Se non ce ne sono, storico decrescente
  useEffect(() => {
    if (initialUpcomingData && episodes.length === 0) {
      const hasFutureInInitial = initialUpcomingData.some(
        (ep) => getCleanDate(ep.air_date) >= todayStr
      );

      if (hasFutureInInitial) {
        setEpisodes(sortEpisodesAsc(initialUpcomingData));
      } else {
        // Nessun futuro nella finestra iniziale +/- 2-3 mesi.
        // Controlliamo se ce ne sono più in là nel futuro prima di dichiarare assenza di uscite
        fetchUpcomingEpisodes({ afterDate: todayStr, limit: 10 }).then((futureLater) => {
          if (futureLater && futureLater.length > 0) {
            const combined = [...initialUpcomingData, ...futureLater];
            setEpisodes(sortEpisodesAsc(combined));
          } else {
            // Nessuna uscita futura annunciata in assoluto
            hasReachedEndOfFuture.current = true;
            if (initialUpcomingData.length > 0) {
              setEpisodes(sortEpisodesDesc(initialUpcomingData));
            } else {
              // Carica i 30 episodi più recenti del passato prima di oggi
              fetchUpcomingEpisodes({ beforeDate: todayStr, limit: 30 }).then((past) => {
                if (past && past.length > 0) {
                  setEpisodes(sortEpisodesDesc(past));
                }
              });
            }
          }
        });
      }
    }
  }, [
    initialUpcomingData,
    episodes.length,
    sortEpisodesAsc,
    sortEpisodesDesc,
    todayStr,
    getCleanDate,
  ]);

  // Identifica l'episodio su cui posizionare la vista all'apertura (solo se ci sono uscite future)
  const todayAnchorId = useMemo(() => {
    if (episodes.length === 0 || !hasFutureEpisodes) return null;

    // 1. Episodio che esce oggi
    const todayEp = episodes.find((ep) => getCleanDate(ep.air_date) === todayStr);
    if (todayEp) return todayEp.episode_id;

    // 2. Prossimo episodio futuro (primo nel futuro)
    const nextEp = episodes.find((ep) => getCleanDate(ep.air_date) > todayStr);
    if (nextEp) return nextEp.episode_id;

    return null;
  }, [episodes, todayStr, getCleanDate, hasFutureEpisodes]);

  // Caricamento episodi precedenti (indietro nel tempo)
  const fetchEarlier = useCallback(async () => {
    if (
      isFetchingEarlierRef.current ||
      hasReachedStartOfHistory.current ||
      episodes.length === 0
    ) {
      return;
    }

    // Se ci sono episodi futuri, la lista è crescente: l'episodio più vecchio è episodes[0]
    // Se NON ci sono episodi futuri, la lista è decrescente: l'episodio più vecchio è in fondo (episodes[episodes.length - 1])
    const oldestEp = hasFutureEpisodes ? episodes[0] : episodes[episodes.length - 1];
    if (!oldestEp || !oldestEp.air_date) {
      hasReachedStartOfHistory.current = true;
      return;
    }

    isFetchingEarlierRef.current = true;
    setIsFetchingEarlier(true);
    topEpisodeIdRef.current = oldestEp.episode_id;

    const earliestDate = oldestEp.air_date.substring(0, 10);
    try {
      const earlier = await fetchUpcomingEpisodes({ beforeDate: earliestDate, limit: 30 });
      if (!earlier || earlier.length === 0) {
        hasReachedStartOfHistory.current = true;
      } else {
        const existingIds = new Set(episodes.map((e) => e.episode_id));
        const uniqueEarlier = earlier.filter((e) => !existingIds.has(e.episode_id));
        if (uniqueEarlier.length === 0) {
          hasReachedStartOfHistory.current = true;
        } else {
          if (hasFutureEpisodes) {
            setEpisodes((prev) => sortEpisodesAsc([...uniqueEarlier, ...prev]));
            requestAnimationFrame(() => {
              if (topEpisodeIdRef.current) {
                const el = document.getElementById(`ep-${topEpisodeIdRef.current}`);
                if (el && scrollContainerRef.current) {
                  el.scrollIntoView({ block: 'start' });
                }
              }
            });
          } else {
            // Senza uscite future: si appende in fondo procedendo a ritroso nel passato
            setEpisodes((prev) => sortEpisodesDesc([...prev, ...uniqueEarlier]));
          }
        }
      }
    } catch {
      // Ignora errore transitorio di rete
    } finally {
      isFetchingEarlierRef.current = false;
      setIsFetchingEarlier(false);
    }
  }, [episodes, hasFutureEpisodes, sortEpisodesAsc, sortEpisodesDesc]);

  // Caricamento episodi futuri successivi (solo per modalità con uscite future)
  const fetchLater = useCallback(async () => {
    if (
      !hasFutureEpisodes ||
      isFetchingLaterRef.current ||
      hasReachedEndOfFuture.current ||
      episodes.length === 0
    ) {
      return;
    }

    const latestEp = episodes[episodes.length - 1];
    if (!latestEp || !latestEp.air_date) {
      hasReachedEndOfFuture.current = true;
      return;
    }

    isFetchingLaterRef.current = true;
    setIsFetchingLater(true);

    const latestDate = latestEp.air_date.substring(0, 10);
    try {
      const later = await fetchUpcomingEpisodes({ afterDate: latestDate, limit: 30 });
      if (!later || later.length === 0) {
        hasReachedEndOfFuture.current = true;
      } else {
        const existingIds = new Set(episodes.map((e) => e.episode_id));
        const uniqueLater = later.filter((e) => !existingIds.has(e.episode_id));
        if (uniqueLater.length === 0) {
          hasReachedEndOfFuture.current = true;
        } else {
          setEpisodes((prev) => sortEpisodesAsc([...prev, ...uniqueLater]));
        }
      }
    } catch {
      // Ignora errore transitorio di rete
    } finally {
      isFetchingLaterRef.current = false;
      setIsFetchingLater(false);
    }
  }, [episodes, hasFutureEpisodes, sortEpisodesAsc]);

  // Precarica automaticamente altri episodi futuri se ce ne sono meno di 7 dopo l'ancora
  useEffect(() => {
    if (!hasFutureEpisodes || isLoading || isFetchingEarlier || isFetchingLater) return;
    if (episodes.length === 0 || hasReachedEndOfFuture.current) return;

    const anchorIndex = episodes.findIndex((ep) => ep.episode_id === todayAnchorId);
    const futureCount = anchorIndex >= 0 ? episodes.length - anchorIndex : 0;

    if (futureCount < 7) {
      fetchLater();
    }
  }, [hasFutureEpisodes, isLoading, isFetchingEarlier, isFetchingLater, episodes, todayAnchorId, fetchLater]);

  // Posizionamento iniziale della vista:
  // - Con uscite future: scroll verso l'ancora di Oggi o della prima uscita futura con padding calcolato
  // - Senza uscite future: scroll iniziale in cima (scrollTop = 0) per mostrare l'avviso e l'ultimo episodio uscito
  useEffect(() => {
    if (!isLoading && episodes.length > 0 && !hasScrolledToToday.current) {
      const performAlignment = () => {
        if (userHasScrolledManually.current) return;
        const container = scrollContainerRef.current;
        if (!container) return;

        if (hasFutureEpisodes) {
          const target = todayAnchorRef.current;
          if (target) {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 4;
            container.scrollTop = Math.max(0, scrollOffset);
            hasScrolledToToday.current = true;

            const lastCard = container.querySelector('[data-episode-card]:last-of-type') as HTMLElement | null;
            if (lastCard) {
              const lastCardBottom = lastCard.offsetTop + lastCard.offsetHeight;
              const contentHeightBelowAnchor = lastCardBottom - target.offsetTop;
              const containerHeight = container.clientHeight;
              const neededPadding = Math.max(32, Math.ceil(containerHeight - contentHeightBelowAnchor + 32));
              setBottomPadding(neededPadding);
            }
          }
        } else {
          // Senza uscite future: la vista parte dall'inizio
          container.scrollTop = 0;
          setBottomPadding(32);
          hasScrolledToToday.current = true;
        }
      };

      performAlignment();
      const raf = requestAnimationFrame(performAlignment);
      const timer = setTimeout(performAlignment, 80);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isLoading, episodes, hasFutureEpisodes]);

  // Gestione dello scroll continuo
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    userHasScrolledManually.current = true;

    // Attiva la barra di scorrimento solo durante lo scorrimento
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 900);

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Tasto "Torna ad oggi / Torna in cima"
    if (hasFutureEpisodes) {
      if (todayAnchorRef.current) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = todayAnchorRef.current.getBoundingClientRect();
        const diff = targetRect.top - containerRect.top;

        const isDistant = Math.abs(diff) > 40;
        setShowBackToToday(isDistant);
        setIsTodayAnchorBelow(diff > 40);
      }
    } else {
      // Senza uscite future: se l'utente è sceso nel passato di oltre 100px mostra il tasto per tornare in cima
      const isDistant = scrollTop > 100;
      setShowBackToToday(isDistant);
      setIsTodayAnchorBelow(false); // Freccia sempre verso l'alto (verso la cima)
    }

    if (!hasScrolledToToday.current) return;

    if (hasFutureEpisodes) {
      // Modalità con futuro: scroll in cima carica il passato
      if (scrollTop <= 20) {
        fetchEarlier();
      }
      // Scroll in fondo carica il futuro
      if (scrollHeight - scrollTop - clientHeight <= (bottomPadding + 60)) {
        fetchLater();
      }
    } else {
      // Senza uscite future: scrollando verso il fondo si caricano gli episodi più vecchi
      if (scrollHeight - scrollTop - clientHeight <= 80) {
        fetchEarlier();
      }
    }
  };

  const handleScrollToToday = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (hasFutureEpisodes && todayAnchorRef.current) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = todayAnchorRef.current.getBoundingClientRect();
      const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 4;
      container.scrollTo({
        top: Math.max(0, scrollOffset),
        behavior: 'smooth',
      });
    } else {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleToggleWatch = useCallback(
    (episode: UpcomingEpisode) => {
      // Aggiornamento ottimistico locale immediato (0ms)
      setEpisodes((prev) =>
        prev.map((ep) =>
          ep.episode_id === episode.episode_id
            ? { ...ep, is_watched: !ep.is_watched }
            : ep
        )
      );

      queryClient.setQueriesData<UpcomingEpisode[]>(
        { queryKey: ['trackers', 'upcoming'] },
        (old) => {
          if (!old) return old;
          return old.map((ep) =>
            ep.episode_id === episode.episode_id
              ? { ...ep, is_watched: !ep.is_watched }
              : ep
          );
        }
      );

      toggleEpisodeWatched(
        {
          episode_id: episode.episode_id,
          watched: !episode.is_watched,
        },
        {
          onError: () => {
            setEpisodes((prev) =>
              prev.map((ep) =>
                ep.episode_id === episode.episode_id
                  ? { ...ep, is_watched: episode.is_watched }
                  : ep
              )
            );
            queryClient.invalidateQueries({ queryKey: ['trackers', 'upcoming'] });
          },
        }
      );
    },
    [queryClient, toggleEpisodeWatched]
  );

  const handleResetTimeline = useCallback(() => {
    setEpisodes([]);
    hasReachedStartOfHistory.current = false;
    hasReachedEndOfFuture.current = false;
    hasScrolledToToday.current = false;
    userHasScrolledManually.current = false;
    refetch();
  }, [refetch]);

  return {
    scrollContainerRef,
    todayAnchorRef,
    todayAnchorId,
    episodes,
    hasFutureEpisodes,
    hasReachedStartOfHistory: hasReachedStartOfHistory.current,
    hasReachedEndOfFuture: hasReachedEndOfFuture.current,
    isFetchingEarlier,
    isFetchingLater,
    isLoading,
    isError,
    todayStr,
    bottomPadding,
    isScrolling,
    showBackToToday,
    isTodayAnchorBelow,
    customPosterMap,
    getCleanDate,
    handleScroll,
    handleScrollToToday,
    handleToggleWatch,
    handleResetTimeline,
  };
}
