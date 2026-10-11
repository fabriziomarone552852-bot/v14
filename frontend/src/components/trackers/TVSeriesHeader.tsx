import React from 'react';

interface Props {
  goalPercent: number;
  goalViewType: 'percent' | 'fraction';
  setGoalViewType: React.Dispatch<React.SetStateAction<'percent' | 'fraction'>>;
  currentEpisodes: number;
  goal: number;
  setStatsModalOpen: (b: boolean) => void;
  setRandomModalOpen: (b: boolean) => void;
}

export const TVSeriesHeader: React.FC<Props> = ({
  goalPercent, goalViewType, setGoalViewType, currentEpisodes, goal, setStatsModalOpen, setRandomModalOpen
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center px-2 py-1 shrink-0 w-full gap-4 md:gap-0">
        <div className="flex items-center w-full md:w-auto" style={{ flex: 1 }}>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-gray-900 uppercase tracking-tight select-none whitespace-nowrap">Serie TV</h1>
        </div>
        
        <div className="hidden md:block" style={{ flex: 3 }}></div>

        <div className="flex justify-center w-full" style={{ flex: 11 }}>
          <div 
            onClick={() => setGoalViewType(prev => prev === 'percent' ? 'fraction' : 'percent')}
            className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow select-none relative group"
          >
             <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setStatsModalOpen(true); }} 
                  className="bg-blue-50 text-blue-600 p-1.5 rounded-lg hover:bg-blue-100 border border-blue-200 shadow-sm transition-colors"
                  title="Vedi Statistiche"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </button>
             </div>
             <div className="flex justify-center items-center mb-2 gap-4">
               <span className="text-sm md:text-base font-extrabold text-gray-600 uppercase tracking-wider text-center">Obiettivo Annuale di Episodi</span>
               <span className="text-lg font-bold text-blue-600">
                  {goalViewType === 'percent' ? `${goalPercent}%` : `${currentEpisodes}/${goal}`}
               </span>
             </div>
             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${goalPercent}%` }} />
             </div>
          </div>
        </div>

        <div className="hidden md:block" style={{ flex: 3 }}></div>

        <div className="flex justify-center items-center w-full md:w-auto relative h-12" style={{ flex: 1 }}>
           <button 
             onClick={() => setRandomModalOpen(true)}
             title="Non sai cosa guardare? Scegliamo noi per te!"
             className="absolute right-0 group h-12 px-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all z-30"
           >
              <span className="max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:mr-2 transition-all duration-500 ease-in-out font-bold text-xs overflow-hidden whitespace-nowrap text-left leading-tight">
                Non sai cosa guardare?<br/>Scegliamo noi per te!
              </span>
              <svg className="w-6 h-6 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
           </button>
        </div>

        <div className="hidden md:block" style={{ flex: 1 }}></div>
    </div>
  );
};
