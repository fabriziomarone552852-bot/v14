// src/mobile/components/MobileAgendaPeriodHeader.tsx
import React, { useState } from 'react';
import {
  UndoIcon,
  QuillIcon,
  ScrollIcon,
  NoteIcon,
} from '@/components/shared/utils/Icons';
import DatePicker from '@/components/shared/utils/DatePicker/DatePicker';
import { formatDateString } from '@/utils/dateUtils';

export interface MobileAgendaPeriodHeaderProps {
  title: string;       // Testo principale (es. "31 agosto 2026", "31 Ago - 06 Set", "Agosto 2026", "2026")
  subtitle?: string;    // Etichetta secondaria (es. "LUNEDÌ", "SETT. 35", ecc.)
  currentDate: Date;
  isCurrent: boolean;   // isToday | isCurrentWeek | isCurrentMonth | isCurrentYear
  onResetToday: () => void;
  onChangeDate: (newDate: Date) => void;
  viewMode?: 'day' | 'week' | 'month' | 'year';

  // Review (Mese / Anno)
  reviewStatus?: 'none' | 'empty' | 'filled';
  onOpenReview?: () => void;

  // Note (Giorno / Settimana)
  onOpenNotes?: () => void;
  notesCount?: number;
}

export const MobileAgendaPeriodHeader: React.FC<MobileAgendaPeriodHeaderProps> = ({
  title,
  subtitle,
  currentDate,
  isCurrent,
  onResetToday,
  onChangeDate,
  viewMode = 'day',
  reviewStatus = 'none',
  onOpenReview,
  onOpenNotes,
  notesCount = 0,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleDatePickerChange = (newDateStr: string) => {
    const [yyyy, mm, dd] = newDateStr.split('-');
    onChangeDate(new Date(Number(yyyy), Number(mm) - 1, Number(dd)));
  };

  const isYearMode = viewMode === 'year';
  const hasActions = !isCurrent || (reviewStatus !== 'none' && onOpenReview) || onOpenNotes;

  return (
    <div className="shrink-0 w-full flex items-center justify-between px-1 py-1 select-none">
      {/* 1. SINISTRA: DATA PRINCIPALE + ETICHETTA PERIODO (Apre DatePicker al tocco) */}
      <div className="flex-1 min-w-0 pr-2">
        <DatePicker
          value={formatDateString(currentDate)}
          onChange={handleDatePickerChange}
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          onToggle={() => setIsDatePickerOpen((prev) => !prev)}
          align="left"
          selectionMode={viewMode}
          overlay={true}
          customTrigger={
            <div className="flex flex-col items-start cursor-pointer group">
              <h1 className="text-base font-extrabold text-gray-900 group-hover:text-blue-600 group-active:text-blue-600 transition-colors truncate max-w-full leading-tight capitalize">
                {title}
              </h1>
              {!isYearMode && subtitle && (
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 group-hover:text-blue-600 group-active:text-blue-600 transition-colors truncate leading-none mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          }
        />
      </div>

      {/* 2. DESTRA: ICONE FUNZIONE PULITE (Senza contorni né riquadri) */}
      {hasActions && (
        <div className="flex items-center gap-2.5 shrink-0 animate-fadeIn">
          {/* Tasto Reset ad Oggi / Periodo Corrente */}
          {!isCurrent && (
            <button
              type="button"
              onClick={onResetToday}
              className="p-1.5 text-gray-500 hover:text-blue-600 active:scale-90 transition-all focus:outline-none cursor-pointer"
              title="Torna ad oggi / periodo corrente"
              aria-label="Torna ad oggi"
            >
              <UndoIcon className="w-4 h-4" />
            </button>
          )}

          {/* Tasto Review (Mese / Anno) */}
          {reviewStatus !== 'none' && onOpenReview && (
            <button
              type="button"
              onClick={onOpenReview}
              className={`p-1.5 active:scale-90 transition-all focus:outline-none cursor-pointer ${
                reviewStatus === 'filled'
                  ? 'text-amber-600 hover:text-amber-700'
                  : 'text-blue-600 hover:text-blue-700'
              }`}
              title={reviewStatus === 'filled' ? 'Rivedi Analisi' : 'Scrivi Analisi'}
              aria-label="Analisi e Review"
            >
              {reviewStatus === 'filled' ? (
                <ScrollIcon className="w-4 h-4" />
              ) : (
                <QuillIcon className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Tasto Note Rapide (Giorno / Settimana) */}
          {onOpenNotes && (
            <button
              type="button"
              onClick={onOpenNotes}
              className="relative p-1.5 text-gray-500 hover:text-amber-600 active:scale-90 transition-all focus:outline-none cursor-pointer"
              title="Note del giorno"
              aria-label="Note del giorno"
            >
              <NoteIcon className="w-4 h-4" />
              {notesCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileAgendaPeriodHeader;
