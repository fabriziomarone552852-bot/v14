import React, { useMemo } from 'react';
import type { TVSeries } from '@/types/trackers';
import { MediaCard } from './MediaCard';
import { normalizeMediaStatus } from '@/utils/mediaStatusTheme';

export interface TVSeriesCatalogSectionsProps {
  series: TVSeries[];
  openSeriesDetail: (series: TVSeries) => void;
}

interface CatalogSection {
  id: string;
  items: TVSeries[];
}

export const TVSeriesCatalogSections: React.FC<TVSeriesCatalogSectionsProps> = ({
  series,
  openSeriesDetail,
}) => {
  // Suddivisione rigorosa delle serie nelle macro-aree canoniche:
  // 1. In visione
  // 2. In lista
  // 3. In attesa
  // 4. Completate
  // 5. Abbandonate (in coda dopo i completati, senza pillola)
  const sections: CatalogSection[] = useMemo(() => {
    const inVisione: TVSeries[] = [];
    const inLista: TVSeries[] = [];
    const inAttesa: TVSeries[] = [];
    const completate: TVSeries[] = [];
    const abbandonate: TVSeries[] = [];

    series.forEach((item) => {
      const st = normalizeMediaStatus(item.status, item.tmdb_status);
      if (st === 'dropped') {
        abbandonate.push(item);
      } else if (st === 'watching') {
        inVisione.push(item);
      } else if (st === 'waiting') {
        inAttesa.push(item);
      } else if (st === 'completed') {
        completate.push(item);
      } else {
        // 'to_watch', 'on_hold', 'untracked' confluiscono in lista
        inLista.push(item);
      }
    });

    return [
      { id: 'in_visione', items: inVisione },
      { id: 'in_lista', items: inLista },
      { id: 'in_attesa', items: inAttesa },
      { id: 'completate', items: completate },
      { id: 'abbandonate', items: abbandonate },
    ];
  }, [series]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      {sections.map((sec) => {
        if (sec.items.length === 0) return null;

        return (
          <div
            key={sec.id}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-6 content-start"
          >
            {sec.items.map((s) => (
              <MediaCard
                key={s.id || s.tmdb_id}
                title={s.title}
                posterPath={s.poster_path}
                customPosterPath={s.custom_poster_path}
                status={s.status}
                externalStatus={s.tmdb_status}
                onClick={() => openSeriesDetail(s)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default TVSeriesCatalogSections;
