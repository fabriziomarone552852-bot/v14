// frontend/src/components/dashboard/weather/weatherParticlesData.ts

export interface RainDropSpec {
  left: string;
  topPx: number;
  heightPx: number;
  widthPx: number;
  dur: string;
  delay: string;
  color: string;
}

export interface SnowFlakeSpec {
  left: string;
  topPx: number;
  size: number;
  dur: string;
  delay: string;
  sway: 'snowfallLeft' | 'snowfallRight';
  color: string;
}

/**
 * Gocce di pioggia con posizioni, lunghezze, durate coprime e delay negativi sparsi
 * per evitare qualsiasi effetto "onda sincronizzata" e farle emergere da sotto le nuvole.
 */
export const RAIN_DROPS: readonly RainDropSpec[] = [
  { left: '6%', topPx: 28, heightPx: 22, widthPx: 1.5, dur: '0.67s', delay: '-0.19s', color: '#bae6fd' },
  { left: '12.5%', topPx: 30, heightPx: 26, widthPx: 2, dur: '0.59s', delay: '-0.47s', color: '#e0f2fe' },
  { left: '17%', topPx: 27, heightPx: 18, widthPx: 1.5, dur: '0.79s', delay: '-0.08s', color: '#7dd3fc' },
  { left: '24%', topPx: 29, heightPx: 24, widthPx: 2, dur: '0.63s', delay: '-0.54s', color: '#bae6fd' },
  { left: '31.5%', topPx: 31, heightPx: 20, widthPx: 1.5, dur: '0.73s', delay: '-0.31s', color: '#e0f2fe' },
  { left: '37%', topPx: 28, heightPx: 27, widthPx: 2, dur: '0.57s', delay: '-0.12s', color: '#bae6fd' },
  { left: '44.5%', topPx: 27, heightPx: 17, widthPx: 1.5, dur: '0.83s', delay: '-0.66s', color: '#7dd3fc' },
  { left: '51%', topPx: 30, heightPx: 25, widthPx: 2, dur: '0.61s', delay: '-0.27s', color: '#e0f2fe' },
  { left: '56.5%', topPx: 28, heightPx: 19, widthPx: 1.5, dur: '0.76s', delay: '-0.59s', color: '#bae6fd' },
  { left: '63%', topPx: 31, heightPx: 26, widthPx: 2, dur: '0.58s', delay: '-0.05s', color: '#e0f2fe' },
  { left: '69.5%', topPx: 27, heightPx: 18, widthPx: 1.5, dur: '0.81s', delay: '-0.42s', color: '#7dd3fc' },
  { left: '75%', topPx: 29, heightPx: 24, widthPx: 2, dur: '0.64s', delay: '-0.23s', color: '#bae6fd' },
  { left: '82%', topPx: 30, heightPx: 21, widthPx: 1.5, dur: '0.71s', delay: '-0.51s', color: '#e0f2fe' },
  { left: '87.5%', topPx: 28, heightPx: 27, widthPx: 2, dur: '0.60s', delay: '-0.14s', color: '#bae6fd' },
  { left: '93%', topPx: 27, heightPx: 18, widthPx: 1.5, dur: '0.77s', delay: '-0.38s', color: '#7dd3fc' },
  { left: '98%', topPx: 30, heightPx: 23, widthPx: 2, dur: '0.66s', delay: '-0.61s', color: '#bae6fd' },
];

/**
 * Rovescio temporalesco caotico: 24 gocce con spaziature irregolari, velocità diverse (0.37s–0.68s),
 * sfasamenti negativi casuali e lunghezze miste per restituire una pioggia battente naturale.
 */
