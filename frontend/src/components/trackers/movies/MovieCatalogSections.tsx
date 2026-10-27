import React, { useMemo } from 'react';
import type { Movie, MovieDetailTarget } from '@/types/movies';
import { MediaCard } from '@/components/trackers/MediaCard';

export interface MovieCatalogSectionsProps {
  movies: Movie[];
  openMovieDetail: (movie: MovieDetailTarget) => void;
}

interface CatalogSection {
  id: string;
  items: Movie[];
}

export const MovieCatalogSections: React.FC<MovieCatalogSectionsProps> = ({
  movies,
  openMovieDetail,
}) => {
  // Suddivisione dei film nelle macro-aree canoniche (In lista e Guardati), speculare alle Serie TV
  const sections: CatalogSection[] = useMemo(() => {
    const inLista: Movie[] = [];
    const guardati: Movie[] = [];

    movies.forEach((m) => {
      if (m.status === 'watched') {
        guardati.push(m);
      } else {
        inLista.push(m);
      }
    });

    return [
      { id: 'in_lista', items: inLista },
      { id: 'guardati', items: guardati },
    ];
  }, [movies]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {sections.map((sec) => {
        if (sec.items.length === 0) return null;

        return (
          <div
            key={sec.id}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 content-start"
          >
            {sec.items.map((m) => (
              <MediaCard
                key={m.id || m.tmdb_id}
                title={m.title}
                posterPath={m.poster_path}
                customPosterPath={m.custom_poster_path}
                status={m.status}
                externalStatus="Movie"
                onClick={() => openMovieDetail(m)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default MovieCatalogSections;
