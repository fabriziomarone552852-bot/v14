// src/mobile/components/modals/routine/MobileHabitLogsHistory.tsx
import React from 'react';
import type { MonthGroupedHabitLog } from '@/hooks/useHabitLogs';

interface MobileHabitLogsHistoryProps {
  isLoading: boolean;
  groupedLogs: MonthGroupedHabitLog[];
}

export const MobileHabitLogsHistory: React.FC<MobileHabitLogsHistoryProps> = ({
  isLoading,
  groupedLogs,
}) => {
  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        Registro Storico Completamenti
      </h4>
      <div className="max-h-48 overflow-y-auto custom-scrollbar bg-gray-50 border border-gray-200/80 rounded-2xl p-3 shadow-inner">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-gray-400">
            Caricamento storico in corso...
          </div>
        ) : groupedLogs.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400 italic">
            Nessun completamento registrato.
          </div>
        ) : (
          groupedLogs.map((monthGroup, idx) => (
            <div key={idx} className="mb-3 last:mb-0">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 sticky top-0 bg-gray-50 z-10 py-0.5">
                {monthGroup.month}
              </div>
              <div className="space-y-1.5">
                {monthGroup.logs.map((log, logIdx) => {
                  const completato = log.done >= log.target;
                  return (
                    <div
                      key={logIdx}
                      className="flex justify-between items-center bg-white border border-gray-200/70 px-3 py-2 rounded-xl text-xs font-medium shadow-2xs"
                    >
                      <span
                        className={`font-semibold ${
                          completato ? 'text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {log.date}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black ${
                            completato ? 'text-green-600' : 'text-purple-600'
                          }`}
                        >
                          {log.done}/{log.target}
                        </span>
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            completato ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MobileHabitLogsHistory;
