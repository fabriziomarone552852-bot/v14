import { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useConfirm } from '@/context/ConfirmContext';
import { resolveImageUrl } from '@/utils/imageUtils';

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
}

const RandomMediaModal = <T extends RandomMediaItem>({ 
  isOpen, 
  onClose, 
  items, 
  onItemClick,
  modalTitle = "Cosa scegliamo oggi?",
  emptyMessage = "Nessun elemento disponibile.",
  noUnstartedMessage = "Non hai nessun elemento da iniziare nella lista!"
}: RandomMediaModalProps<T>) => {
  const [phase, setPhase] = useState<'SELECTION' | 'ROTATING' | 'QUESTION' | 'RESULT'>('SELECTION');
  const [targetItem, setTargetItem] = useState<T | null>(null);
  const [currentDisplay, setCurrentDisplay] = useState<T | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    if (isOpen) {
      if (items.length === 0) {
        setPhase('RESULT');
        return () => {};
      }
      setPhase('SELECTION');
      
      let rotationInterval = setInterval(() => {
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
    
    // Continua a ruotare per un po' tra la lista filtrata
    let rotationInterval = setInterval(() => {
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

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={modalTitle} 
      maxWidthClass="max-w-sm"
      hideDefaultClose={phase === 'ROTATING' || phase === 'QUESTION'}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] -m-6 p-6 relative overflow-hidden rounded-b-2xl">
        
        {/* Sfondo Sfumato (Visibile solo in RESULT) */}
        {phase === 'RESULT' && targetItem && (
          <div className="absolute inset-0 z-0 animate-fadeIn opacity-60">
            {getPoster(targetItem) && (
               <img src={getPoster(targetItem)!} alt="" className="w-full h-full object-cover blur-2xl scale-125" />
            )}
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl"></div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="z-10 text-center">
             <span className="text-4xl mb-4 block">😢</span>
             <p className="text-gray-500 font-bold">{emptyMessage}</p>
          </div>
        ) : phase === 'SELECTION' ? (
          <div className="z-10 flex flex-col gap-4 w-full px-4 animate-fadeIn">
            <h3 className="text-xl font-black text-slate-800 text-center mb-2">Lascia scegliere al destino</h3>
            
            <button 
              onClick={() => handleStartExtraction('ALL')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-2xl group-hover:animate-spin-slow">🎲</span>
              <span>Estrai da TUTTI gli elementi</span>
              <span className="text-xs text-blue-200 font-normal">Sceglie casualmente da tutta la tua libreria</span>
            </button>

            <button 
              onClick={() => handleStartExtraction('UNWATCHED')}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex flex-col items-center justify-center gap-1 group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">✨</span>
              <span>Solo elementi DA INIZIARE</span>
              <span className="text-xs text-emerald-200 font-normal">Sceglie solo tra gli elementi in coda ("Da Iniziare")</span>
            </button>
          </div>
        ) : (
          <div className="z-10 flex flex-col items-center animate-fadeIn w-full">
            {/* Contenitore Locandina Rotante */}
            <div className={`relative aspect-[2/3] w-48 rounded-2xl overflow-hidden shadow-2xl mb-6 transition-all duration-500 ${phase === 'RESULT' ? 'scale-110 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] ring-4 ring-white' : ''}`}>
              {/* Overlay Flash durante QUESTION */}
              <div className={`absolute inset-0 bg-white z-20 pointer-events-none transition-opacity duration-1000 ${phase === 'QUESTION' ? 'opacity-100' : 'opacity-0'}`}></div>
              
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
                <div className="w-full h-full bg-slate-200 animate-pulse"></div>
              )}
            </div>

            {/* Testi */}
            <div className="text-center h-24 flex flex-col items-center justify-center w-full px-4">
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
                      <button 
                        onClick={() => {
                          setPhase('SELECTION');
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors text-sm"
                      >
                        Riprova
                      </button>
                      {onItemClick && (
                        <button 
                          onClick={() => {
                            onClose();
                            onItemClick(targetItem);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors text-sm flex items-center gap-1 shadow-md hover:shadow-lg"
                        >
                          Apri Dettaglio
                        </button>
                      )}
                   </div>
                 </div>
               )}
            </div>

          </div>
        )}

      </div>
    </BaseModal>
  );
};

export default RandomMediaModal;
