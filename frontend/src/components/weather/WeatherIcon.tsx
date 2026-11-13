// frontend/src/components/weather/WeatherIcon.tsx
import React from 'react';

interface WeatherIconProps {
  symbolCode?: string;
  className?: string;
  size?: number;
}

export const getWeatherDescription = (symbolCode?: string): string => {
  if (!symbolCode) return 'Meteo non disponibile';
  const code = symbolCode.toLowerCase();

  if (code.includes('clearsky')) {
    return code.includes('night') ? 'Sereno (notte)' : 'Sereno';
  }
  if (code.includes('fair')) {
    return code.includes('night') ? 'Poco nuvoloso (notte)' : 'Prevalentemente soleggiato';
  }
  if (code.includes('partlycloudy')) {
    return 'Parzialmente nuvoloso';
  }
  if (code.includes('thunder')) {
    return 'Temporale';
  }
  if (code.includes('snow')) {
    return code.includes('heavy') ? 'Forti nevicate' : 'Neve';
  }
  if (code.includes('sleet')) {
    return 'Nevischio';
  }
  if (code.includes('heavyrain')) {
    return 'Forte pioggia';
  }
  if (code.includes('lightrain') || code.includes('rainshowers')) {
    return 'Rovesci di pioggia';
  }
  if (code.includes('rain')) {
    return 'Pioggia';
  }
  if (code.includes('fog')) {
    return 'Nebbia o foschia';
  }
  if (code.includes('cloudy')) {
    return 'Nuvoloso';
  }
  return 'Variabile';
};

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  symbolCode = 'cloudy',
  className = 'w-6 h-6',
  size,
}) => {
  const code = symbolCode.toLowerCase();
  const style = size ? { width: size, height: size } : undefined;

  // 1. Sereno Giorno
  if (code === 'clearsky_day') {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-amber-500 shrink-0 ${className}`}
        style={style}
      >
        <circle cx="12" cy="12" r="5" fill="#f59e0b" stroke="#d97706" />
        <line x1="12" y1="1" x2="12" y2="3" stroke="#f59e0b" />
        <line x1="12" y1="21" x2="12" y2="23" stroke="#f59e0b" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#f59e0b" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#f59e0b" />
        <line x1="1" y1="12" x2="3" y2="12" stroke="#f59e0b" />
        <line x1="21" y1="12" x2="23" y2="12" stroke="#f59e0b" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#f59e0b" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#f59e0b" />
      </svg>
    );
  }

  // 2. Sereno Notte
  if (code.includes('clearsky_night') || code.includes('polartwilight')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-indigo-400 shrink-0 ${className}`}
        style={style}
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          fill="#818cf8"
          stroke="#6366f1"
        />
      </svg>
    );
  }

  // 3. Temporale
  if (code.includes('thunder')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-amber-500 shrink-0 ${className}`}
        style={style}
      >
        <path
          d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
          fill="#cbd5e1"
          stroke="#64748b"
        />
        <polygon points="13 11 9 17 14 17 11 23 18 15 13 15 15 11" fill="#eab308" stroke="#ca8a04" />
      </svg>
    );
  }

  // 4. Neve
  if (code.includes('snow') || code.includes('sleet')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-sky-300 shrink-0 ${className}`}
        style={style}
      >
        <path
          d="M17.5 17H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
          fill="#e2e8f0"
          stroke="#94a3b8"
        />
        <line x1="8" y1="19" x2="8" y2="21" stroke="#38bdf8" />
        <line x1="8" y1="20" x2="10" y2="20" stroke="#38bdf8" />
        <line x1="12" y1="19" x2="12" y2="21" stroke="#38bdf8" />
        <line x1="16" y1="19" x2="16" y2="21" stroke="#38bdf8" />
        <line x1="16" y1="20" x2="14" y2="20" stroke="#38bdf8" />
      </svg>
    );
  }

  // 5. Pioggia (debole, forte, rovesci)
  if (code.includes('rain')) {
    const isHeavy = code.includes('heavy');
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-blue-500 shrink-0 ${className}`}
        style={style}
      >
        <path
          d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
          fill="#cbd5e1"
          stroke="#64748b"
        />
        <line x1="8" y1="19" x2="7" y2="22" stroke="#0284c7" strokeWidth={isHeavy ? '2.5' : '2'} />
        <line x1="12" y1="19" x2="11" y2="22" stroke="#0284c7" strokeWidth={isHeavy ? '2.5' : '2'} />
        <line x1="16" y1="19" x2="15" y2="22" stroke="#0284c7" strokeWidth={isHeavy ? '2.5' : '2'} />
      </svg>
    );
  }

  // 6. Nebbia
  if (code.includes('fog')) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-slate-400 shrink-0 ${className}`}
        style={style}
      >
        <line x1="4" y1="7" x2="20" y2="7" stroke="#94a3b8" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="#94a3b8" />
        <line x1="5" y1="17" x2="19" y2="17" stroke="#94a3b8" />
      </svg>
    );
  }

  // 7. Parzialmente nuvoloso / Poco nuvoloso (sole + nuvola)
  if (code.includes('fair') || code.includes('partlycloudy')) {
    const isNight = code.includes('night');
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`shrink-0 ${className}`}
        style={style}
      >
        {isNight ? (
          <path
            d="M12 3a6 6 0 0 0 5 9.2A7 7 0 0 0 9.2 17"
            fill="#818cf8"
            stroke="#6366f1"
          />
        ) : (
          <circle cx="16" cy="7" r="4" fill="#fbbf24" stroke="#f59e0b" />
        )}
        <path
          d="M16 19H7a5 5 0 0 1-1-9.9 5.5 5.5 0 0 1 10.5-1.2A4.5 4.5 0 0 1 16 19Z"
          fill="#f1f5f9"
          stroke="#94a3b8"
        />
      </svg>
    );
  }

  // 8. Nuvoloso (default)
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`text-slate-400 shrink-0 ${className}`}
      style={style}
    >
      <path
        d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
        fill="#e2e8f0"
        stroke="#94a3b8"
      />
    </svg>
  );
};
