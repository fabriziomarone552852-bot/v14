// frontend/src/components/navigation/agendaRoutes.ts

export const AGENDA_ROUTES = ['/', '/giorno', '/settimana', '/mese', '/anno'] as const;

/**
 * Restituisce true se il pathname corrente appartiene alle pagine Agenda desktop.
 */
export const isAgendaRoute = (pathname: string): boolean => {
  const normalized = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return (AGENDA_ROUTES as readonly string[]).includes(normalized);
};
