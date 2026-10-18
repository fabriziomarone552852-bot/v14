// src/mobile/components/trackers/MobileSeriesPersonalListsModal.tsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { MediaList, TVSeries } from '@/types/trackers';
import { CloseIcon, PlusIcon, TvIcon } from '@/components/shared/utils/Icons';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { resolveImageUrl } from '@/utils/imageUtils';
import { useBackHandler } from '@/utils/backButtonManager';

export interface MobileSeriesPersonalListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  myLists: MediaList[];
  series: TVSeries[];
  onOpenSeriesDetail: (series: TVSeries | Partial<TVSeries>) => void;
  onOpenListManager: () => void;
  initialSelectedList?: MediaList | null;
}

export const MobileSeriesPersonalListsModal: React.FC<MobileSeriesPersonalListsModalProps> = ({
  isOpen,
  onClose,
  myLists,
  series,
  onOpenSeriesDetail,
  onOpenListManager,
  initialSelectedList,
}) => {
  const [selectedList, setSelectedList] = useState<MediaList | null>(initialSelectedList || null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedList(initialSelectedList || null);
    }
  }, [isOpen, initialSelectedList]);

  useBackHandler(
    isOpen,
    () => {
      if (selectedList) {
        setSelectedList(null);
        return true;
      }
      onClose();
      return true;
    },
    25
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10025] bg-gray-50 flex flex-col h-[100dvh] w-full overflow-hidden pointer-events-auto animate-fadeIn select-none">
      {/* HEADER SUPERIORE */}
      <div className="shrink-0 bg-white border-b border-gray-200/90 px-4 pt-3 pb-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          {selectedList && (
            <button
              type="button"
              onClick={() => setSelectedList(null)}
              className="w-8 h-8 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer active:scale-90"
              aria-label="Torna alle liste"
            >
              <span className="font-bold text-sm">←</span>
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <span className="text-base leading-none">📁</span>
          </div>

          <div>
            <h2 className="text-sm font-black text-gray-900 leading-tight">
              {selectedList ? selectedList.name : 'Liste Personali'}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {selectedList
                ? `${selectedList.items?.length || 0} serie salvate`
                : `${myLists.length} ${myLists.length === 1 ? 'raccolta creata' : 'raccolte create'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!selectedList && (
            <button
              type="button"
              onClick={onOpenListManager}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shadow-2xs border border-indigo-200/70"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Nuova</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors active:scale-90 cursor-pointer"
            aria-label="Chiudi modale liste"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CONTENUTO SCROLLABILE */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        {selectedList ? (
          /* VISTA DETTAGLIO LISTA SELEZIONATA */
          <div>
            {!selectedList.items || selectedList.items.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <EmptyState message="Nessuna serie salvata in questa lista." />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedList.items.map((item) => {
                  const existing = series.find((s) => s.tmdb_id === item.series_tmdb_id);
                  const title = existing?.title || item.series?.title || 'Serie TV';
                  const poster = existing?.custom_poster_path
                    ? resolveImageUrl(existing.custom_poster_path)
                    : existing?.poster_path
                    ? `https://image.tmdb.org/t/p/w200${existing.poster_path}`
                    : item.series?.poster_path
                    ? `https://image.tmdb.org/t/p/w200${item.series.poster_path}`
                    : null;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onClose();
                        if (existing) {
                          onOpenSeriesDetail(existing);
                        } else {
                          onOpenSeriesDetail({
                            tmdb_id: item.series_tmdb_id ?? undefined,
                            title,
                            poster_path: item.series?.poster_path || null,
                          });
                        }
                      }}
                      className="bg-white rounded-2xl p-2.5 border border-gray-200/90 shadow-2xs flex items-center gap-3 cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all"
                    >
                      <div className="w-12 h-16 rounded-xl bg-gray-900 shrink-0 overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center">
                        {poster ? (
                          <img
                            src={poster}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <TvIcon className="w-5 h-5 text-gray-500 opacity-40" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-gray-900 truncate">
                          {title}
                        </h4>
                        {existing?.status && (
                          <span className="text-[10px] font-bold text-gray-500 capitalize">
                            {existing.status === 'watching'
                              ? 'In corso'
                              : existing.status === 'completed'
                              ? 'Completata'
                              : 'Da iniziare'}
                          </span>
                        )}
                      </div>

                      <span className="text-gray-300 text-sm font-bold pr-1">↗</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* VISTA ELENCO DI TUTTE LE LISTE PERSONALI */
          <div>
            {myLists.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <EmptyState message="Non hai ancora creato nessuna lista personale." />
                <button
                  type="button"
                  onClick={onOpenListManager}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer active:scale-95"
                >
                  Crea la tua prima lista
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {myLists.map((list) => {
                  const count = list.items?.length || 0;
                  const privacyLabel =
                    list.visibility === 'private'
                      ? 'Solo Io'
                      : list.visibility === 'friends'
                      ? 'Amici'
                      : 'Pubblico';

                  return (
                    <div
                      key={list.id}
                      onClick={() => setSelectedList(list)}
                      className="bg-white rounded-2xl p-3.5 border border-gray-200/90 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 transition-colors">
                          <span className="text-lg">📁</span>
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-black text-gray-900 truncate">
                            {list.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200/60">
                              {count} {count === 1 ? 'serie' : 'serie'}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {privacyLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <span className="text-xs font-bold">Vedi</span>
                        <span className="text-sm font-bold">→</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default MobileSeriesPersonalListsModal;
