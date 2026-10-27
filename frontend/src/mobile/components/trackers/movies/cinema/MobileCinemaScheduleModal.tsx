// src/mobile/components/trackers/movies/cinema/MobileCinemaScheduleModal.tsx
import React from 'react';
import { SelectModalDialog } from '@/components/shared/form/SelectModalDialog';
import { useCinemaSchedule } from '@/hooks/queries/useCinemaQueries';
import type { CinemaSummary } from '@/types/cinema';
import type { MovieDetailTarget } from '@/types/movies';
import { FilmIcon } from '@/components/shared/utils/Icons';

export interface MobileCinemaScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  provinceSlug: string;
  cinema: CinemaSummary | null;
  onOpenMovieDetail?: (movie: MovieDetailTarget) => void;
}

export const MobileCinemaScheduleModal: React.FC<MobileCinemaScheduleModalProps> = ({
  isOpen,
  onClose,
  provinceSlug,
  cinema,
  onOpenMovieDetail,
}) => {
  const { data: schedule, isLoading } = useCinemaSchedule(
    provinceSlug,
    cinema?.slug || '',
    cinema?.id || '',
    isOpen && Boolean(cinema?.slug && cinema?.id)
  );

  if (!cinema) return null;

  const handleOpenMaps = () => {
    const query = encodeURIComponent(
      `${schedule?.cinema_name || cinema.name} ${schedule?.address || ''}`.trim()
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <SelectModalDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Programmazione Cinema"
      maxWidthClass="max-w-md"
      zIndex={10040}
    >
      <div className="space-y-4 py-1 text-left">
        {/* Intestazione Cinema & Contatti */}
        <div className="bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 space-y-2.5">
          <div>
            <h4 className="font-extrabold text-sm text-gray-900 leading-snug">
              {schedule?.cinema_name || cinema.name}
            </h4>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              {schedule?.address || cinema.city}
            </p>
          </div>

          {/* Bottoni Rapidi (Chiama / Email / Mappe) */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {schedule?.phone && (
              <a
                href={`tel:${schedule.phone.replace(/\s+/g, '')}`}
                className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>📞 Chiama ({schedule.phone})</span>
              </a>
            )}

            {schedule?.email && (
              <a
                href={`mailto:${schedule.email}`}
                className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>✉️ Email</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleOpenMaps}
              className="text-[10px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>📍 Mappe ↗</span>
            </button>
          </div>
        </div>

        {/* Intestazione Sezione Film Oggi */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-1">
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wide">
            Film in Programmazione Oggi ({schedule?.movies.length || 0})
          </span>
        </div>

        {/* Elenco Film del Cinema */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-0.5">
          {isLoading ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Caricamento programmazione in corso...
            </div>
          ) : !schedule || schedule.movies.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Nessun film in programmazione trovato per oggi.
            </div>
          ) : (
            schedule.movies.map((m, idx) => (
              <div
                key={m.idf || idx}
                className="p-3 rounded-2xl bg-white border border-gray-200/90 shadow-2xs flex gap-3 items-start"
              >
                {/* Locandina */}
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-2xs">
                  {m.poster ? (
                    <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FilmIcon className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Dati film e orari */}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h5 className="font-extrabold text-xs text-gray-900 leading-snug">
                      {m.title}
                    </h5>
                    {m.genre && (
                      <p className="text-[10px] text-gray-500 font-medium">
                        {m.genre} {m.duration ? `• ${m.duration}` : ''}
                      </p>
                    )}
                  </div>

                  {m.sala && (
                    <div className="text-[10px] text-gray-500 font-semibold">{m.sala}</div>
                  )}

                  {/* Orari */}
                  <div className="flex flex-wrap gap-1.5">
                    {m.showtimes.length > 0 ? (
                      m.showtimes.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-blue-600 text-white shadow-2xs"
                        >
                          {t}
                        </span>
                      ))
                    ) : m.orari ? (
                      <span className="text-[10px] text-gray-600 font-medium">{m.orari}</span>
                    ) : null}
                  </div>

                  {/* Tasti azione */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {m.ticket_url && (
                      <a
                        href={m.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-extrabold text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors"
                      >
                        Biglietti ↗
                      </a>
                    )}

                    {onOpenMovieDetail && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenMovieDetail({
                            tmdb_id: m.tmdb_id || undefined,
                            title: m.title,
                            poster_path: m.poster ? m.poster : undefined,
                          });
                          onClose();
                        }}
                        className="text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        Dettaglio Film
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </SelectModalDialog>
  );
};
