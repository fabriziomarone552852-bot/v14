import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import type { MediaCreditPerson } from '@/types/people';

export type TrackerModalSurface = 'mobile' | 'desktop';
export type PersonCreditFilterTab = 'all' | 'movies' | 'tv';

export interface PersonModalUiSnapshot {
  creditSearch: string;
  isMoviesCollapsed: boolean;
  isTvCollapsed: boolean;
  activeTab: PersonCreditFilterTab;
  scrollTop: number;
}

export type TrackerModalStackEntry =
  | {
      uid: string;
      surface: TrackerModalSurface;
      type: 'person';
      person: MediaCreditPerson;
      uiState?: Partial<PersonModalUiSnapshot>;
    }
  | {
      uid: string;
      surface: TrackerModalSurface;
      type: 'movie';
      tmdbId: number;
    }
  | {
      uid: string;
      surface: TrackerModalSurface;
      type: 'series';
      tmdbId: number;
    };

export interface TrackerModalStackContextValue {
  stack: TrackerModalStackEntry[];
  pushPerson: (person: MediaCreditPerson, surface?: TrackerModalSurface) => void;
  pushMovie: (tmdbId: number, surface?: TrackerModalSurface) => void;
  pushSeries: (tmdbId: number, surface?: TrackerModalSurface) => void;
  updateTopPersonUiState: (patch: Partial<PersonModalUiSnapshot>) => void;
  pop: () => void;
  clearStack: () => void;
}

const TrackerModalStackContext = createContext<TrackerModalStackContextValue | null>(null);

export const TrackerModalStackProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [stack, setStack] = useState<TrackerModalStackEntry[]>([]);
  const uidCounterRef = useRef(0);
  const location = useLocation();
  const prevPathnameRef = useRef(location.pathname);

  const nextUid = useCallback((prefix: string): string => {
    uidCounterRef.current += 1;
    return `${prefix}-${uidCounterRef.current}`;
  }, []);

  // Se l'utente cambia effettivamente pagina (es. barra di navigazione o deep link), svuota lo stack
  useEffect(() => {
    if (prevPathnameRef.current !== location.pathname) {
      prevPathnameRef.current = location.pathname;
      setStack([]);
    }
  }, [location.pathname]);

  const pushPerson = useCallback(
    (person: MediaCreditPerson, surface?: TrackerModalSurface) => {
      setStack((prev) => {
        const top = prev[prev.length - 1];
        if (top && top.type === 'person' && top.person.id === person.id) {
          return prev;
        }
        const resolvedSurface: TrackerModalSurface = surface ?? top?.surface ?? 'desktop';
        return [
          ...prev,
          {
            uid: nextUid(`person-${person.id}`),
            surface: resolvedSurface,
            type: 'person',
            person,
          },
        ];
      });
    },
    [nextUid]
  );

  const pushMovie = useCallback(
    (tmdbId: number, surface?: TrackerModalSurface) => {
      if (!tmdbId) return;
      setStack((prev) => {
        const top = prev[prev.length - 1];
        if (top && top.type === 'movie' && top.tmdbId === tmdbId) {
          return prev;
        }
        const resolvedSurface: TrackerModalSurface = surface ?? top?.surface ?? 'desktop';
        return [
          ...prev,
          {
            uid: nextUid(`movie-${tmdbId}`),
            surface: resolvedSurface,
            type: 'movie',
            tmdbId,
          },
        ];
      });
    },
    [nextUid]
  );

  const pushSeries = useCallback(
    (tmdbId: number, surface?: TrackerModalSurface) => {
      if (!tmdbId) return;
      setStack((prev) => {
        const top = prev[prev.length - 1];
        if (top && top.type === 'series' && top.tmdbId === tmdbId) {
          return prev;
        }
        const resolvedSurface: TrackerModalSurface = surface ?? top?.surface ?? 'desktop';
        return [
          ...prev,
          {
            uid: nextUid(`series-${tmdbId}`),
            surface: resolvedSurface,
            type: 'series',
            tmdbId,
          },
        ];
      });
    },
    [nextUid]
  );

  const updateTopPersonUiState = useCallback((patch: Partial<PersonModalUiSnapshot>) => {
    setStack((prev) => {
      if (prev.length === 0) return prev;
      const lastIndex = prev.length - 1;
      const top = prev[lastIndex];
      if (top.type !== 'person') return prev;
      const updated: TrackerModalStackEntry = {
        ...top,
        uiState: {
          ...top.uiState,
          ...patch,
        },
      };
      return [...prev.slice(0, lastIndex), updated];
    });
  }, []);

  const pop = useCallback(() => {
    setStack((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
  }, []);

  const clearStack = useCallback(() => {
    setStack([]);
  }, []);

  const value = useMemo<TrackerModalStackContextValue>(
    () => ({
      stack,
      pushPerson,
      pushMovie,
      pushSeries,
      updateTopPersonUiState,
      pop,
      clearStack,
    }),
    [stack, pushPerson, pushMovie, pushSeries, updateTopPersonUiState, pop, clearStack]
  );

  return (
    <TrackerModalStackContext.Provider value={value}>
      {children}
    </TrackerModalStackContext.Provider>
  );
};

export function useTrackerModalStack(): TrackerModalStackContextValue {
  const ctx = useContext(TrackerModalStackContext);
  if (!ctx) {
    throw new Error('useTrackerModalStack deve essere usato dentro TrackerModalStackProvider');
  }
  return ctx;
}
