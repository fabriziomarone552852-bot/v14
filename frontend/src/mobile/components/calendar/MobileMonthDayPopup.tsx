// src/mobile/components/calendar/MobileMonthDayPopup.tsx
import React, { useState } from 'react';
import type { CalendarEvent, DbTask, Category } from '@/types';
import { getHexColor } from '@/utils/uiUtils';
import {
  CalendarIcon,
  TaskListIcon,
  CloseIcon,
  ArrowDownIcon,
  CheckIcon,
} from '@/components/shared/utils/Icons';
import { MobileMonthMoodPickerModal } from './MobileMonthMoodPickerModal';

interface MobileMonthDayPopupProps {
  isOpen: boolean;
  dateStr: string;
  formattedDate: string;
  mood?: Category;
  events: CalendarEvent[];
  tasks: DbTask[];
  allCategories?: Category[];
  onClose: () => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectTask?: (task: DbTask) => void;
  onToggleTask?: (task: DbTask, newStatus: boolean) => Promise<void> | void;
  onMoodChange?: (dateStr: string, categoryId: number | null) => void;
}

export const MobileMonthDayPopup: React.FC<MobileMonthDayPopupProps> = ({
  isOpen,
  dateStr,
  formattedDate,
  mood,
  events,
  tasks,
  allCategories = [],
  onClose,
  onSelectEvent,
  onSelectTask,
  onToggleTask,
  onMoodChange,
}) => {
  const [isMoodPickerOpen, setIsMoodPickerOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop trasparente per intercettare il tap fuori senza oscurare dietro */}
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />

      {/* Contenitore Nuvoletta centrato nella griglia */}
      <div
        className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-20px)] max-w-[280px] animate-fadeIn select-none pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex flex-col gap-2 transition-all">
          {/* 1. Header Nuvoletta: Data Formattata + Mood Action + Tasto Chiudi */}
          <div className="flex items-center justify-between gap-1 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <h4 className="text-xs font-black text-gray-900 truncate">
                {formattedDate}
              </h4>

              {/* Tasto / Badge Stato d'animo */}
              {mood ? (
                <button
                  type="button"
                  onClick={() => setIsMoodPickerOpen(true)}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full truncate shrink-0 border flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: `${getHexColor(mood.colore || undefined)}20`,
                    borderColor: getHexColor(mood.colore || undefined),
                    color: getHexColor(mood.colore || undefined),
                  }}
                  title={`Umore: ${mood.category_name} (Tocca per modificare)`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: getHexColor(mood.colore || undefined) }}
                  />
                  <span className="truncate max-w-[70px]">{mood.category_name}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMoodPickerOpen(true)}
                  className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 shrink-0 flex items-center justify-center transition-transform active:scale-90 cursor-pointer shadow-2xs"
                  title="Aggiungi stato d'animo"
                  aria-label="Aggiungi stato d'animo"
                >
                  <span className="text-[11px] leading-none select-none">😀</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-500 transition-colors cursor-pointer shrink-0"
              title="Chiudi"
            >
              <CloseIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. Corpo Nuvoletta: Lista Eventi & Task Cliccabili */}
          <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-2.5 pr-0.5">
            {/* SEZIONE EVENTI */}
            {events.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Eventi ({events.length})</span>
                </div>

                <div className="space-y-1">
                  {events.map((ev) => {
                    const hex = getHexColor(ev.categoryColor);
                    return (
                      <div
                        key={ev.id}
                        onClick={() => {
                          onClose();
                          onSelectEvent(ev);
                        }}
                        className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/80 rounded-xl p-2 cursor-pointer active:scale-[0.99] transition-all shadow-2xs"
                      >
                        {ev.time && (
                          <div className="flex flex-col items-center justify-center shrink-0 text-center leading-tight pr-1 border-r border-gray-200/60">
                            <span className="text-[10px] font-black text-gray-700">
                              {ev.time.slice(0, 5)}
                            </span>
                            {ev.endTime && (
                              <>
                                <ArrowDownIcon className="h-2 w-2 text-gray-400 my-0.2" />
                                <span className="text-[9px] font-semibold text-gray-500">
                                  {ev.endTime.slice(0, 5)}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div
                          className="w-1.5 h-6 rounded-full shrink-0"
                          style={{ backgroundColor: hex }}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-gray-900 truncate leading-snug">
                            {ev.title}
                          </p>
                          {ev.location && (
                            <p className="text-[9px] text-gray-500 truncate mt-0.5">
                              📍 {ev.location}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SEZIONE TASK */}
            {tasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600">
                  <TaskListIcon className="w-3 h-3" />
                  <span>Task ({tasks.length})</span>
                </div>

                <div className="space-y-1">
                  {tasks.map((t) => {
                    const catColor = getHexColor(t.category?.colore || '#3b82f6');
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          onClose();
                          onSelectTask?.(t);
                        }}
                        className={`flex items-center gap-2 rounded-xl p-2 border cursor-pointer active:scale-[0.99] transition-all shadow-2xs ${
                          t.fatto
                            ? 'bg-gray-100/70 border-gray-200 text-gray-400'
                            : 'bg-gray-50 hover:bg-emerald-50/40 border-gray-200/80 text-gray-800'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask?.(t, !t.fatto);
                          }}
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            t.fatto
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-300 hover:border-emerald-500 bg-white'
                          }`}
                        >
                          {t.fatto && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                        </button>

                        <div
                          className="w-1.5 h-5 rounded-full shrink-0"
                          style={{ backgroundColor: t.fatto ? '#9ca3af' : catColor }}
                        />

                        <span
                          className={`text-[11px] font-bold truncate flex-1 min-w-0 ${
                            t.fatto ? 'line-through opacity-70' : ''
                          }`}
                          title={t.titolo}
                        >
                          {t.titolo || 'Senza Titolo'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* NESSUN ELEMENTO */}
            {events.length === 0 && tasks.length === 0 && (
              <div className="py-3 text-center text-xs font-semibold text-gray-400">
                Nessun evento o task in questo giorno
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale Centrato per Selezione Stato d'Animo */}
      <MobileMonthMoodPickerModal
        isOpen={isMoodPickerOpen}
        onClose={() => setIsMoodPickerOpen(false)}
        dateStr={dateStr}
        currentMoodId={mood?.id}
        allCategories={allCategories}
        onSelectMood={(selectedDateStr, catId) => {
          onMoodChange?.(selectedDateStr, catId);
        }}
      />
    </>
  );
};

export default MobileMonthDayPopup;
