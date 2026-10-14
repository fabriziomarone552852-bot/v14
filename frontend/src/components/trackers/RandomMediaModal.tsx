import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useConfirm } from '@/context/ConfirmContext';
import { resolveImageUrl } from '@/utils/imageUtils';
import { EmptyState } from '@/components/shared/utils/EmptyState';
import { CloseIcon } from '@/components/shared/utils/Icons';
import { useBackHandler } from '@/utils/backButtonManager';

export interface RandomMediaItem {
  id: string | number;
  title: string;
  poster_path?: string | null;
  custom_poster_path?: string | null;
  status?: string;
}

interface RandomMediaModalProps<T extends RandomMediaItem> {
  isOpen: boolean;
  onClose: () => void;
  items: T[];
  onItemClick?: (item: T) => void;
  modalTitle?: string;
  emptyMessage?: string;
  noUnstartedMessage?: string;
  fullScreen?: boolean;
}

const RandomMediaModal = <T extends RandomMediaItem>({ 
  isOpen, 
  onClose, 
  items, 
  onItemClick,
  modalTitle = "Cosa scegliamo oggi?",
  emptyMessage = "Nessun elemento disponibile.",
  noUnstartedMessage = "Non hai nessun elemento da iniziare nella lista!",
  fullScreen = false
}: RandomMediaModalProps<T>) => {
  const [phase, setPhase] = useState<'SELECTION' | 'ROTATING' | 'QUESTION' | 'RESULT'>('SELECTION');
  const [targetItem, setTargetItem] = useState<T | null>(null);
  const [currentDisplay, setCurrentDisplay] = useState<T | null>(null);
  const { confirm } = useConfirm();

  // Gestione back hardware su Android per il modale a tutto schermo
  useBackHandler(isOpen && fullScreen && phase !== 'ROTATING' && phase !== 'QUESTION', onClose, 15);

  useEffect(() => {
    if (isOpen) {
      if (items.length === 0) {
        setPhase('RESULT');
        return () => {};
      }
      setPhase('SELECTION');
      
      const rotationInterval = setInterval(() => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setCurrentDisplay(randomItem);
      }, 150);

      return () => {
        clearInterval(rotationInterval);
      };
    } else {
      setPhase('SELECTION');
      setTargetItem(null);
      setCurrentDisplay(null);
      return undefined;
    }
  }, [isOpen, items]);

  const handleStartExtraction = (mode: 'ALL' | 'UNWATCHED') => {
    let pool = items;
    if (mode === 'UNWATCHED') {
      pool = items.filter(s => s.status === 'to_watch' || s.status === 'to_read' || s.status === 'to_play');
    }
    
    if (pool.length === 0) {
      confirm({
        title: "Nessun Elemento",
        message: mode === 'UNWATCHED' ? noUnstartedMessage : emptyMessage,
        isDestructive: false,
        hideCancel: true,
        hideConfirm: true,
        autoCloseMs: 3000,
        onConfirm: () => {}
      });
      return;
    }
    
    const finalTarget = pool[Math.floor(Math.random() * pool.length)];
    setTargetItem(finalTarget);
    setPhase('ROTATING');
    
    // Continua a ruotare tra la lista filtrata
    const rotationInterval = setInterval(() => {
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setCurrentDisplay(randomItem);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rotationInterval);
      setPhase('QUESTION');
    }, 1500);

    setTimeout(() => {
      setPhase('RESULT');
    }, 2500);
  };

  const getPoster = (item: T | null) => {
    if (!item) return null;
    return item.custom_poster_path ? resolveImageUrl(item.custom_poster_path) : item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null;
  };

  const activeItem = phase === 'RESULT' ? targetItem : currentDisplay;
  const activePoster = getPoster(activeItem);

  if (!isOpen) return null;

  // =========================================================================
  // 1. MODALITÀ FULLSCREEN (MOBILE: a tutto schermo, chiaro e smerigliato come webpage)
  // =========================================================================
  if (fullScreen) {
    return createPortal(
      <div className="fixed inset-0 z-[10000] bg-slate-100 flex flex-col overflow-hidden animate-fadeIn select-none pointer-events-auto">
        {/* Sfondo Smerigliato leggero con locandine rotanti ben riconoscibili */}
        {activePoster && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-300">
            <img 
              src={activePoster} 
              alt="" 
              className="w-full h-full object-cover blur-[5px] scale-105 opacity-65" 
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Header Mobile: NO "Cosa guardare oggi?", solo la X per chiudere in alto a destra */}
        <div className="relative z-20 flex items-center justify-end px-5 py-4 shrink-0">
          {phase !== 'ROTATING' && phase !== 'QUESTION' && (
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-900/10 hover:bg-slate-900/20 active:scale-95 text-slate-700 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
              aria-label="Chiudi"
            >
              <CloseIcon className="w-5 h-5 text-slate-700" />
            </button>
          )}
        </div>

        {/* Contenuto principale Mobile */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-8 overflow-y-auto">
          {items.length === 0 ? (
            <div className="z-10 w-full py-8">
              <EmptyState 
                icon={<span className="text-4xl block mb-2">😢</span>} 
                message={emptyMessage} 
              />
            </div>
          ) : phase === 'SELECTION' ? (
            <div className="z-10 flex flex-col items-center justify-center gap-4 w-full max-w-sm px-4 my-auto animate-fadeIn">
              <div className="flex flex-col gap-3.5 w-full">
                <button 
                  type="button"
                  onClick={() => handleStartExtraction('ALL')}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <span className="text-2xl group-hover:animate-spin-slow">🎲</span>
                  <span className="text-base font-extrabold tracking-wide">
                    ESTRAI DA TUTTO IL TUO CATALOGO
                  </span>
                  <span className="text-xs text-blue-100 font-normal">
                    Sceglie casualmente da tutta la tua libreria
                  </span>
                </button>

                <button 
                  type="button"
                  onClick={() => handleStartExtraction('UNWATCHED')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex flex-col items-center justify-center gap-1 group cursor-pointer"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
                  <span className="text-base font-extrabold tracking-wide">
                    ESTRAI TRA QUEGLI DA INIZIARE
                  </span>
                  <span className="text-xs text-emerald-100 font-normal">
                    Sceglie solo tra gli elementi in coda
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="z-10 flex flex-col items-center animate-fadeIn w-full">
              {/* Contenitore Locandina Rotante */}
              <div className={`relative aspect-[2/3] w-52 max-w-[70vw] rounded-2xl overflow-hidden shadow-2xl mb-6 transition-all duration-500 ${phase === 'RESULT' ? 'scale-110 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] ring-4 ring-white' : 'ring-2 ring-white/50'}`}>
                <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-1000 ${phase === 'QUESTION' ? 'opacity-100' : 'opacity-0'}`} />
                
                {activeItem ? (
                  activePoster ? (
                    <img 
                      src={activePoster} 
                      alt="Poster" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-800 p-4 text-center">
                      <span className="text-4xl mb-2">🎬</span>
                      <span className="text-xs font-bold truncate max-w-full">{activeItem.title}</span>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse" />
                )}
              </div>

              {/* Testi e Azione (solo Mostra in dettaglio, rimosso Riprova) */}
              <div className="text-center min-h-[5rem] flex flex-col items-center justify-center w-full px-4">
                {phase === 'ROTATING' && (
                  <h2 className="text-xl font-black text-slate-800 animate-pulse">
                    Mescolando...
                  </h2>
                )}
                {phase === 'QUESTION' && (
                  <h2 className="text-2xl font-black text-slate-800 animate-pulse">
                    Il destino ha scelto...
                  </h2>
                )}
                {phase === 'RESULT' && targetItem && (
                  <div className="animate-slideUp fade-in flex flex-col items-center">
                    <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm mb-1 leading-tight text-center line-clamp-2 max-w-md">
                      {targetItem.title}
                    </h2>
                    <div className="flex gap-3 mt-4">
                      {onItemClick && (
                        <button 
                          type="button"
                          onClick={() => {
                            onClose();
                            onItemClick(targetItem);
                          }}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all text-sm flex items-center gap-1.5 shadow-lg shadow-blue-500/30 cursor-pointer"
                        >
                          Mostra in dettaglio
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  }

  // =========================================================================
  // 2. MODALITÀ STANDARD (WEBPAGE DESKTOP)
  // =========================================================================
  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modalTitle} 
      maxWidthClass="max-w-xl"
      hideHeader={true}
    >
      <div className="flex flex-col min-h-[500px] -m-6 relative overflow-hidden rounded-2xl">
        
        {/* Sfondo Smerigliato leggero continuo che avvolge tutto il modale, header compreso */}
        {activePoster && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-all duration-300">
            <img 
              src={activePoster} 
              alt="" 
              className="w-full h-full object-cover blur-[5px] scale-105 opacity-65" 
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
          </div>
        )}

        {/* Header Trasparente Integrato senza linea divisoria */}
        <div className="relative z-20 px-6 py-4 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-extrabold text-slate-800 uppercase tracking-wider drop-shadow-xs">
            {modalTitle}
          </h3>
          {phase !== 'ROTATING' && phase !== 'QUESTION' && (
            <button 
              type="button" 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-white/40 active:scale-95 transition-all cursor-pointer"
              title="Chiudi"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Contenuto del Modale */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-8">
          {items.length === 0 ? (
            <div className="z-10 w-full py-8">
              <EmptyState 
                icon={<span className="text-4xl block mb-2">😢</span>} 
                message={emptyMessage} 
              />
            </div>
          ) : phase === 'SELECTION' ? (
            <div className="z-10 flex flex-col gap-4 w-full max-w-md px-2 animate-fadeIn">
              <button 
                type="button"
                onClick={() => handleStartExtraction('ALL')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer border border-white/20"
              >
                <span className="text-3xl group-hover:animate-spin-slow">🎲</span>
                <span className="text-base md:text-lg font-extrabold tracking-wide">ESTRAI DA TUTTO IL TUO CATALOGO</span>
                <span className="text-xs text-blue-100 font-normal">Sceglie casualmente da tutta la tua libreria</span>
              </button>

              <button 
                type="button"
                onClick={() => handleStartExtraction('UNWATCHED')}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1.5 group cursor-pointer border border-white/20"
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">✨</span>
                <span className="text-base md:text-lg font-extrabold tracking-wide">ESTRAI TRA QUEGLI DA INIZIARE</span>
                <span className="text-xs text-emerald-100 font-normal">Sceglie solo tra gli elementi in coda</span>
              </button>
            </div>
          ) : (
            <div className="z-10 flex flex-col items-center animate-fadeIn w-full">
              {/* Contenitore Locandina Rotante Ingrandito */}
              <div className={`relative aspect-[2/3] w-56 rounded-2xl overflow-hidden shadow-2xl mb-6 transition-all duration-500 ${phase === 'RESULT' ? 'scale-110 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-4 ring-white' : 'ring-2 ring-white/40'}`}>
                {/* Overlay Flash durante QUESTION */}
                <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-1000 ${phase === 'QUESTION' ? 'opacity-100' : 'opacity-0'}`} />
                
                {/* Immagine */}
                {(phase === 'RESULT' ? targetItem : currentDisplay) ? (
                  getPoster(phase === 'RESULT' ? targetItem : currentDisplay) ? (
                    <img 
                      src={getPoster(phase === 'RESULT' ? targetItem : currentDisplay)!} 
                      alt="Poster" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <img src="/no-poster.png" alt="No Image" className="w-full h-full object-cover opacity-50" />
                  )
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse" />
                )}
              </div>

              {/* Testi */}
              <div className="text-center min-h-[5rem] flex flex-col items-center justify-center w-full px-4">
                 {phase === 'ROTATING' && (
                   <h2 className="text-xl font-black text-slate-800 animate-pulse">Mescolando...</h2>
                 )}
                 {phase === 'QUESTION' && (
                   <h2 className="text-2xl font-black text-slate-800 animate-pulse">Il destino ha scelto...</h2>
                 )}
                 {phase === 'RESULT' && targetItem && (
                   <div className="animate-slideUp fade-in flex flex-col items-center">
                     <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm mb-1 leading-tight">{targetItem.title}</h2>
                     <div className="flex gap-2 mt-3">
                        {onItemClick && (
                          <button 
                            type="button"
                            onClick={() => {
                              onClose();
                              onItemClick(targetItem);
                            }}
                            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-1 shadow-md hover:shadow-lg cursor-pointer"
                          >
                            Mostra in dettaglio
                          </button>
                        )}
                     </div>
                   </div>
                 )}
              </div>

            </div>
          )}
        </div>

      </div>
    </BaseModal>
  );
};

export default RandomMediaModal;
