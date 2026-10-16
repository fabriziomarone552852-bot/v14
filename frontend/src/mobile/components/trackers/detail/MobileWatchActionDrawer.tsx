// src/mobile/components/trackers/detail/MobileWatchActionDrawer.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, Minus, Plus, X } from 'lucide-react';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileWatchActionTarget {
  type: 'episode' | 'season';
  id: number;
  title: string;
  seasonNumber?: number;
  episodeNumber?: number;
  watchCount: number;
}

export interface MobileWatchActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  target: MobileWatchActionTarget | null;
  onAddWatch: () => void;
  onResetWatch: () => void;
  onSubWatch: () => void;
}

export const MobileWatchActionDrawer: React.FC<MobileWatchActionDrawerProps> = ({
  isOpen,
  onClose,
  target,
  onAddWatch,
  onResetWatch,
  onSubWatch,
}) => {
  // Gestione tasto Back Android
  useBackHandler(
    isOpen,
    () => {
      onClose();
      return true;
    },
    25
  );

  if (!isOpen || !target) return null;

  const isEpisode = target.type === 'episode';
  const hasMultipleWatches = target.watchCount > 1;

  const content = (
    <div
      className="fixed inset-0 z-[10070] bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-fadeIn select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl px-5 pt-3 pb-[max(env(safe-area-inset-bottom,0px),20px)] shadow-2xl flex flex-col gap-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pillola di trascinamento */}
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto shrink-0 mb-1" />

        {/* Intestazione Drawer */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-600">
              {isEpisode
                ? `${target.seasonNumber === 0 ? 'Episodi Speciali' : `Stagione ${target.seasonNumber}`} • Episodio ${target.episodeNumber}`
                : target.seasonNumber === 0
                ? 'Episodi Speciali'
                : `Stagione ${target.seasonNumber}`}
            </span>
            <h3 className="text-base font-extrabold text-gray-900 leading-snug truncate">
              {target.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80">
                <Eye className="w-3 h-3 text-blue-600" />
                <span>
                  {target.watchCount === 1
                    ? 'Visto 1 volta'
                    : `Visto ${target.watchCount} volte`}
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center shrink-0 active:scale-95 transition-all cursor-pointer"
            aria-label="Chiudi menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista Azioni (dall'alto verso il basso come richiesto) */}
        <div className="flex flex-col gap-2.5">
          {/* 1. AGGIUNGI UNA VISIONE */}
          <button
            type="button"
            onClick={() => {
              onAddWatch();
              onClose();
            }}
            className="w-full h-12 px-4 rounded-2xl bg-blue-50/80 hover:bg-blue-100 active:scale-98 border border-blue-200/80 text-blue-700 font-bold text-sm flex items-center justify-between shadow-2xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-gray-900 font-bold">
                {isEpisode ? 'Aggiungi una visione' : 'Aggiungi visione a tutti'}
              </span>
            </div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider">
              +1
            </span>
          </button>

          {/* 2. SEGNA COME NON VISTO */}
          <button
            type="button"
            onClick={() => {
              onResetWatch();
              onClose();
            }}
            className="w-full h-12 px-4 rounded-2xl bg-rose-50/70 hover:bg-rose-100 active:scale-98 border border-rose-200/80 text-rose-700 font-bold text-sm flex items-center justify-between shadow-2xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                <EyeOff className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-gray-900 font-bold">
                {isEpisode ? 'Segna come non visto' : 'Segna stagione come non vista'}
              </span>
            </div>
            <span className="text-xs font-bold text-rose-600">
              Azzera
            </span>
          </button>

          {/* 3. TOGLI UNA VISIONE (Compare solo se visto più di una volta) */}
          {hasMultipleWatches && (
            <button
              type="button"
              onClick={() => {
                onSubWatch();
                onClose();
              }}
              className="w-full h-12 px-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100 active:scale-98 border border-amber-200/80 text-amber-800 font-bold text-sm flex items-center justify-between shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Minus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-gray-900 font-bold">
                  {isEpisode ? 'Togli una visione' : 'Togli una visione a tutti'}
                </span>
              </div>
              <span className="text-xs font-black text-amber-700 uppercase tracking-wider">
                -1
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileWatchActionDrawer;
