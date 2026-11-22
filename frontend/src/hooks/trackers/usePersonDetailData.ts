import { useMemo, useState } from 'react';
import type {
  MediaCreditPerson,
  PersonCreditMovieItem,
  PersonCreditSeriesItem,
  PersonDetailResponse,
} from '@/types/people';
import type { Movie } from '@/types/movies';
import type { TVSeries } from '@/types/trackers';
import { usePersonDetail } from '@/hooks/queries/usePeopleQueries';
import { useMyMovies } from '@/hooks/queries/useMovieQueries';
import { useMySeries } from '@/hooks/queries/useTrackersQueries';

export const formatPersonBirthDate = (isoDate?: string | null): string | null => {
  if (!isoDate) return null;
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export interface UsePersonDetailDataResult {
  detail: PersonDetailResponse | null | undefined;
  isLoading: boolean;
  isError: boolean;
  creditSearch: string;
  setCreditSearch: (value: string) => void;
  movieCredits: PersonCreditMovieItem[];
  tvCredits: PersonCreditSeriesItem[];
  trackedMoviesByTmdb: Map<number, Movie>;
  trackedSeriesByTmdb: Map<number, TVSeries>;
  displayName: string;
  profilePath: string | null | undefined;
  birthDateLabel: string | null;
  totalCreditsCount: number;
  canExpandBio: boolean;
}

/**
 * Hook condiviso per recuperare i dettagli TMDB di un attore/regista,
 * incrociare i crediti con la libreria locale in RAM e applicare il filtro testuale.
 */
export function usePersonDetailData(
  person: MediaCreditPerson,
  initialSearch = ''
): UsePersonDetailDataResult {
  const [creditSearch, setCreditSearch] = useState(initialSearch);

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
  const birthDateLabel = formatPersonBirthDate(detail?.birthday);
  const totalCreditsCount =
    (detail?.movie_credits?.length ?? 0) + (detail?.tv_credits?.length ?? 0);
  const canExpandBio = Boolean(detail?.biography && detail.biography.length > 180);

  return {
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
  };
}
