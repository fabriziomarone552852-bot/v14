import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import { useConfirm } from '@/context/ConfirmContext';

interface RandomSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: any[];
  onSeriesClick?: (series: any) => void;
}

const RandomSeriesModal: React.FC<RandomSeriesModalProps> = ({ isOpen, onClose, series, onSeriesClick }) => {
  const [phase, setPhase] = useState<'SELECTION' | 'ROTATING' | 'QUESTION' | 'RESULT'>('SELECTION');
  const [targetSeries, setTargetSeries] = useState<any | null>(null);
  const [currentDisplay, setCurrentDisplay] = useState<any | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    if (isOpen) {
      if (series.length === 0) {
        setPhase('RESULT');
        return () => {};
      }
      setPhase('SELECTION');
      
      let rotationInterval = setInterval(() => {
        const randomSeries = series[Math.floor(Math.random() * series.length)];
        setCurrentDisplay(randomSeries);
      }, 150);

      return () => {
        clearInterval(rotationInterval);
      };
    } else {
      setPhase('SELECTION');
      setTargetSeries(null);
      setCurrentDisplay(null);
      return undefined;
    }
  }, [isOpen, series]);

  const handleStartExtraction = (mode: 'ALL' | 'UNWATCHED') => {
    let pool = series;
    if (mode === 'UNWATCHED') {
      pool = series.filter(s => s.status === 'to_watch');
    }
    
    if (pool.length === 0) {
      confirm({
        title: "Nessuna Serie",
        message: mode === 'UNWATCHED' ? "Non hai nessuna serie da iniziare nella lista!" : "Nessuna serie disponibile.",
        isDestructive: false,
        hideCancel: true,
        hideConfirm: true,
        autoCloseMs: 3000,
        onConfirm: () => {}
      });
      return;
    }
    
    const finalTarget = pool[Math.floor(Math.random() * pool.length)];
    setTargetSeries(finalTarget);
    setPhase('ROTATING');
    
    // Continua a ruotare per un po' tra la lista filtrata
    let rotationInterval = setInterval(() => {
      const randomSeries = pool[Math.floor(Math.random() * pool.length)];
      setCurrentDisplay(randomSeries);
    }, 100);
    
    setTimeout(() => {
      clearInterval(rotationInterval);
      setPhase('QUESTION');
    }, 1500);

    setTimeout(() => {
      setPhase('RESULT');
    }, 2500);
  };

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Cosa guardare oggi?" 
      maxWidthClass="max-w-sm"
      hideDefaultClose={phase === 'ROTATING' || phase === 'QUESTION'}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] -m-6 p-6 relative overflow-hidden rounded-b-2xl">
        
        {/* Sfondo Sfumato (Visibile solo in RESULT) */}
        {phase === 'RESULT' && (targetSeries?.tmdb_series?.poster_path || targetSeries?.poster_path) && (
          <div className="absolute inset-0 z-0 animate-fadeIn opacity-60">
            <img src={`https://image.tmdb.org/t/p/w500${targetSeries.tmdb_series?.poster_path || targetSeries.poster_path}`} alt="" className="w-full h-full object-cover blur-2xl scale-125" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl"></div>
          </div>
        )}

        {series.length === 0 ? (
           <p className="text-gray-500 font-medium text-center z-10 relative">
             La tua lista è vuota. Aggiungi prima qualche serie!
           </p>
        ) : (
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center transition-all duration-500 z-10">
            
            {/* ROTATING BACKGROUND IMAGE (used in SELECTION and ROTATING phases) */}
            {(phase === 'SELECTION' || phase === 'ROTATING') && (
              <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity duration-300">
                 {(currentDisplay?.tmdb_series?.poster_path || currentDisplay?.poster_path) ? (
                   <img src={`https://image.tmdb.org/t/p/w500${currentDisplay.tmdb_series?.poster_path || currentDisplay.poster_path}`} alt="" className="w-56 aspect-[2/3] object-cover rounded-2xl shadow-2xl transition-all" />
                 ) : (
                   <div className="w-56 aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center rounded-2xl shadow-2xl">
                     <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                     </svg>
                   </div>
                 )}
              </div>
            )}
            
            {/* OVERLAY SELECTION BUTTONS */}
            {phase === 'SELECTION' && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 p-4 rounded-b-2xl">
                <button 
                  onClick={() => handleStartExtraction('ALL')}
                  className="w-full max-w-[240px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Estrai da tutta la lista
                </button>
                <button 
                  onClick={() => handleStartExtraction('UNWATCHED')}
                  className="w-full max-w-[240px] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                >
                  Estrai tra le non viste
                </button>
              </div>
            )}

            {/* QUESTION PHASE */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transition-opacity duration-500 rounded-2xl ${phase === 'QUESTION' ? 'opacity-100 scale-105' : 'opacity-0 scale-95 pointer-events-none'}`}>
               <span className="text-7xl font-extrabold text-white animate-pulse">?</span>
            </div>

            {/* RESULT PHASE */}
            <div 
              className={`absolute flex flex-col items-center justify-center transition-all duration-700 ease-out ${phase === 'RESULT' ? 'opacity-100 scale-100 translate-y-0 cursor-pointer z-30' : 'opacity-0 scale-110 translate-y-4 pointer-events-none'}`}
              onClick={() => {
                if (phase === 'RESULT' && onSeriesClick && targetSeries) {
                  onSeriesClick(targetSeries);
                  onClose();
                }
              }}
            >
               {(targetSeries?.tmdb_series?.poster_path || targetSeries?.poster_path) ? (
                 <img src={`https://image.tmdb.org/t/p/w500${targetSeries.tmdb_series?.poster_path || targetSeries.poster_path}`} alt="" className="w-56 aspect-[2/3] object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500" />
               ) : (
                 <img src="/no-poster.png" alt="" className="w-56 aspect-[2/3] object-cover rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500" />
               )}
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-3 flex flex-col items-center pointer-events-none rounded-b-2xl w-56 mx-auto">
                 <h4 className="text-white font-extrabold text-center text-lg leading-tight drop-shadow-md">
                   {targetSeries?.tmdb_series?.title || targetSeries?.title}
                 </h4>
               </div>
            </div>

          </div>
        )}

      </div>
    </BaseModal>
  );
};

export default RandomSeriesModal;
