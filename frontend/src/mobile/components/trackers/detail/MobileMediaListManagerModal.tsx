// src/mobile/components/trackers/detail/MobileMediaListManagerModal.tsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon, PlusIcon, LoadingIcon } from '@/components/shared/utils/Icons';
import { useMediaLists } from '@/hooks/queries/useTrackersQueries';
import { useTrackersMutations } from '@/hooks/mutations/useTrackersMutations';
import { useBackHandler } from '@/utils/backButtonManager';
import { logger } from '@/utils/logger';

export interface MobileMediaListManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  seriesId?: number;
}

export const MobileMediaListManagerModal: React.FC<MobileMediaListManagerModalProps> = ({
  isOpen,
  onClose,
  seriesId,
}) => {
  const [newListName, setNewListName] = useState('');
  const [listPrivacy, setListPrivacy] = useState<'private' | 'friends' | 'public'>('private');
  const [isCreatingSectionOpen, setIsCreatingSectionOpen] = useState(false);
  const [isPrivacyDropdownOpen, setIsPrivacyDropdownOpen] = useState(false);
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const { data: mediaLists = [] } = useMediaLists();
  const { createListAsync, addToListAsync, removeFromListAsync } = useTrackersMutations();

  useBackHandler(isOpen, onClose, 30);

  // Inizializza gli ID delle liste selezionate con quelle che contengono già la serie
  useEffect(() => {
    if (isOpen && seriesId && mediaLists.length > 0) {
      const initialIds = mediaLists
        .filter((l) => l.items?.some((it) => it.series_tmdb_id === seriesId))
        .map((l) => l.id);
      setSelectedListIds(initialIds);
    }
  }, [isOpen, seriesId, mediaLists]);

  if (!isOpen) return null;

  const handleToggleList = (listId: number) => {
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleSaveAll = async () => {
    if (!seriesId) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      const promises: Promise<unknown>[] = [];

      // 1. Creazione di una nuova lista se inserito il nome
      const trimmedName = newListName.trim();
      if (trimmedName) {
        const newList = await createListAsync({
          name: trimmedName,
          visibility: listPrivacy,
        });
        if (newList?.id) {
          promises.push(
            addToListAsync({
              list_id: newList.id,
              payload: { series_tmdb_id: seriesId },
            })
          );
        }
      }

      // 2. Allineamento selezioni liste esistenti (scelta multipla: aggiunte e rimozioni)
      for (const list of mediaLists) {
        const wasInList = list.items?.some((it) => it.series_tmdb_id === seriesId);
        const isNowSelected = selectedListIds.includes(list.id);

        if (!wasInList && isNowSelected) {
          promises.push(
            addToListAsync({
              list_id: list.id,
              payload: { series_tmdb_id: seriesId },
            })
          );
        } else if (wasInList && !isNowSelected) {
          const item = list.items?.find((it) => it.series_tmdb_id === seriesId);
          if (item) {
            promises.push(
              removeFromListAsync({
                list_id: list.id,
                item_id: item.id,
              })
            );
          }
        }
      }

      if (promises.length > 0) {
        await Promise.all(promises);
      }

      setNewListName('');
      setIsCreatingSectionOpen(false);
      setIsPrivacyDropdownOpen(false);
      onClose();
    } catch (error) {
      logger.error('Errore durante il salvataggio delle liste:', error);
      alert('Si è verificato un errore durante il salvataggio.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPrivacyIcon = (privacy: 'private' | 'friends' | 'public') => {
    if (privacy === 'private') {
      return (
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    if (privacy === 'friends') {
      return (
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const content = (
    <div className="fixed inset-0 z-[10070] flex items-center justify-center p-3 animate-fadeIn select-none">
      {/* Backdrop oscurato */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={isSaving ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Finestra modale mobile centrata */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-list-manager-title"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp z-10"
      >
        {/* Intestazione */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <h3 id="mobile-list-manager-title" className="font-extrabold text-gray-900 text-sm tracking-wide">
            Aggiungi a una Lista
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"
            aria-label="Chiudi"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo scrollabile */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Sezione Creazione Nuova Lista */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                Nuova Lista
              </span>
              {!isCreatingSectionOpen && (
                <button
                  type="button"
                  onClick={() => setIsCreatingSectionOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Crea</span>
                </button>
              )}
            </div>

            {isCreatingSectionOpen ? (
              <div className="space-y-3 animate-fadeIn">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveAll();
                    }
                  }}
                  placeholder="Nome della lista (es. Da non perdere)..."
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-2xs"
                  autoFocus
                />

                {/* Riga: Selettore Privacy stile Webpage a sinistra + Tasto Annulla a destra */}
                <div className="flex items-center gap-2 pt-1">
                  {/* Selettore Privacy con Menu a Discesa */}
                  <div className="relative flex-1">
                    <div
                      onClick={() => setIsPrivacyDropdownOpen((prev) => !prev)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white cursor-pointer flex justify-between items-center hover:border-blue-500 transition-colors shadow-2xs select-none"
                    >
                      <div className="flex items-center gap-1.5">
                        {renderPrivacyIcon(listPrivacy)}
                        <span className="text-gray-800 font-bold">
                          {listPrivacy === 'private' ? 'Solo Io' : listPrivacy === 'friends' ? 'Amici' : 'Pubblico'}
                        </span>
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isPrivacyDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isPrivacyDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setIsPrivacyDropdownOpen(false)}
                        />
                        <div className="absolute top-full mt-1 left-0 w-36 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50 animate-scaleUp">
                          <div
                            onClick={() => {
                              setListPrivacy('private');
                              setIsPrivacyDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                              listPrivacy === 'private' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                            }`}
                          >
                            {renderPrivacyIcon('private')}
                            <span>Solo Io</span>
                          </div>
                          <div
                            onClick={() => {
                              setListPrivacy('friends');
                              setIsPrivacyDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 ${
                              listPrivacy === 'friends' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                            }`}
                          >
                            {renderPrivacyIcon('friends')}
                            <span>Amici</span>
                          </div>
                          <div
                            onClick={() => {
                              setListPrivacy('public');
                              setIsPrivacyDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2 border-t border-gray-50 ${
                              listPrivacy === 'public' ? 'bg-blue-50 text-blue-700 font-bold' : ''
                            }`}
                          >
                            {renderPrivacyIcon('public')}
                            <span>Pubblico</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tasto Annulla spostato a destra */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingSectionOpen(false);
                      setNewListName('');
                      setIsPrivacyDropdownOpen(false);
                    }}
                    disabled={isSaving}
                    className="py-2 px-4 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 font-medium">
                Crea una nuova lista personalizzata e inserisci subito questa serie.
              </p>
            )}
          </div>

          {/* Elenco Liste Esistenti (Scelta Multipla) */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-2">
              Le Tue Liste
            </h4>

            {mediaLists.length === 0 ? (
              <p className="p-4 text-center text-xs text-gray-400 font-medium bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Nessuna lista creata finora. Creane una con il box sopra!
              </p>
            ) : (
              <div className="space-y-2">
                {mediaLists.map((list) => {
                  const isSelected = selectedListIds.includes(list.id);

                  return (
                    <div
                      key={list.id}
                      onClick={() => !isSaving && handleToggleList(list.id)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] select-none ${
                        isSelected
                          ? 'bg-blue-50/70 border-blue-300 shadow-xs'
                          : 'bg-white hover:bg-gray-50 border-gray-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {list.name}
                        </p>
                        <p className="text-[11px] text-gray-400 capitalize">
                          {list.visibility || 'privata'} • {list.items?.length || 0} elementi
                        </p>
                      </div>

                      {/* Checkbox rotonda scelta multipla */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer con tasto Salva blu */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <LoadingIcon className="w-4 h-4 animate-spin text-white" />
                <span>Salvataggio...</span>
              </>
            ) : (
              <span>Salva</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default MobileMediaListManagerModal;