export const THUNDER_DROPS: readonly RainDropSpec[] = [
  { left: '5%', topPx: 28, heightPx: 32, widthPx: 2, dur: '0.43s', delay: '-0.31s', color: '#e0e7ff' },
  { left: '9.5%', topPx: 26, heightPx: 18, widthPx: 1.5, dur: '0.61s', delay: '-0.07s', color: '#a5b4fc' },
  { left: '14%', topPx: 30, heightPx: 28, widthPx: 2, dur: '0.39s', delay: '-0.24s', color: '#c7d2fe' },
  { left: '17.5%', topPx: 27, heightPx: 22, widthPx: 1.5, dur: '0.53s', delay: '-0.48s', color: '#a5b4fc' },
  { left: '23%', topPx: 31, heightPx: 35, widthPx: 2, dur: '0.37s', delay: '-0.13s', color: '#e0e7ff' },
  { left: '27.5%', topPx: 28, heightPx: 19, widthPx: 1.5, dur: '0.59s', delay: '-0.39s', color: '#c7d2fe' },
  { left: '32%', topPx: 29, heightPx: 30, widthPx: 2, dur: '0.46s', delay: '-0.04s', color: '#e0e7ff' },
  { left: '36.5%', topPx: 26, heightPx: 16, widthPx: 1.5, dur: '0.67s', delay: '-0.55s', color: '#a5b4fc' },
  { left: '41%', topPx: 30, heightPx: 33, widthPx: 2, dur: '0.41s', delay: '-0.29s', color: '#c7d2fe' },
  { left: '44.5%', topPx: 28, heightPx: 23, widthPx: 1.5, dur: '0.54s', delay: '-0.17s', color: '#e0e7ff' },
  { left: '49.5%', topPx: 27, heightPx: 18, widthPx: 1.5, dur: '0.63s', delay: '-0.44s', color: '#a5b4fc' },
  { left: '53.5%', topPx: 31, heightPx: 34, widthPx: 2, dur: '0.38s', delay: '-0.09s', color: '#e0e7ff' },
  { left: '58%', topPx: 29, heightPx: 24, widthPx: 1.5, dur: '0.51s', delay: '-0.36s', color: '#c7d2fe' },
  { left: '62.5%', topPx: 26, heightPx: 19, widthPx: 1.5, dur: '0.64s', delay: '-0.21s', color: '#a5b4fc' },
  { left: '67%', topPx: 30, heightPx: 32, widthPx: 2, dur: '0.42s', delay: '-0.33s', color: '#e0e7ff' },
  { left: '71%', topPx: 28, heightPx: 25, widthPx: 2, dur: '0.49s', delay: '-0.06s', color: '#c7d2fe' },
  { left: '75.5%', topPx: 27, heightPx: 17, widthPx: 1.5, dur: '0.66s', delay: '-0.52s', color: '#a5b4fc' },
  { left: '79.5%', topPx: 31, heightPx: 35, widthPx: 2, dur: '0.39s', delay: '-0.19s', color: '#e0e7ff' },
  { left: '84%', topPx: 28, heightPx: 22, widthPx: 1.5, dur: '0.56s', delay: '-0.41s', color: '#c7d2fe' },
  { left: '88%', topPx: 30, heightPx: 30, widthPx: 2, dur: '0.44s', delay: '-0.11s', color: '#e0e7ff' },
  { left: '91.5%', topPx: 26, heightPx: 18, widthPx: 1.5, dur: '0.62s', delay: '-0.47s', color: '#a5b4fc' },
  { left: '95.5%', topPx: 29, heightPx: 29, widthPx: 2, dur: '0.47s', delay: '-0.26s', color: '#c7d2fe' },
  { left: '99%', topPx: 28, heightPx: 24, widthPx: 1.5, dur: '0.52s', delay: '-0.15s', color: '#e0e7ff' },
  { left: '102%', topPx: 30, heightPx: 31, widthPx: 2, dur: '0.41s', delay: '-0.35s', color: '#c7d2fe' },
];

/**
 * Fiocchi di neve con origine nascosta dietro la pancia delle nuvole invernali (topPx: 34–40px)
 * e delay negativi, così spuntano sempre direttamente dalle nuvole e mai dal margine superiore.
 */
export const SNOW_FLAKES: readonly SnowFlakeSpec[] = [
  { left: '7%', topPx: 36, size: 4.5, dur: '3.7s', delay: '-1.2s', sway: 'snowfallRight', color: '#ffffff' },
  { left: '14%', topPx: 38, size: 6, dur: '4.4s', delay: '-2.9s', sway: 'snowfallLeft', color: '#f1f5f9' },
  { left: '21%', topPx: 35, size: 3.5, dur: '3.3s', delay: '-0.5s', sway: 'snowfallRight', color: '#ffffff' },
  { left: '28.5%', topPx: 39, size: 5.5, dur: '4.8s', delay: '-3.6s', sway: 'snowfallLeft', color: '#ffffff' },
  { left: '35%', topPx: 36, size: 4, dur: '3.9s', delay: '-1.8s', sway: 'snowfallRight', color: '#e2e8f0' },
  { left: '43%', topPx: 40, size: 6, dur: '4.2s', delay: '-0.9s', sway: 'snowfallLeft', color: '#ffffff' },
  { left: '50.5%', topPx: 35, size: 3.5, dur: '3.5s', delay: '-2.4s', sway: 'snowfallRight', color: '#f1f5f9' },
  { left: '58%', topPx: 38, size: 5, dur: '4.6s', delay: '-4.1s', sway: 'snowfallLeft', color: '#ffffff' },
  { left: '65%', topPx: 36, size: 4.5, dur: '3.8s', delay: '-1.5s', sway: 'snowfallRight', color: '#ffffff' },
  { left: '72.5%', topPx: 39, size: 6, dur: '4.3s', delay: '-3.2s', sway: 'snowfallLeft', color: '#e2e8f0' },
  { left: '79%', topPx: 35, size: 3.5, dur: '3.4s', delay: '-0.7s', sway: 'snowfallRight', color: '#ffffff' },
  { left: '86%', topPx: 38, size: 5, dur: '4.5s', delay: '-2.1s', sway: 'snowfallLeft', color: '#f1f5f9' },
  { left: '92.5%', topPx: 36, size: 4, dur: '3.9s', delay: '-3.4s', sway: 'snowfallRight', color: '#ffffff' },
];
