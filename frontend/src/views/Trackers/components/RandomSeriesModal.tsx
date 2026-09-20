import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';

interface RandomSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  series: any[];
  onSeriesClick?: (series: any) => void;
}

const RandomSeriesModal: React.FC<RandomSeriesModalProps> = ({ isOpen, onClose, series, onSeriesClick }) => {
  const [phase, setPhase] = useState<'ROTATING' | 'QUESTION' | 'RESULT'>('ROTATING');
  const [targetSeries, setTargetSeries] = useState<any | null>(null);
  const [currentDisplay, setCurrentDisplay] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (series.length === 0) {
        setPhase('RESULT');
        return () => {};
      }
      const finalTarget = series[Math.floor(Math.random() * series.length)];
      setTargetSeries(finalTarget);
      setPhase('ROTATING');

      let rotationInterval: ReturnType<typeof setInterval>;
      
      rotationInterval = setInterval(() => {
        const randomSeries = series[Math.floor(Math.random() * series.length)];
        setCurrentDisplay(randomSeries);
      }, 150);

      const questionTimeout = setTimeout(() => {
        clearInterval(rotationInterval);
        setPhase('QUESTION');
      }, 1500);

      const resultTimeout = setTimeout(() => {
        setPhase('RESULT');
      }, 2500);

      return () => {
        clearInterval(rotationInterval);
        clearTimeout(questionTimeout);
        clearTimeout(resultTimeout);
      };
    } else {
      setPhase('ROTATING');
      setTargetSeries(null);
      setCurrentDisplay(null);
      return undefined;
    }
  }, [isOpen, series]);

  return (
    <BaseModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Cosa guardare oggi?" 
      maxWidthClass="max-w-sm"
      hideDefaultClose={phase !== 'RESULT'}
    >
      <div className="flex flex-col items-center justify-center min-h-[400px] -m-6 p-6 relative overflow-hidden rounded-b-2xl">
        
        {/* Sfondo Sfumato (Visibile solo in RESULT) */}
        {phase === 'RESULT' && targetSeries?.poster_path && (
          <div className="absolute inset-0 z-0 animate-fadeIn opacity-60">
            <img src={`https://image.tmdb.org/t/p/w500${targetSeries.poster_path}`} alt="" className="w-full h-full object-cover blur-2xl scale-125" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl"></div>
          </div>
        )}

        {series.length === 0 ? (
           <p className="text-gray-500 font-medium text-center z-10 relative">
             La tua lista è vuota. Aggiungi prima qualche serie!
           </p>
        ) : (
          <div className="relative w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 flex items-center justify-center transition-all duration-500 z-10">
            
            {/* ROTATING PHASE */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${phase === 'ROTATING' ? 'opacity-100' : 'opacity-0'}`}>
               {currentDisplay?.poster_path ? (
                 <img src={`https://image.tmdb.org/t/p/w500${currentDisplay.poster_path}`} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                   <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                   </svg>
                 </div>
               )}
            </div>

            {/* QUESTION PHASE */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transition-opacity duration-500 ${phase === 'QUESTION' ? 'opacity-100 scale-105' : 'opacity-0 scale-95'}`}>
               <span className="text-7xl font-extrabold text-white animate-pulse">?</span>
            </div>

            {/* RESULT PHASE */}
            <div 
              className={`absolute inset-0 transition-all duration-700 ease-out flex flex-col ${phase === 'RESULT' ? 'opacity-100 scale-100 translate-y-0 cursor-pointer' : 'opacity-0 scale-110 translate-y-4 pointer-events-none'}`}
              onClick={() => {
                if (phase === 'RESULT' && onSeriesClick && targetSeries) {
                  onSeriesClick(targetSeries);
                  onClose();
                }
              }}
            >
               {targetSeries?.poster_path ? (
                 <img src={`https://image.tmdb.org/t/p/w500${targetSeries.poster_path}`} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
               ) : (
                 <img src="/no-poster.png" alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
               )}
               <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-3 flex flex-col items-center pointer-events-none">
                 <h4 className="text-white font-extrabold text-center text-lg leading-tight drop-shadow-md">
                   {targetSeries?.title}
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
