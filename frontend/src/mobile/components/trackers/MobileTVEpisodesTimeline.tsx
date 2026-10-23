// src/mobile/components/trackers/MobileTVEpisodesTimeline.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpcomingEpisodes, fetchUpcomingEpisodes } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import type { UpcomingEpisode, TVSeries } from '@/types/trackers';
import MobileTVEpisodeHorizontalCard from './MobileTVEpisodeHorizontalCard';
import TimelineLoadingCard from './TimelineLoadingCard';
import TimelineBackToTodayButton from './TimelineBackToTodayButton';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { TvIcon } from '@/components/shared/utils/Icons';

export interface MobileTVEpisodesTimelineProps {
  series?: TVSeries[];
  onEpisodeClick: (episode: UpcomingEpisode) => void;
  onOpenSeriesDetail?: (episode: UpcomingEpisode) => void;
}

export const MobileTVEpisodesTimeline: React.FC<MobileTVEpisodesTimelineProps> = ({
  series,
  onEpisodeClick,
  onOpenSeriesDetail,
}) => {
  const queryClient = useQueryClient();
  const { toggleEpisodeWatched } = useTrackersMutations();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayAnchorRef = useRef<HTMLDivElement>(null);
  const hasScrolledToToday = useRef<boolean>(false);

  // Indicatori di stato ref per evitare re-trigger a catena durante lo scorrimento
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

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Spazio inferiore dinamico per consentire all'episodio di oggi/prossimo di raggiungere la cima sotto l'header
  const [bottomPadding, setBottomPadding] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.max(350, window.innerHeight - 150);
    }
    return 500;
  });

  // Flag per evitare che l'allineamento automatico iniziale interferisca con lo scroll manuale dell'utente
  const userHasScrolledManually = useRef<boolean>(false);

  const getCleanDate = useCallback((dateVal?: string | null) => {
    if (!dateVal) return '';
    return dateVal.substring(0, 10);
  }, []);

  // Data odierna in formato YYYY-MM-DD
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Mappa delle locandine personalizzate per le serie seguite (per TMDB ID)
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

  // Finestra iniziale date: da 2 mesi fa a 3 mesi avanti rispetto a oggi
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

  // Ordinamento cronologico continuo; per la stessa data ordine per titolo serie e numero episodio
  const sortEpisodes = useCallback((list: UpcomingEpisode[]) => {
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

  // Inizializzazione della lista con i dati della finestra iniziale
  useEffect(() => {
    if (initialUpcomingData && episodes.length === 0) {
      if (initialUpcomingData.length > 0) {
        setEpisodes(sortEpisodes(initialUpcomingData));
      } else {
        // Fallback: se nella finestra iniziale di +/-2 mesi non ci sono episodi, cerca i 20 più recenti prima di oggi
        fetchUpcomingEpisodes({ beforeDate: todayStr, limit: 20 }).then((past) => {
          if (past && past.length > 0) {
            setEpisodes(sortEpisodes(past));
          }
        });
      }
    }
  }, [initialUpcomingData, episodes.length, sortEpisodes, todayStr]);

  // Identifica l'episodio su cui posizionare la vista all'apertura:
  // 1. Il primo episodio di oggi
  // 2. Se non c'è, il prossimo episodio in uscita (primo nel futuro)
  // 3. Se tutte le uscite sono passate, l'episodio più recente
  const todayAnchorId = useMemo(() => {
    if (episodes.length === 0) return null;

    // 1. Episodio che esce oggi
    const todayEp = episodes.find((ep) => getCleanDate(ep.air_date) === todayStr);
    if (todayEp) return todayEp.episode_id;

    // 2. Prossimo episodio futuro (primo nel futuro)
    const nextEp = episodes.find((ep) => getCleanDate(ep.air_date) > todayStr);
    if (nextEp) return nextEp.episode_id;

    // 3. Fallback: episodio più recente del passato
    return episodes[episodes.length - 1].episode_id;
  }, [episodes, todayStr, getCleanDate]);

  // Caricamento episodi precedenti (indietro nel tempo) a prescindere dal gap temporale
  const fetchEarlier = useCallback(async () => {
    if (
      isFetchingEarlierRef.current ||
      hasReachedStartOfHistory.current ||
      episodes.length === 0
    ) {
      return;
    }

    const earliestEp = episodes[0];
    if (!earliestEp || !earliestEp.air_date) {
      hasReachedStartOfHistory.current = true;
      return;
    }

    isFetchingEarlierRef.current = true;
    setIsFetchingEarlier(true);
    topEpisodeIdRef.current = earliestEp.episode_id;

    const earliestDate = earliestEp.air_date.substring(0, 10);
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
          setEpisodes((prev) => sortEpisodes([...uniqueEarlier, ...prev]));
          requestAnimationFrame(() => {
            if (topEpisodeIdRef.current) {
              const el = document.getElementById(`ep-${topEpisodeIdRef.current}`);
              if (el && scrollContainerRef.current) {
                el.scrollIntoView({ block: 'start' });
              }
            }
          });
        }
      }
    } catch {
      // Ignora errore transitorio di rete
    } finally {
      isFetchingEarlierRef.current = false;
      setIsFetchingEarlier(false);
    }
  }, [episodes, sortEpisodes]);

  // Caricamento episodi futuri successivi a prescindere dal gap temporale
  const fetchLater = useCallback(async () => {
    if (
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
          setEpisodes((prev) => sortEpisodes([...prev, ...uniqueLater]));
        }
      }
    } catch {
      // Ignora errore transitorio di rete
    } finally {
      isFetchingLaterRef.current = false;
      setIsFetchingLater(false);
    }
  }, [episodes, sortEpisodes]);

  // Se ci sono meno di 7 episodi futuri rispetto all'ancora odierna, pre-carica automaticamente altri futuri
  useEffect(() => {
    if (isLoading || isFetchingEarlier || isFetchingLater) return;
    if (episodes.length === 0 || hasReachedEndOfFuture.current) return;

    const anchorIndex = episodes.findIndex((ep) => ep.episode_id === todayAnchorId);
    const futureCount = anchorIndex >= 0 ? episodes.length - anchorIndex : 0;

    if (futureCount < 7) {
      fetchLater();
    }
  }, [isLoading, isFetchingEarlier, isFetchingLater, episodes, todayAnchorId, fetchLater]);

  // Posizionamento iniziale accurato su "Oggi" o sul "Prossimo Episodio"
  useEffect(() => {
    if (!isLoading && episodes.length > 0 && !hasScrolledToToday.current) {
      const performAlignment = () => {
        if (userHasScrolledManually.current) return;
        const container = scrollContainerRef.current;
        const target = todayAnchorRef.current;
        if (container && target) {
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
  }, [isLoading, episodes]);

  // Gestione dello scroll continuo
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    userHasScrolledManually.current = true;

    // Attiva la barra di scorrimento solo durante lo scorrimento effettivo (scompare dopo 900ms)
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 900);

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Tasto "Torna ad oggi / prossimo": controlla la distanza visiva dall'ancora
    if (todayAnchorRef.current) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = todayAnchorRef.current.getBoundingClientRect();
      const diff = targetRect.top - containerRect.top;

      const isDistant = Math.abs(diff) > 40;
      setShowBackToToday(isDistant);
      setIsTodayAnchorBelow(diff > 40);
    }

    if (!hasScrolledToToday.current) return;

    // Scroll verso la cima: attiva quando si raggiunge il margine superiore
    if (scrollTop <= 20) {
      fetchEarlier();
    }

    // Scroll verso il fondo: attiva quando si raggiunge l'ultima card
    if (scrollHeight - scrollTop - clientHeight <= (bottomPadding + 60)) {
      fetchLater();
    }
  };

  const handleScrollToToday = () => {
    const container = scrollContainerRef.current;
    const target = todayAnchorRef.current;
    if (container && target) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 4;
      container.scrollTo({
        top: Math.max(0, scrollOffset),
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

  if (isError && episodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={<TvIcon className="w-10 h-10 opacity-30 text-gray-500" />}
          message="Impossibile caricare le uscite degli episodi."
        />
        <button
          type="button"
          onClick={() => {
            setEpisodes([]);
            hasReachedStartOfHistory.current = false;
            hasReachedEndOfFuture.current = false;
            refetch();
          }}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!isLoading && episodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={<TvIcon className="w-12 h-12 opacity-30 text-gray-500" />}
          message="Nessun episodio in uscita o recente per le serie che stai seguendo."
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col min-h-0">
      {/* SCROLL CONTAINER VERTICALE CON LISTONE CONTINUO */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ paddingBottom: `${bottomPadding}px` }}
        className={`relative flex-1 min-h-0 overflow-y-auto px-1 pt-1 space-y-2 fade-scrollbar ${
          isScrolling ? 'is-scrolling' : ''
        }`}
      >
        {/* AVVISO INIZIO STORICO QUANDO NON CI SONO PIÙ PUNTATE PASSATE */}
        {hasReachedStartOfHistory.current && episodes.length > 0 && (
          <div className="py-2.5 px-3 text-center text-[10px] text-gray-400 font-medium italic border-b border-gray-100 bg-gray-50/50">
            Hai raggiunto l'inizio delle uscite delle tue serie
          </div>
        )}

        {/* CARICAMENTO IN CIMA (SOPRA TUTTE LE CARD PER IL PASSATO O ALL'AVVIO) */}
        {(isFetchingEarlier || (isLoading && episodes.length === 0)) && (
          <TimelineLoadingCard />
        )}

        {/* LISTONE CARD SENZA TITOLI O RIQUADRI INTERMEDI */}
        {episodes.map((ep) => {
          const isAnchor = ep.episode_id === todayAnchorId;
          const isToday = getCleanDate(ep.air_date) === todayStr;

          return (
            <div
              key={ep.episode_id}
              id={`ep-${ep.episode_id}`}
              data-episode-card="true"
              ref={isAnchor ? todayAnchorRef : undefined}
            >
              <MobileTVEpisodeHorizontalCard
                episode={ep}
                customPosterUrl={customPosterMap.get(ep.series_tmdb_id)}
                onClick={onEpisodeClick}
                onOpenSeriesDetail={onOpenSeriesDetail}
                onToggleWatch={handleToggleWatch}
                isToday={isToday}
              />
            </div>
          );
        })}

        {/* CARICAMENTO IN FONDO (SOTTO TUTTE LE CARD PER IL FUTURO) */}
        {isFetchingLater && <TimelineLoadingCard />}

        {/* AVVISO FINE USCITE FUTURE */}
        {hasReachedEndOfFuture.current && episodes.length > 0 && (
          <div className="py-2.5 px-3 text-center text-[10px] text-gray-400 font-medium italic border-t border-gray-100 bg-gray-50/50">
            Nessun'altra uscita futura annunciata
          </div>
        )}
      </div>

      {/* TASTO TONDO "TORNA AD OGGI / PROSSIMO" CON FRECCIA DINAMICA */}
      <TimelineBackToTodayButton
        visible={showBackToToday}
        isAnchorBelow={isTodayAnchorBelow}
        onClick={handleScrollToToday}
      />
    </div>
  );
};

export default MobileTVEpisodesTimeline;
