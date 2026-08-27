export const CalendarIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
)

export const CalendarXIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 13l4 4m0-4l-4 4" />
    </svg>
)

export const CountdownIcon = ({ className = "w-5 h-5 text-blue-500" }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
)

// Icona Calendario Giorno — mostra il numero del giorno corrente
export const CalendarDayIcon = ({ className = "w-5 h-5", dayNumber }: { className?: string; dayNumber?: number }) => {
  const day = dayNumber ?? new Date().getDate();
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Corpo calendario */}
      <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      {/* Barra superiore */}
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
      {/* Anelli */}
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Numero del giorno */}
      <text x="12" y="17.5" textAnchor="middle" fill="currentColor" fontSize="8.5" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">{day}</text>
    </svg>
  );
};

// Icona Calendario Settimana — 7 colonne verticali
export const CalendarWeekIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo calendario */}
    <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    {/* Barra superiore */}
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
    {/* Anelli */}
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* 7 colonne per i giorni della settimana */}
    <line x1="5.6" y1="11.5" x2="5.6" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="8.2" y1="11.5" x2="8.2" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="10.8" y1="11.5" x2="10.8" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="13.2" y1="11.5" x2="13.2" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="15.8" y1="11.5" x2="15.8" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <line x1="18.4" y1="11.5" x2="18.4" y2="18.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

// Icona Calendario Mese — griglia 4+3 di quadratini
export const CalendarMonthIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo calendario */}
    <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    {/* Barra superiore */}
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
    {/* Anelli */}
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* Riga 1: 4 quadratini */}
    <rect x="5.5" y="11" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    <rect x="9" y="11" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    <rect x="12.8" y="11" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    <rect x="16.3" y="11" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    {/* Riga 2: 3 quadratini */}
    <rect x="5.5" y="15" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    <rect x="9" y="15" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
    <rect x="12.8" y="15" width="2.2" height="2.2" rx="0.4" fill="currentColor" />
  </svg>
);

// Icona Calendario Anno — 4 quadrati vuoti equidistanti (griglia 2x2)
export const CalendarYearIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Corpo calendario */}
    <rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    {/* Barra superiore */}
    <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.8" />
    {/* Anelli */}
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    {/* 4 quadrati vuoti equidistanti — 2x2 */}
    <rect x="6" y="11" width="4" height="3.5" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
    <rect x="14" y="11" width="4" height="3.5" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
    <rect x="6" y="16" width="4" height="3.5" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
    <rect x="14" y="16" width="4" height="3.5" rx="0.6" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

// Icona Orologio (Con orario)
export const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
  </svg>
);

// Icona Sole / Giorno (Tutto il giorno)
export const SunIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={2} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
  </svg>
);
