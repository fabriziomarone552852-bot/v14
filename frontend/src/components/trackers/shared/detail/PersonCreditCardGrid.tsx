import React from 'react';
import { CheckCircle2, Film, Tv } from 'lucide-react';
import type { PersonCreditMovieItem, PersonCreditSeriesItem } from '@/types/people';
import type { Movie } from '@/types/movies';
import type { TVSeries } from '@/types/trackers';

type CreditGridVariant = 'movie' | 'tv';

interface BaseNormalizedCredit {
  id: number;
  title: string;
  year: string | null;
  posterPath?: string | null;
  voteAverage?: number | null;
  roles: string[];
  trackedBadge?: {
    label: string;
    isCompleted: boolean;
  } | null;
}

export interface PersonCreditCardGridProps {
  variant: CreditGridVariant;
  movieCredits?: PersonCreditMovieItem[];
  tvCredits?: PersonCreditSeriesItem[];
  trackedMoviesByTmdb?: Map<number, Movie>;
  trackedSeriesByTmdb?: Map<number, TVSeries>;
  onSelect: (tmdbId: number) => void;
}

/**
 * Griglia condivisa dei crediti cinematografici o televisivi nella scheda persona.
 */
export const PersonCreditCardGrid: React.FC<PersonCreditCardGridProps> = ({
  variant,
  movieCredits = [],
  tvCredits = [],
  trackedMoviesByTmdb,
  trackedSeriesByTmdb,
  onSelect,
}) => {
  const isMovie = variant === 'movie';

  const items: BaseNormalizedCredit[] = isMovie
    ? movieCredits.map((item) => {
        const tracked = trackedMoviesByTmdb?.get(item.id);
        return {
          id: item.id,
          title: item.title,
          year: item.release_date ? item.release_date.slice(0, 4) : null,
          posterPath: item.poster_path,
          voteAverage: item.vote_average,
          roles: item.roles,
          trackedBadge: tracked
            ? {
                label: tracked.status === 'watched' ? 'Visto' : 'In lista',
                isCompleted: tracked.status === 'watched',
              }
            : null,
        };
      })
    : tvCredits.map((item) => {
        const tracked = trackedSeriesByTmdb?.get(item.id);
        const isCompleted = tracked?.status === 'watched' || tracked?.status === 'completed';
        return {
          id: item.id,
          title: item.name,
          year: item.first_air_date ? item.first_air_date.slice(0, 4) : null,
          posterPath: item.poster_path,
          voteAverage: item.vote_average,
          roles: item.roles,
          trackedBadge: tracked
            ? {
                label: isCompleted ? 'Completata' : 'In lista',
                isCompleted,
              }
            : null,
        };
      });

  const HeaderIcon = isMovie ? Film : Tv;
  const headerAccent = isMovie ? 'text-blue-600' : 'text-indigo-600';
  const hoverBorder = isMovie ? 'hover:border-blue-400' : 'hover:border-indigo-400';
  const hoverText = isMovie ? 'group-hover:text-blue-600' : 'group-hover:text-indigo-600';

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-700">
        <HeaderIcon className={`w-3.5 h-3.5 ${headerAccent}`} />
        <span>{isMovie ? 'Film' : 'Serie TV'}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-gray-400 italic py-2">
          {isMovie
            ? 'Nessun film trovato per questa persona.'
            : 'Nessuna serie TV trovata per questa persona.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {items.map((item) => (
            <button
              key={`${variant}-${item.id}`}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`text-left p-2.5 rounded-xl bg-white border border-gray-200/90 ${hoverBorder} hover:shadow-sm transition-all flex items-center gap-3 cursor-pointer group active:scale-[0.99]`}
            >
              <div className="w-11 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0 flex items-center justify-center">
                {item.posterPath ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w185${item.posterPath}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <HeaderIcon className="w-4 h-4 text-gray-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-extrabold text-gray-900 ${hoverText} truncate`}>
                    {item.title}
                  </span>
                  {item.year && (
                    <span className="text-[11px] font-semibold text-gray-400 shrink-0">
                      ({item.year})
                    </span>
                  )}
                </div>

                {item.roles.length > 0 && (
                  <p className="text-[11px] text-gray-600 truncate mt-0.5">
                    {item.roles.join(' · ')}
                  </p>
                )}

                <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                  {item.trackedBadge && (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        item.trackedBadge.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isMovie
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{item.trackedBadge.label}</span>
                    </span>
                  )}
                  {typeof item.voteAverage === 'number' && item.voteAverage > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                      ★ {item.voteAverage.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};
