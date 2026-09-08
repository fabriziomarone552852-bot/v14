// src/components/shared/utils/RecurrenceEditor.tsx
import React, { useState } from 'react';
import DatePicker from './DatePicker/DatePicker'; 
import { CloseFillIcon } from './Icons';

interface RecurrenceEditorProps {
  isRecurrent?: boolean;
  onRecurrentChange?: (val: boolean) => void;
  interval: string;
  onIntervalChange: (val: string) => void;
  freq: string;
  onFreqChange: (val: string) => void;
  untilDate: string;
  onUntilDateChange: (val: string) => void;
  hideToggle?: boolean;
}

export const RecurrenceEditor: React.FC<RecurrenceEditorProps> = ({
  isRecurrent = true, 
  onRecurrentChange, 
  interval, 
  onIntervalChange, 
  freq, 
  onFreqChange, 
  untilDate, 
  onUntilDateChange,
  hideToggle = false,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const showControls = hideToggle || isRecurrent;

  return (
    <div className={`bg-gray-50 p-3 rounded-xl border border-gray-100 ${hideToggle ? '' : 'mt-2'}`}>
      {/* Toggle Ripetizione (nascosto se hideToggle è true) */}
      {!hideToggle && (
        <div className="flex items-center gap-2 mb-1">
          <input 
            type="checkbox" 
            id="recurrenceToggle" 
            checked={isRecurrent} 
            onChange={(e) => onRecurrentChange?.(e.target.checked)} 
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" 
          />
          <label htmlFor="recurrenceToggle" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
            Evento Ricorrente
          </label>
        </div>
      )}
      
      {/* Controlli Ripetizione */}
      {showControls && (
        <div className={`flex items-center gap-2 text-sm text-gray-700 flex-wrap animate-fadeIn ${hideToggle ? '' : 'mt-3'}`}>
          <span>Ripeti ogni</span>
          
          {/* Input Intervallo */}
          <input 
            type="number" 
            min="1" 
            value={interval} 
            onChange={e => onIntervalChange(e.target.value)} 
            className="w-14 px-2 py-1.5 border border-gray-200 rounded-lg text-center focus:outline-none focus:border-blue-500 font-bold" 
          />
          
          {/* Select Frequenza */}
          <select 
            value={freq} 
            onChange={e => onFreqChange(e.target.value)} 
            className="px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white font-bold cursor-pointer"
          >
            <option value="DAILY">{parseInt(interval) > 1 ? 'giorni' : 'giorno'}</option>
            <option value="WEEKLY">{parseInt(interval) > 1 ? 'settimane' : 'settimana'}</option>
            <option value="MONTHLY">{parseInt(interval) > 1 ? 'mesi' : 'mese'}</option>
            <option value="YEARLY">{parseInt(interval) > 1 ? 'anni' : 'anno'}</option>
          </select>
          
          <span>fino al</span>
          
          {/* DatePicker per la data di fine (UNTIL) */}
          <div className="min-w-[140px] flex items-center gap-1">
            <DatePicker 
              value={untilDate}
              onChange={onUntilDateChange}
              isOpen={isDatePickerOpen}
              onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
              onClose={() => setIsDatePickerOpen(false)}
              placeholder="Senza limite"
              align="right"
            />
            
            {/* Tasto per resettare la data di fine */}
            {untilDate && (
               <button 
                 type="button" 
                 onClick={() => onUntilDateChange('')} 
                 className="text-red-400 hover:text-red-600 bg-white rounded-full transition-colors ml-1 p-1 shadow-sm"
               >
                 <CloseFillIcon className="h-4 w-4" />
               </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};