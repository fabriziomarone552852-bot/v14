import React from 'react';
import { Calendar, ChevronDown, MapPin, User, X } from 'lucide-react';

export interface PersonDetailHeaderProps {
  displayName: string;
  profilePath?: string | null;
  birthDateLabel?: string | null;
  placeOfBirth?: string | null;
  biography?: string | null;
  canExpandBio: boolean;
  bioExpanded: boolean;
  onExpandBio: () => void;
  onClose: () => void;
  /** Rispetta l'area di sicurezza superiore (notch / status bar) su mobile full-screen. */
  respectSafeAreaTop?: boolean;
}

/**
 * Testata scura condivisa per la scheda Attore/Regista (Desktop e Mobile):
 * ritratto, nome, dati anagrafici, anteprima biografia con pulsante "Espandi" e chiusura "X".
 */
export const PersonDetailHeader: React.FC<PersonDetailHeaderProps> = ({
  displayName,
  profilePath,
  birthDateLabel,
  placeOfBirth,
  biography,
  canExpandBio,
  bioExpanded,
  onExpandBio,
  onClose,
  respectSafeAreaTop = false,
}) => (
  <div
    className={`shrink-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white relative z-10 ${
      respectSafeAreaTop ? 'pt-[env(safe-area-inset-top,0px)]' : ''
    }`}
  >
    <div className="p-4 sm:p-5 flex items-start gap-4 relative">
      <div className="w-20 h-24 sm:w-24 sm:h-32 rounded-2xl overflow-hidden bg-slate-700/70 border border-white/15 shadow-lg shrink-0 flex items-center justify-center">
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

      <div className="flex-1 min-w-0 pr-8">
        <h2 className="text-lg sm:text-2xl font-extrabold leading-tight truncate">
          {displayName}
        </h2>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
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

        {biography && (
          <div className="mt-2.5 text-xs text-slate-200/90 leading-relaxed">
            <p className="line-clamp-3">{biography}</p>
            {canExpandBio && (
              <button
                type="button"
                onClick={onExpandBio}
                className={`mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-blue-200 cursor-pointer transition-opacity ${
                  bioExpanded ? 'opacity-0 pointer-events-none' : ''
                }`}
              >
                <span>Espandi</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0 active:scale-90"
        aria-label="Chiudi scheda persona"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);
