import type { 
  MoodType, 
  SphereType, 
  FixedMoodName, 
  FixedSphereName, 
  TrackerName 
} from '@/types/monthlyentries';

export const MOOD_TYPES: readonly MoodType[] = ['MJ', 'MS', 'MA', 'MD', 'MT'] as const;
export const SPHERE_TYPES: readonly SphereType[] = ['SC', 'SF', 'SA', 'SH', 'SS', 'SD', 'SM', 'SW'] as const;

export const MOOD_LABELS: Record<MoodType, FixedMoodName> = {
  MJ: 'Gioia', MS: 'Tristezza', MA: 'Rabbia', MD: 'Disgusto', MT: 'Paura',
};

export const SPHERE_LABELS: Record<SphereType, FixedSphereName> = {
  SC: 'Coppia', SF: 'Famiglia', SA: 'Amici', SH: 'Salute',
  SS: 'Mente', SD: 'Svago', SM: 'Finanze', SW: 'Lavoro',
};

export const MOOD_NAMES: readonly FixedMoodName[] = ['Gioia', 'Tristezza', 'Rabbia', 'Disgusto', 'Paura'] as const;
export const SPHERE_NAMES: readonly FixedSphereName[] = ['Coppia', 'Famiglia', 'Amici', 'Svago', 'Mente', 'Lavoro', 'Finanze', 'Salute'] as const;

export const MOOD_COLORS: Record<MoodType, string> = {
  MJ: '#FACC15',
  MS: '#3B82F6',
  MA: '#EF4444',
  MD: '#22C55E',
  MT: '#A855F7',
};

export const SPHERE_COLORS: Record<SphereType, string> = {
  SC: '#A855F7',
  SF: '#78350F',
  SA: '#FACC15',
  SH: '#EF4444',
  SS: '#EC4899',
  SD: '#F97316',
  SM: '#22C55E',
  SW: '#3B82F6',
};

export const TRACKER_COLORS: Record<TrackerName, string> = {
  // Moods
  'Gioia': '#FACC15',
  'Tristezza': '#3B82F6',
  'Rabbia': '#EF4444',
  'Disgusto': '#22C55E',
  'Paura': '#A855F7',

  // Sfere
  'Coppia': '#A855F7',
  'Famiglia': '#78350F',
  'Amici': '#FACC15',
  'Svago': '#F97316',
  'Mente': '#EC4899',
  'Lavoro': '#3B82F6',
  'Finanze': '#22C55E',
  'Salute': '#EF4444',
};

export const getTrackerColor = (name: TrackerName): string => {
  return TRACKER_COLORS[name] || '#9CA3AF';
};

export const TRACKER_CODES: Record<TrackerName, MoodType | SphereType> = {
  'Gioia': 'MJ', 'Tristezza': 'MS', 'Rabbia': 'MA', 'Disgusto': 'MD', 'Paura': 'MT',
  'Coppia': 'SC', 'Famiglia': 'SF', 'Amici': 'SA', 'Svago': 'SD', 'Mente': 'SS',
  'Lavoro': 'SW', 'Finanze': 'SM', 'Salute': 'SH',
};
