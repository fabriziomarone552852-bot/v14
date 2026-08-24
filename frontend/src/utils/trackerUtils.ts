import type { TrackerName, MoodType, SphereType } from '@/types';

export const TRACKER_COLORS: Record<TrackerName, string> = {
  // Moods
  'Gioia': '#FACC15',     // Giallo
  'Tristezza': '#3B82F6', // Blu
  'Rabbia': '#EF4444',    // Rosso
  'Disgusto': '#22C55E',  // Verde
  'Paura': '#A855F7',     // Viola

  // Sfere
  'Coppia': '#A855F7',    // Viola
  'Famiglia': '#78350F',  // Marrone
  'Amici': '#FACC15',     // Giallo
  'Svago': '#F97316',     // Arancione
  'Mente': '#EC4899',     // Rosa
  'Lavoro': '#3B82F6',    // Blu
  'Finanze': '#22C55E',   // Verde
  'Salute': '#EF4444',    // Rosso
};

// Funzione sicura per ottenere il colore
export const getTrackerColor = (name: TrackerName): string => {
  return TRACKER_COLORS[name] || '#9CA3AF'; // Grigio di fallback
};

/** Mappa nome leggibile → codice monthly_type (sostituisce i vecchi ID numerici). */
export const TRACKER_CODES: Record<TrackerName, MoodType | SphereType> = {
  'Gioia': 'MJ', 'Tristezza': 'MS', 'Rabbia': 'MA', 'Disgusto': 'MD', 'Paura': 'MT',
  'Coppia': 'SC', 'Famiglia': 'SF', 'Amici': 'SA', 'Svago': 'SD', 'Mente': 'SS',
  'Lavoro': 'SW', 'Finanze': 'SM', 'Salute': 'SH',
};