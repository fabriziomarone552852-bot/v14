// frontend/src/components/dashboard/weather/WeatherAtmosphereScenes.tsx
import React from 'react';
import type { WeatherAtmosphereType } from './weatherAtmosphereTypes';
import type { MoonPhaseInfo } from '@/utils/moonPhaseUtils';
import {
  HorizonHills,
  LunarMoon,
  OpaqueCloud,
  StarField,
} from './WeatherScenePrimitives';
import {
  RAIN_DROPS,
  SNOW_FLAKES,
  THUNDER_DROPS,
} from './weatherParticlesData';

interface WeatherAtmosphereSceneProps {
  type: WeatherAtmosphereType;
  moonPhase: MoonPhaseInfo;
}

export const WeatherAtmosphereScene: React.FC<WeatherAtmosphereSceneProps> = ({
  type,
  moonPhase,
}) => {
  switch (type) {
    case 'clear_day':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-3 right-16 w-28 h-28 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 z-[1]"
            style={{ animation: 'sunPulse 6s ease-in-out infinite' }}
          >
            <div
              className="absolute inset-[-14px] rounded-full border-2 border-amber-300 border-dashed"
              style={{ animation: 'sunRayRotate 40s linear infinite' }}
            />
          </div>
          <HorizonHills backColor="#10b981" frontColor="#059669" heightClass="h-28" zIndexClass="z-10" />
        </div>
      );

    case 'clear_night':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <StarField />
          <LunarMoon
            phase={moonPhase.phase}
            illumination={moonPhase.illumination}
            className="top-2 right-16 w-16 h-16 z-[2]"
          />
          <HorizonHills backColor="#1e293b" frontColor="#020617" heightClass="h-28" zIndexClass="z-10" />
        </div>
      );

    case 'partly_cloudy_day':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-2 right-20 w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 shadow-[0_0_22px_rgba(251,191,36,0.75)] z-[1]"
            style={{ animation: 'sunPulse 7s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#e2e8f0"
            shadow="soft"
            className="absolute top-4 left-[20%] w-60 z-[2]"
            style={{ animation: 'cloudDriftSlow 32s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#ffffff"
            shadow="soft"
            className="absolute top-6 right-8 w-72 z-[3]"
            style={{ animation: 'cloudDriftReverse 26s ease-in-out infinite' }}
          />
          <HorizonHills backColor="#10b981" frontColor="#059669" heightClass="h-24" zIndexClass="z-10" />
        </div>
      );

    case 'partly_cloudy_night':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <StarField />
          <LunarMoon
            phase={moonPhase.phase}
            illumination={moonPhase.illumination}
            className="top-2 right-20 w-16 h-16 z-[2]"
          />
          <OpaqueCloud
            variant="puffy"
            fill="#334155"
            shadow="dark"
            className="absolute top-4 left-[20%] w-60 z-[3]"
            style={{ animation: 'cloudDriftSlow 32s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#475569"
            shadow="dark"
            className="absolute top-6 right-8 w-72 z-[4]"
            style={{ animation: 'cloudDriftReverse 26s ease-in-out infinite' }}
          />
          <HorizonHills backColor="#1e293b" frontColor="#020617" heightClass="h-24" zIndexClass="z-10" />
        </div>
      );

    case 'cloudy':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <OpaqueCloud
            variant="wide"
            fill="#94a3b8"
            shadow="none"
            className="absolute -top-3 left-[2%] w-72 z-[1]"
            style={{ animation: 'cloudDriftSlow 34s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#94a3b8"
            shadow="none"
            flip
            className="absolute -top-3 right-[2%] w-80 z-[1]"
            style={{ animation: 'cloudDriftSlow 38s ease-in-out infinite -10s' }}
          />

          <OpaqueCloud
            variant="wide"
            fill="#cbd5e1"
            shadow="soft"
            className="absolute top-1 left-[20%] w-80 z-[2]"
            style={{ animation: 'cloudDriftReverse 30s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#cbd5e1"
            shadow="soft"
            className="absolute top-2 right-[16%] w-64 z-[2]"
            style={{ animation: 'cloudDriftGentle 27s ease-in-out infinite -6s' }}
          />

          <OpaqueCloud
            variant="puffy"
            fill="#e2e8f0"
            shadow="soft"
            className="absolute top-6 left-[6%] w-60 z-[3]"
            style={{ animation: 'cloudDriftGentle 25s ease-in-out infinite -4s' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#f1f5f9"
            shadow="soft"
            className="absolute top-5 left-[37%] w-72 z-[3]"
            style={{ animation: 'cloudDriftSlow 24s ease-in-out infinite -8s' }}
          />
          <OpaqueCloud
            variant="compact"
            fill="#e2e8f0"
            shadow="soft"
            className="absolute top-7 right-[3%] w-52 z-[3]"
            style={{ animation: 'cloudDriftReverse 28s ease-in-out infinite -12s' }}
          />

          <HorizonHills backColor="#64748b" frontColor="#475569" heightClass="h-24" zIndexClass="z-10" />
        </div>
      );

    case 'fog':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <OpaqueCloud
            variant="wide"
            fill="#cbd5e1"
            shadow="none"
            className="absolute -top-2 left-[10%] w-72 z-[1]"
            style={{ animation: 'cloudDriftSlow 36s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#e2e8f0"
            shadow="soft"
            className="absolute top-1 right-[8%] w-80 z-[2]"
            style={{ animation: 'cloudDriftReverse 32s ease-in-out infinite' }}
          />

          <svg
            className="absolute bottom-0 inset-x-0 h-32 w-full z-[3]"
            viewBox="0 0 800 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,76 Q220,34 470,72 T800,48 L800,120 L0,120 Z" fill="#94a3b8" />
          </svg>

          <svg
            className="absolute bottom-7 -left-[12%] w-[124%] h-14 z-[4]"
            viewBox="0 0 800 60"
            preserveAspectRatio="none"
            style={{ animation: 'fogSway 16s ease-in-out infinite' }}
            aria-hidden="true"
          >
            <path
              d="M0,26 Q140,10 280,24 T560,20 T800,26 L800,60 L0,60 Z"
              fill="#e2e8f0"
            />
          </svg>

          <svg
            className="absolute bottom-0 inset-x-0 h-20 w-full z-[5]"
            viewBox="0 0 800 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,45 Q280,12 540,48 T800,28 L800,100 L0,100 Z" fill="#64748b" />
          </svg>

          <svg
            className="absolute -bottom-1 -left-[12%] w-[124%] h-9 z-[6]"
            viewBox="0 0 800 50"
            preserveAspectRatio="none"
            style={{ animation: 'fogSwayReverse 19s ease-in-out infinite' }}
            aria-hidden="true"
          >
            <path
              d="M0,22 Q180,6 360,22 T720,18 L800,22 L800,50 L0,50 Z"
              fill="#cbd5e1"
            />
          </svg>
        </div>
      );

    case 'rain':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gocce di pioggia con velocita, lunghezze e fasi sfasate che spuntano da sotto le nubi */}
          {RAIN_DROPS.map((d, idx) => (
            <div
              key={idx}
              className="absolute rounded-full z-[1]"
              style={{
                left: d.left,
                top: d.topPx,
                width: d.widthPx,
                height: d.heightPx,
                backgroundColor: d.color,
                animation: `rainfall ${d.dur} linear infinite ${d.delay}`,
              }}
            />
          ))}

          {/* Copertura nuvolosa piovosa continua in alto (100% opaca) */}
          <OpaqueCloud
            variant="wide"
            fill="#334155"
            shadow="dark"
            className="absolute -top-5 -left-4 w-80 z-[2]"
            style={{ animation: 'cloudDriftSlow 32s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#334155"
            shadow="dark"
            className="absolute -top-5 left-[31%] w-80 z-[2]"
            style={{ animation: 'cloudDriftGentle 34s ease-in-out infinite -6s' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#334155"
            shadow="dark"
            flip
            className="absolute -top-5 -right-4 w-80 z-[2]"
            style={{ animation: 'cloudDriftSlow 35s ease-in-out infinite -9s' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#475569"
            shadow="dark"
            className="absolute -top-3 left-[4%] w-64 z-[3]"
            style={{ animation: 'cloudDriftReverse 26s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#475569"
            shadow="dark"
            className="absolute -top-4 left-[29%] w-72 z-[3]"
            style={{ animation: 'cloudDriftGentle 28s ease-in-out infinite -4s' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#475569"
            shadow="dark"
            className="absolute -top-3 right-[4%] w-64 z-[3]"
            style={{ animation: 'cloudDriftReverse 29s ease-in-out infinite -8s' }}
          />

          <HorizonHills backColor="#1e293b" frontColor="#0f172a" heightClass="h-24" zIndexClass="z-10" />
        </div>
      );

    case 'thunder':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Bagliore intermittente nel cielo */}
          <div
            className="absolute inset-0 bg-indigo-200 z-[1]"
            style={{ animation: 'thunderFlashSky 7s infinite' }}
          />

          {/* Pioggia battente casuale (durate, spaziature, lunghezze e delay incoerenti) */}
          {THUNDER_DROPS.map((d, idx) => (
            <div
              key={idx}
              className="absolute rounded-full z-[2]"
              style={{
                left: d.left,
                top: d.topPx,
                width: d.widthPx,
                height: d.heightPx,
                backgroundColor: d.color,
                animation: `rainfallStorm ${d.dur} linear infinite ${d.delay}`,
              }}
            />
          ))}

          {/* Fulmine opaco che scocca direttamente dalla base delle nubi */}
          <svg
            className="absolute top-8 right-[30%] w-14 h-24 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.95)] z-[3]"
            viewBox="0 0 24 24"
            fill="#fbbf24"
            style={{ animation: 'thunderBoltAppear 7s infinite' }}
            aria-hidden="true"
          >
            <polygon points="13 2 4 13 12 13 10 22 20 10 12 10 13 2" />
          </svg>

          {/* Nubi temporalesche stratificate a copertura completa (100% opache) */}
          <OpaqueCloud
            variant="wide"
            fill="#1e293b"
            shadow="dark"
            className="absolute -top-5 -left-4 w-80 z-[4]"
            style={{ animation: 'cloudDriftSlow 30s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#1e293b"
            shadow="dark"
            className="absolute -top-5 left-[31%] w-80 z-[4]"
            style={{ animation: 'cloudDriftGentle 32s ease-in-out infinite -7s' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#1e293b"
            shadow="dark"
            flip
            className="absolute -top-5 -right-4 w-80 z-[4]"
            style={{ animation: 'cloudDriftSlow 34s ease-in-out infinite -11s' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#334155"
            shadow="dark"
            className="absolute -top-3 left-[4%] w-64 z-[5]"
            style={{ animation: 'cloudDriftReverse 25s ease-in-out infinite -3s' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#334155"
            shadow="dark"
            className="absolute -top-4 left-[29%] w-72 z-[5]"
            style={{ animation: 'cloudDriftReverse 23s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#334155"
            shadow="dark"
            className="absolute -top-3 right-[4%] w-64 z-[5]"
            style={{ animation: 'cloudDriftGentle 27s ease-in-out infinite -9s' }}
          />

          <HorizonHills backColor="#0f172a" frontColor="#020617" heightClass="h-24" zIndexClass="z-10" />
        </div>
      );

    case 'snow':
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Fiocchi di neve generati dietro la pancia delle nuvole (mai sul margine superiore) */}
          {SNOW_FLAKES.map((flake, idx) => (
            <div
              key={idx}
              className="absolute rounded-full shadow-[0_0_4px_#ffffff] z-[1]"
              style={{
                left: flake.left,
                top: flake.topPx,
                width: flake.size,
                height: flake.size,
                backgroundColor: flake.color,
                animation: `${flake.sway} ${flake.dur} linear infinite ${flake.delay}`,
              }}
            />
          ))}

          {/* Copertura nuvolosa invernale continua in alto da cui scendono i fiocchi */}
          <OpaqueCloud
            variant="wide"
            fill="#94a3b8"
            shadow="soft"
            className="absolute -top-5 -left-4 w-80 z-[2]"
            style={{ animation: 'cloudDriftSlow 36s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#94a3b8"
            shadow="soft"
            className="absolute -top-5 left-[31%] w-80 z-[2]"
            style={{ animation: 'cloudDriftGentle 38s ease-in-out infinite -8s' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#94a3b8"
            shadow="soft"
            flip
            className="absolute -top-5 -right-4 w-80 z-[2]"
            style={{ animation: 'cloudDriftSlow 34s ease-in-out infinite -14s' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#cbd5e1"
            shadow="soft"
            className="absolute -top-3 left-[3%] w-64 z-[3]"
            style={{ animation: 'cloudDriftReverse 30s ease-in-out infinite' }}
          />
          <OpaqueCloud
            variant="wide"
            fill="#e2e8f0"
            shadow="soft"
            className="absolute -top-4 left-[28%] w-72 z-[3]"
            style={{ animation: 'cloudDriftGentle 28s ease-in-out infinite -5s' }}
          />
          <OpaqueCloud
            variant="puffy"
            fill="#cbd5e1"
            shadow="soft"
            className="absolute -top-3 right-[3%] w-64 z-[3]"
            style={{ animation: 'cloudDriftReverse 32s ease-in-out infinite -10s' }}
          />

          <HorizonHills backColor="#cbd5e1" frontColor="#ffffff" heightClass="h-28" zIndexClass="z-10" />
        </div>
      );
  }
};
