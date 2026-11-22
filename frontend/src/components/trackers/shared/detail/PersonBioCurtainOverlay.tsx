import React from 'react';
import { Calendar, ChevronUp, MapPin, User, X } from 'lucide-react';
import { useFadeScrollbar } from '@/hooks/ui/useFadeScrollbar';

export interface PersonBioCurtainOverlayProps {
  displayName: string;
  profilePath?: string | null;
  birthDateLabel?: string | null;
  placeOfBirth?: string | null;
  biography: string;
  onReduce: () => void;
  onCloseModal: () => void;
  /** Su mobile mostra solo la freccia verso l'alto senza la scritta "Riduci". */
  iconOnlyReduce?: boolean;
  /** Rispetta il padding superiore di sicurezza (notch / status bar su smartphone). */
  respectSafeAreaTop?: boolean;
}

/**
 * Espande la testata della scheda persona in una tendina in overlay sopra tabs e filmografia,
 * continuando direttamente dalla biografia superiore senza duplicazioni.
 */
export const PersonBioCurtainOverlay: React.FC<PersonBioCurtainOverlayProps> = ({
  displayName,
  profilePath,
  birthDateLabel,
  placeOfBirth,
  biography,
  onReduce,
  onCloseModal,
  iconOnlyReduce = false,
  respectSafeAreaTop = false,
}) => {
  const { handleScroll, scrollbarClass } = useFadeScrollbar(800);

  return (
    <>
      <div
        className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-[1px] animate-fadeIn"
        onClick={onReduce}
      />
      <div
        className={`absolute inset-x-0 top-0 z-30 max-h-[88%] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white shadow-2xl border-b border-white/15 sm:rounded-t-2xl rounded-b-2xl flex flex-col animate-fadeIn ${
          respectSafeAreaTop ? 'pt-[env(safe-area-inset-top,0px)]' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 flex items-stretch gap-4 flex-1 min-h-0 relative">
          <div className="self-start w-20 h-24 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-slate-700/70 border border-white/15 shadow-lg shrink-0 flex items-center justify-center">
            {profilePath ? (
              <img
                src={`https://image.tmdb.org/t/p/w300${profilePath}`}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9 text-slate-400" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-8 flex flex-col min-h-0">
            <h2 className="shrink-0 text-lg sm:text-2xl font-extrabold leading-tight truncate">
              {displayName}
            </h2>

            {(birthDateLabel || placeOfBirth) && (
              <div className="shrink-0 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                {birthDateLabel && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{birthDateLabel}</span>
                  </span>
                )}
                {placeOfBirth && (
                  <span className="inline-flex items-center gap-1 truncate max-w-full">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{placeOfBirth}</span>
                  </span>
                )}
              </div>
            )}

            <div
              onScroll={handleScroll}
              className={`mt-2.5 flex-1 min-h-0 overflow-y-auto pr-1 text-xs sm:text-[13px] text-slate-200/95 leading-relaxed whitespace-pre-line select-text ${scrollbarClass}`}
            >
              {biography}
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseModal}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Chiudi scheda persona"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="shrink-0 border-t border-white/10 bg-slate-950/35 rounded-b-2xl">
          {iconOnlyReduce ? (
            <button
              type="button"
              onClick={onReduce}
              className="w-full py-2 flex items-center justify-center text-blue-300 hover:text-blue-200 active:bg-white/10 transition-colors cursor-pointer rounded-b-2xl"
              aria-label="Riduci biografia"
              title="Riduci biografia"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          ) : (
            <div className="px-5 py-2.5 flex justify-end">
              <button
                type="button"
                onClick={onReduce}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-blue-200 cursor-pointer"
              >
                <span>Riduci</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
