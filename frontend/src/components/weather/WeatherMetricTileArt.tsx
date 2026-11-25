// frontend/src/components/weather/WeatherMetricTileArt.tsx
import React from 'react';

export type WeatherMetricArtKind =
  | 'sunrise'
  | 'uv'
  | 'wind'
  | 'rain'
  | 'pressure'
  | 'clouds';

interface WeatherMetricTileArtProps {
  kind: WeatherMetricArtKind;
  /** Usato dal barometro per orientare l'ago in base alla pressione reale (hPa) */
  pressureHpa?: number | null;
}

export const WeatherMetricTileArt: React.FC<WeatherMetricTileArtProps> = ({
  kind,
  pressureHpa,
}) => {
  switch (kind) {
    case 'sunrise':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-rose-300 to-amber-200 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Alone luminoso */}
            <circle cx="70" cy="54" r="30" fill="#fef08a" opacity="0.35" />
            <circle cx="70" cy="54" r="20" fill="#fde047" opacity="0.65" />
            <circle cx="70" cy="54" r="13" fill="#fffbeb" opacity="0.95" />
            {/* Raggi morbidi */}
            <g stroke="#fef9c3" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
              <line x1="70" y1="22" x2="70" y2="28" />
              <line x1="46" y1="32" x2="51" y2="36" />
              <line x1="94" y1="32" x2="89" y2="36" />
              <line x1="36" y1="48" x2="43" y2="49" />
              <line x1="104" y1="48" x2="97" y2="49" />
            </g>
            {/* Colline all'orizzonte */}
            <path d="M0,62 Q38,48 76,58 T140,54 L140,90 L0,90 Z" fill="#9a3412" opacity="0.32" />
            <path d="M0,70 Q45,58 92,66 T140,62 L140,90 L0,90 Z" fill="#431407" opacity="0.45" />
          </svg>
        </div>
      );

    case 'uv':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-sky-400 via-sky-300 to-amber-200 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <circle cx="70" cy="36" r="26" fill="#fef08a" opacity="0.32" />
            <circle cx="70" cy="36" r="16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="70" cy="36" r="11" fill="#fef08a" opacity="0.7" />
            <g stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
              <line x1="70" y1="9" x2="70" y2="15" />
              <line x1="70" y1="57" x2="70" y2="62" />
              <line x1="43" y1="36" x2="49" y2="36" />
              <line x1="91" y1="36" x2="97" y2="36" />
              <line x1="51" y1="17" x2="55" y2="21" />
              <line x1="89" y1="17" x2="85" y2="21" />
              <line x1="51" y1="55" x2="55" y2="51" />
              <line x1="89" y1="55" x2="85" y2="51" />
            </g>
          </svg>
        </div>
      );

    case 'wind':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-sky-500 to-teal-300 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <g fill="none" stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M16,28 L88,28 C98,28 102,20 96,15 C91,11 84,15 86,20"
                strokeWidth="3"
                opacity="0.92"
              />
              <path
                d="M26,42 L108,42 C119,42 123,33 116,28 C110,24 103,29 105,34"
                strokeWidth="3.2"
                opacity="0.96"
              />
              <path
                d="M22,55 L74,55 C83,55 86,63 80,67 C75,70 69,66 71,62"
                strokeWidth="2.6"
                opacity="0.78"
              />
              <line x1="12" y1="36" x2="36" y2="36" strokeWidth="2" opacity="0.5" />
              <line x1="92" y1="52" x2="118" y2="52" strokeWidth="2" opacity="0.45" />
            </g>
          </svg>
        </div>
      );

    case 'rain':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 via-blue-700 to-sky-600 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Nuvola */}
            <path
              d="M42,40 L98,40 C107,40 113,34 113,27 C113,20 107,15 100,15 C98,9 91,6 84,8 C79,3 69,3 64,9 C57,8 50,12 48,19 C40,20 35,25 35,31 C35,36 38,40 42,40 Z"
              fill="#e2e8f0"
              opacity="0.92"
            />
            {/* Gocce di pioggia */}
            <g stroke="#bae6fd" strokeWidth="2.4" strokeLinecap="round">
              <line x1="48" y1="47" x2="43" y2="58" />
              <line x1="63" y1="49" x2="58" y2="62" />
              <line x1="78" y1="47" x2="73" y2="58" />
              <line x1="93" y1="49" x2="88" y2="62" />
              <line x1="55" y1="64" x2="52" y2="71" opacity="0.65" />
              <line x1="85" y1="64" x2="82" y2="71" opacity="0.65" />
            </g>
          </svg>
        </div>
      );

    case 'pressure': {
      // Mappa pressione tipica 980..1045 hPa in angolo ago -65°..+65°
      const clamped = typeof pressureHpa === 'number'
        ? Math.max(980, Math.min(1045, pressureHpa))
        : 1013;
      const needleDeg = ((clamped - 1012.5) / 32.5) * 65;

      return (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-slate-500 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Arco barometro */}
            <path
              d="M36,56 A34,34 0 1,1 104,56"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.3"
            />
            <path
              d="M44,53 A26,26 0 1,1 96,53"
              fill="none"
              stroke="#bfdbfe"
              strokeWidth="2"
              strokeDasharray="3 5"
              opacity="0.75"
            />
            {/* Ago dinamico */}
            <g transform={`rotate(${needleDeg} 70 48)`}>
              <line
                x1="70"
                y1="48"
                x2="70"
                y2="21"
                stroke="#fde047"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
            </g>
            <circle cx="70" cy="48" r="4.5" fill="#ffffff" />
            <circle cx="70" cy="48" r="2" fill="#4f46e5" />
          </svg>
        </div>
      );
    }

    case 'clouds':
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400 via-sky-300 to-slate-200 pointer-events-none">
          <svg
            viewBox="0 0 140 90"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {/* Nuvola sullo sfondo */}
            <path
              d="M16,42 L74,42 C82,42 87,36 87,30 C87,24 82,19 75,19 C72,12 64,9 57,12 C51,8 42,10 38,16 C30,16 24,22 24,29 C18,30 14,34 14,38 C14,40 15,42 16,42 Z"
              fill="#f8fafc"
              opacity="0.72"
            />
            {/* Nuvola in primo piano */}
            <path
              d="M42,58 L116,58 C125,58 131,51 131,43 C131,36 125,30 117,30 C114,22 105,18 96,21 C89,14 77,15 72,23 C63,22 54,28 53,37 C44,38 38,44 38,51 C38,55 40,58 42,58 Z"
              fill="#ffffff"
              opacity="0.95"
            />
          </svg>
        </div>
      );
  }
};
