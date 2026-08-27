// src/components/dashboard/calendar/CalendarHeader.tsx
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/apiService';
import type { CalendarState } from '@/hooks/useCalendarState';
import { nomiMesiLungo, pad } from '@/utils/dateUtils';
import { BackIcon, ForwardIcon, SyncIcon } from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';

interface CalendarHeaderProps {
  state: CalendarState;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ state }) => {
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const { 
    view, setView, hoveredDay, handlePrev, handleNext, 
    isSelectingDate, setIsSelectingDate,
    monthIndex, monthYear, mondayOfWeek, currentWeekDate,
    setCurrentMonthDate, setCurrentWeekDate, setHoveredDay, setPopupRect
  } = state;

  // 1. Usa `currentWeekDate` invece di `mondayOfWeek` per il DatePicker!
  const currentValueForPicker = view === 'Mese' 
    ? `${monthYear}-${pad(monthIndex + 1)}-01`
    : `${currentWeekDate.getFullYear()}-${pad(currentWeekDate.getMonth() + 1)}-${pad(currentWeekDate.getDate())}`;

  // 2. Quando l'utente seleziona una data, salva la data esatta nello state
  const handleDateChange = (dateStr: string) => {
    const [yyyy, mm, dd] = dateStr.split('-').map(Number);
    const selectedDate = new Date(yyyy, mm - 1, dd);

    if (view === 'Mese') {
      setCurrentMonthDate(new Date(yyyy, mm - 1, 1));
    } else {
      setCurrentWeekDate(selectedDate);
    }
  };

  const handleSyncGoogle = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await api.post<{ message: string }>('/google-calendar/sync');
      if (res?.message) {
        setSyncFeedback(res.message);
        setTimeout(() => setSyncFeedback(null), 3500);
      }
      await queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Errore durante la sincronizzazione';
      setSyncFeedback(msg);
      setTimeout(() => setSyncFeedback(null), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={`flex justify-between items-end mb-4 border-b pb-2 flex-shrink-0 relative transition-none ${hoveredDay ? 'z-10' : 'z-40'}`}>
      
      {/* Lato Sinistro e Centro: Frecce e DatePicker Integrato nel Titolo */}
      <div className="flex items-center gap-3">
        <button onClick={handlePrev} className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white">
          <BackIcon className="h-4 w-4" />
        </button>
        
        {/* 🪄 LA MAGIA DEL CUSTOM TRIGGER */}
        <div className="relative flex justify-center items-center select-none">
          <DatePicker
            value={currentValueForPicker}
            onChange={handleDateChange}
            isOpen={isSelectingDate}
            onClose={() => setIsSelectingDate(false)}
            onToggle={() => setIsSelectingDate(!isSelectingDate)}
            align="center"
            selectionMode={view === 'Mese' ? 'month' : 'week'}
            customTrigger={
              <div className={`flex gap-1.5 items-baseline cursor-pointer px-3 py-1 rounded-md transition-colors group ${isSelectingDate ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <h3 className="text-xl font-extrabold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {view === 'Mese' ? nomiMesiLungo[monthIndex] : `Sett. ${pad(mondayOfWeek.getDate())}/${pad(mondayOfWeek.getMonth() + 1)}`}
                </h3>
                <span className="text-sm font-bold text-gray-400">
                  {view === 'Mese' ? monthYear : mondayOfWeek.getFullYear()}
                </span>
              </div>
            }
          />
        </div>

        <button onClick={handleNext} className="p-1 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200 shadow-sm bg-white">
          <ForwardIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Lato Destro: Pulsante Sync e View Toggles */}
      <div className="flex items-center gap-2 relative">
        {syncFeedback && (
          <div className="absolute right-0 bottom-full mb-2 z-50 whitespace-nowrap bg-slate-900 text-white text-[11px] font-semibold py-1.5 px-3 rounded-xl shadow-lg border border-slate-700">
            {syncFeedback}
          </div>
        )}

        <button
          type="button"
          onClick={handleSyncGoogle}
          disabled={isSyncing}
          title="Sincronizza con Google Calendar"
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors border border-gray-200 shadow-sm bg-white flex items-center justify-center disabled:opacity-50"
        >
          <SyncIcon className={`w-4 h-4 text-gray-500 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        <div className="flex bg-gray-100 rounded-lg p-1 relative z-0">
          <button 
            onClick={() => { setView('Mese'); setHoveredDay(null); setPopupRect(null); }} 
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${view === 'Mese' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
          >
            MESE
          </button>
          <button 
            onClick={() => { setView('Settimana'); setHoveredDay(null); setPopupRect(null); }} 
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${view === 'Settimana' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
          >
            SETTIMANA
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;