// src/mobile/hooks/useMobileWeekCalendarLogic.ts
import { useState, useMemo } from 'react';
import type { CalendarEvent, DbTask } from '@/types';
import { formatDateString } from '@/utils/dateUtils';
import { computeWeekLayout, type ComputedDayData } from '@/utils/calendarLayoutUtils';

export interface PopupPosition {
  x: number;
  y: number;
  isTopHalf: boolean;
  arrowX: number;
}

interface UseMobileWeekCalendarLogicProps {
  monday: Date;
  events: CalendarEvent[];
  tasks?: DbTask[];
}

const DAY_NAMES_SHORT = ['LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB', 'DOM'];

export const useMobileWeekCalendarLogic = ({
  monday,
  events,
  tasks = [],
}: UseMobileWeekCalendarLogicProps) => {
  const todayStr = useMemo(() => formatDateString(new Date()), []);

  // Stato per la "nuvoletta" overlay al click sull'evento
  const [selectedEventForPopup, setSelectedEventForPopup] = useState<CalendarEvent | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  const handleEventClick = (e: React.MouseEvent, ev: CalendarEvent, isSunday: boolean = false) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const isTopHalf = rect.top < window.innerHeight / 2;

    const popupWidth = 190;

    // Per Domenica, sposta verso sinistra verso l'interno della griglia
    // Per gli altri giorni (Lun - Sab), centra orizzontalmente rispetto all'evento/giorno
    const targetLeft = isSunday
      ? rect.right - popupWidth - 10
      : centerX - popupWidth / 2;

    // Clamp per evitare sbordamenti (rimane ad almeno 10px dal bordo sinistro e destro dello schermo)
    const clampedLeft = Math.max(10, Math.min(window.innerWidth - popupWidth - 10, targetLeft));

    setPopupPosition({
      x: clampedLeft,
      y: isTopHalf ? rect.bottom + 6 : rect.top - 6,
      isTopHalf,
      arrowX: Math.max(14, Math.min(popupWidth - 14, centerX - clampedLeft)),
    });
    setSelectedEventForPopup(ev);
  };

  const closePopup = () => {
    setSelectedEventForPopup(null);
    setPopupPosition(null);
  };

  // 1. Costruzione dei 7 giorni della settimana (da Lunedì a Domenica)
  const daysOfWeekData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = formatDateString(d);
      return {
        nameShort: DAY_NAMES_SHORT[i],
        dayNum: d.getDate(),
        monthNum: d.getMonth() + 1,
        dateStr,
      };
    });
  }, [monday]);

  // 2. Calcolo del layout eventi e task tramite l'utility di sistema
  const computedWeekData: ComputedDayData[] = useMemo(() => {
    return computeWeekLayout(daysOfWeekData, events, tasks);
  }, [daysOfWeekData, events, tasks]);

  return {
    todayStr,
    computedWeekData,
    selectedEventForPopup,
    popupPosition,
    handleEventClick,
    closePopup,
  };
};
