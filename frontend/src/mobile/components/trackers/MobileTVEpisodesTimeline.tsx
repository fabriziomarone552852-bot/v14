// src/mobile/components/trackers/MobileTVEpisodesTimeline.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpcomingEpisodes } from '@/hooks/queries/useTrackersQueries';
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
  const prevEpisodeCountRef = useRef<number>(0);

  // Finestra dinamica dei mesi: default da 2 mesi fa a 2 mesi avanti (es. da Agosto a Dicembre a Ottobre)
  const [pastMonthsOffset, setPastMonthsOffset] = useState<number>(2);
  const [futureMonthsOffset, setFutureMonthsOffset] = useState<number>(2);

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

  // Spazio inferiore dinamico per consentire all'episodio di oggi/prossimo di raggiungere sempre la cima sotto l'header
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

  // Calcolo intervallo date per la query API basato sugli offset dei mesi
  const { startDateStr, endDateStr } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Inizio: 1° giorno di (mese corrente - pastMonthsOffset)
    const start = new Date(currentYear, currentMonth - pastMonthsOffset, 1);
    // Fine: ultimo giorno di (mese corrente + futureMonthsOffset)
    const end = new Date(currentYear, currentMonth + futureMonthsOffset + 1, 0);

    const formatISO = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return {
      startDateStr: formatISO(start),
      endDateStr: formatISO(end),
    };
  }, [pastMonthsOffset, futureMonthsOffset]);

  const {
    data: upcomingData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useUpcomingEpisodes(startDateStr, endDateStr);

  // Listone continuo di episodi ordinati cronologicamente; per la stessa data in ordine alfabetico
  const allEpisodes = useMemo(() => {
    if (!upcomingData || upcomingData.length === 0) return [];

    return [...upcomingData].sort((a, b) => {
      const dateA = (a.air_date || '').substring(0, 10);
      const dateB = (b.air_date || '').substring(0, 10);
      const dateCmp = dateA.localeCompare(dateB);
      if (dateCmp !== 0) return dateCmp;

      const titleCmp = (a.series_title || '').localeCompare(b.series_title || '');
      if (titleCmp !== 0) return titleCmp;
      if (a.season_number !== b.season_number) return a.season_number - b.season_number;
      return a.episode_number - b.episode_number;
    });
  }, [upcomingData]);

  // Identifica l'episodio su cui posizionare la vista all'apertura:
  // 1. Il primo episodio di oggi
  // 2. Se non c'è, il prossimo episodio in uscita (primo nel futuro)
  // 3. Se tutte le uscite sono passate, l'episodio più recente
  const todayAnchorId = useMemo(() => {
    if (allEpisodes.length === 0) return null;

    // 1. Episodio che esce oggi
    const todayEp = allEpisodes.find((ep) => getCleanDate(ep.air_date) === todayStr);
    if (todayEp) return todayEp.episode_id;

    // 2. Prossimo episodio futuro (primo nel futuro)
    const nextEp = allEpisodes.find((ep) => getCleanDate(ep.air_date) > todayStr);
    if (nextEp) return nextEp.episode_id;

    // 3. Fallback: episodio più recente del passato
    return allEpisodes[allEpisodes.length - 1].episode_id;
  }, [allEpisodes, todayStr, getCleanDate]);

  // Controllo automatico per garantire che la pagina sia riempita da episodi futuri
  // Se ci sono pochi episodi futuri (meno di 7), estende la ricerca fino a 12 mesi
  useEffect(() => {
    if (isLoading || isFetching) return;
    if (allEpisodes.length === 0) return;
    if (hasReachedEndOfFuture.current) return;

    const anchorIndex = allEpisodes.findIndex((ep) => ep.episode_id === todayAnchorId);
    const futureCount = anchorIndex >= 0 ? allEpisodes.length - anchorIndex : 0;

    // Se ci sono meno di 7 episodi futuri (non riempiono la vista), espandi fino a 12 mesi
    if (futureCount < 7 && futureMonthsOffset < 12) {
      prevEpisodeCountRef.current = allEpisodes.length;
      isFetchingLaterRef.current = true;
      setIsFetchingLater(true);
      setFutureMonthsOffset((prev) => prev + 3);
    }
  }, [isLoading, isFetching, allEpisodes, todayAnchorId, futureMonthsOffset]);

  // Posizionamento iniziale accurato su "Oggi" o sul "Prossimo Episodio"
  useEffect(() => {
    if (!isLoading && allEpisodes.length > 0 && !hasScrolledToToday.current) {
      const performAlignment = () => {
        if (userHasScrolledManually.current) return;
        const container = scrollContainerRef.current;
        const target = todayAnchorRef.current;
        if (container && target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          // Calcolo esatto dei pixel relativi rispetto all'area visibile del contenitore (-4px per pt-1)
          const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 4;
          container.scrollTop = Math.max(0, scrollOffset);
          hasScrolledToToday.current = true;

          // Calcola il padding inferiore ottimale per evitare vuoto eccessivo ma garantire lo scroll
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

      // Sequenza di allineamento affidabile (immediato + frame successivo + timeout 80ms)
      performAlignment();
      const raf = requestAnimationFrame(performAlignment);
      const timer = setTimeout(performAlignment, 80);

      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [isLoading, allEpisodes]);

  // Gestione dell'arrivo di nuovi dati: riposizionamento scroll o rilevamento fine storico/futuro
  useEffect(() => {
    if (!upcomingData) return;

    if (isFetchingEarlierRef.current) {
      if (upcomingData.length <= prevEpisodeCountRef.current) {
        hasReachedStartOfHistory.current = true;
      } else if (topEpisodeIdRef.current) {
        const el = document.getElementById(`ep-${topEpisodeIdRef.current}`);
        if (el && scrollContainerRef.current) {
          el.scrollIntoView({ block: 'start' });
        }
      }
      isFetchingEarlierRef.current = false;
      setIsFetchingEarlier(false);
    }

    if (isFetchingLaterRef.current) {
      if (upcomingData.length <= prevEpisodeCountRef.current) {
        hasReachedEndOfFuture.current = true;
      }
      isFetchingLaterRef.current = false;
      setIsFetchingLater(false);
    }
  }, [upcomingData]);

  // Gestione dello scroll per infinite scroll e tasto "Torna ad oggi / prossimo"
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

      // Se la distanza dal bordo superiore supera i 40px, mostra il pulsante
      const isDistant = Math.abs(diff) > 40;
      setShowBackToToday(isDistant);
      // diff > 40: l'ancora è in basso (utente scrollato verso l'alto/passato) -> freccia verso il basso
      // diff < -40: l'ancora è in alto (utente scrollato verso il basso/futuro) -> freccia verso l'alto
      setIsTodayAnchorBelow(diff > 40);
    }

    // Non attivare il caricamento dinamico se l'ancoraggio iniziale non è ancora completato
    if (!hasScrolledToToday.current) return;

    // Scroll verso la cima: attiva SOLO quando l'utente raggiunge fisicamente il margine superiore (scrollTop <= 15)
    if (
      scrollTop <= 15 &&
      !isFetchingEarlierRef.current &&
      !hasReachedStartOfHistory.current &&
      !isFetching
    ) {
      isFetchingEarlierRef.current = true;
      setIsFetchingEarlier(true);
      if (allEpisodes.length > 0) {
        topEpisodeIdRef.current = allEpisodes[0].episode_id;
      }
      prevEpisodeCountRef.current = allEpisodes.length;
      setPastMonthsOffset((prev) => prev + 2);
    }

    // Scroll verso il fondo: attiva se si raggiunge l'ultima card
    if (
      scrollHeight - scrollTop - clientHeight <= (bottomPadding + 60) &&
      !isFetchingLaterRef.current &&
      !hasReachedEndOfFuture.current &&
      !isFetching
    ) {
      isFetchingLaterRef.current = true;
      setIsFetchingLater(true);
      prevEpisodeCountRef.current = allEpisodes.length;
      setFutureMonthsOffset((prev) => prev + 3);
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
      // Aggiornamento ottimistico della cache per un feedback visivo istantaneo al tap
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
            queryClient.invalidateQueries({ queryKey: ['trackers', 'upcoming'] });
          },
        }
      );
    },
    [queryClient, toggleEpisodeWatched]
  );

  if (isError && allEpisodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <EmptyState
          icon={<TvIcon className="w-10 h-10 opacity-30 text-gray-500" />}
          message="Impossibile caricare le uscite degli episodi."
        />
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!isLoading && allEpisodes.length === 0) {
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
        {/* CARICAMENTO IN CIMA (SOPRA TUTTE LE CARD PER IL PASSATO O ALL'AVVIO) */}
        {(isFetchingEarlier || (isLoading && allEpisodes.length === 0)) && (
          <TimelineLoadingCard />
        )}

        {/* LISTONE CARD SENZA TITOLI O RIQUADRI INTERMEDI */}
        {allEpisodes.map((ep) => {
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
