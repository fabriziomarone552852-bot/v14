// frontend/src/components/dashboard/weather/WeatherScenePrimitives.tsx
import React, { useId } from 'react';

export type CloudVariant = 'wide' | 'puffy' | 'compact';

export const WEATHER_KEYFRAMES_CSS = `
  @keyframes sunPulse {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 14px rgba(251, 191, 36, 0.75)); }
    50% { transform: scale(1.06); filter: drop-shadow(0 0 24px rgba(245, 158, 11, 0.9)); }
  }
  @keyframes sunRayRotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes cloudDriftSlow {
    0%, 100% { transform: translateX(-18px); }
    50% { transform: translateX(18px); }
  }
  @keyframes cloudDriftReverse {
    0%, 100% { transform: translateX(22px); }
    50% { transform: translateX(-22px); }
  }
  @keyframes cloudDriftGentle {
    0%, 100% { transform: translateX(-12px); }
    50% { transform: translateX(14px); }
  }
  @keyframes fogSway {
    0%, 100% { transform: translateX(-6%); }
    50% { transform: translateX(6%); }
  }
  @keyframes fogSwayReverse {
    0%, 100% { transform: translateX(5%); }
    50% { transform: translateX(-5%); }
  }
  @keyframes rainfall {
    0% { transform: translate3d(0, 0, 0) rotate(12deg); }
    100% { transform: translate3d(-24px, 116px, 0) rotate(12deg); }
  }
  @keyframes rainfallStorm {
    0% { transform: translate3d(0, 0, 0) rotate(16deg); }
    100% { transform: translate3d(-34px, 118px, 0) rotate(16deg); }
  }
  @keyframes thunderFlashSky {
    0%, 86%, 93%, 100% { opacity: 0; }
    87% { opacity: 0.45; }
    89% { opacity: 0.1; }
    90% { opacity: 0.65; }
  }
  @keyframes thunderBoltAppear {
    0%, 86%, 93%, 100% { opacity: 0; }
    87%, 88% { opacity: 1; }
    89% { opacity: 0; }
    90%, 92% { opacity: 1; }
  }
  @keyframes snowfallLeft {
    0% { transform: translate3d(0, 0, 0); }
    25% { transform: translate3d(-8px, 27px, 0); }
    50% { transform: translate3d(-3px, 54px, 0); }
    75% { transform: translate3d(7px, 81px, 0); }
    100% { transform: translate3d(2px, 108px, 0); }
  }
  @keyframes snowfallRight {
    0% { transform: translate3d(0, 0, 0); }
    25% { transform: translate3d(9px, 27px, 0); }
    50% { transform: translate3d(3px, 54px, 0); }
    75% { transform: translate3d(-8px, 81px, 0); }
    100% { transform: translate3d(-2px, 108px, 0); }
  }
  @keyframes starTwinkle {
    0%, 100% { transform: scale(0.85); }
    50% { transform: scale(1.25); }
  }
`;

interface OpaqueCloudProps {
  variant?: CloudVariant;
  fill: string;
  className?: string;
  style?: React.CSSProperties;
  shadow?: 'none' | 'soft' | 'dark';
  flip?: boolean;
}

const CLOUD_GEOMETRY: Record<CloudVariant, { viewBox: string; path: string }> = {
  puffy: {
    viewBox: '0 0 240 88',
    path: 'M 32,76 C 16,76 8,66 8,54 C 8,41 18,32 32,32 C 36,18 51,10 68,12 C 78,4 98,2 114,12 C 126,4 148,6 158,20 C 170,16 185,22 190,34 C 206,34 218,44 218,56 C 218,68 206,76 190,76 Z',
  },
  wide: {
    viewBox: '0 0 320 92',
    path: 'M 36,80 C 18,80 8,70 8,59 C 8,48 19,40 34,40 C 40,24 58,15 78,19 C 92,6 118,4 136,16 C 152,6 180,8 194,22 C 210,14 234,17 244,32 C 256,28 272,33 278,44 C 294,44 306,52 306,62 C 306,72 294,80 278,80 Z',
  },
  compact: {
    viewBox: '0 0 184 78',
    path: 'M 30,68 C 16,68 8,59 8,48 C 8,37 17,29 30,29 C 36,14 54,6 74,11 C 88,3 112,6 122,21 C 134,18 147,24 151,35 C 163,36 172,44 172,52 C 172,61 162,68 148,68 Z',
  },
};

const SHADOW_FILTERS: Record<NonNullable<OpaqueCloudProps['shadow']>, string | undefined> = {
  none: undefined,
  soft: 'drop-shadow(0 4px 8px rgba(15, 23, 42, 0.16))',
  dark: 'drop-shadow(0 5px 10px rgba(2, 6, 23, 0.42))',
};

/**
 * Nuvola vettoriale 100% opaca: quando si sovrappone ad altre nuvole, sole o luna,
 * copre completamente gli elementi retrostanti senza alcuna trasparenza.
 */
export const OpaqueCloud: React.FC<OpaqueCloudProps> = ({
  variant = 'puffy',
  fill,
  className = '',
  style,
  shadow = 'soft',
  flip = false,
}) => {
  const { viewBox, path } = CLOUD_GEOMETRY[variant];
  const filter = SHADOW_FILTERS[shadow];

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={{
        ...style,
        filter,
      }}
      aria-hidden="true"
    >
      <path
        d={path}
        fill={fill}
        transform={flip ? `scale(-1, 1) translate(-${viewBox.split(' ')[2]}, 0)` : undefined}
      />
    </svg>
  );
};

interface HorizonHillsProps {
  backColor: string;
  frontColor: string;
  heightClass?: string;
  zIndexClass?: string;
}

/**
 * Doppio profilo collinare all'orizzonte completamente opaco (zero trasparenza tra i due livelli).
 */
export const HorizonHills: React.FC<HorizonHillsProps> = ({
  backColor,
  frontColor,
  heightClass = 'h-28',
  zIndexClass = 'z-20',
}) => (
  <svg
    className={`absolute bottom-0 inset-x-0 w-full ${heightClass} ${zIndexClass} pointer-events-none`}
    viewBox="0 0 800 120"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path d="M0,88 Q210,40 450,80 T800,58 L800,120 L0,120 Z" fill={backColor} />
    <path d="M0,104 Q300,66 565,95 T800,78 L800,120 L0,120 Z" fill={frontColor} />
  </svg>
);

const buildLitMoonSvgPath = (phase: number, illumination: number): string | null => {
  if (illumination <= 0.015) return null;
  if (illumination >= 0.985) {
    return 'M 32,8 A 24,24 0 1,1 32,56 A 24,24 0 1,1 32,8 Z';
  }

  const rx = Math.abs(Math.cos(phase * 2 * Math.PI)) * 24;
  const rxStr = rx.toFixed(2);

  if (phase < 0.5) {
    // Fase crescente (emisfero boreale): bordo destro illuminato
    const terminator = rx < 0.15
      ? 'L 32,8'
      : `A ${rxStr},24 0 0,${phase < 0.25 ? 0 : 1} 32,8`;
    return `M 32,8 A 24,24 0 0,1 32,56 ${terminator} Z`;
  }

  // Fase calante (emisfero boreale): bordo sinistro illuminato
  const terminator = rx < 0.15
    ? 'L 32,8'
    : `A ${rxStr},24 0 0,${phase <= 0.75 ? 0 : 1} 32,8`;
  return `M 32,8 A 24,24 0 0,0 32,56 ${terminator} Z`;
};

interface LunarMoonProps {
  phase: number;
  illumination: number;
  className?: string;
}

/**
 * Disco lunare vettoriale 100% opaco con terminatore astronomico reale (crescente/piena/calante/nuova)
 * e dettagli superficiali (mari lunari) sia sul lato in ombra cinerea sia sulla porzione illuminata.
 */
export const LunarMoon: React.FC<LunarMoonProps> = ({
  phase,
  illumination,
  className = 'top-2.5 right-16 w-16 h-16',
}) => {
  const clipId = useId();
  const litPath = buildLitMoonSvgPath(phase, illumination);
  const glowRadius = Math.round(6 + illumination * 12);
  const glowAlpha = (0.22 + illumination * 0.52).toFixed(2);

  return (
    <svg
      viewBox="0 0 64 64"
      className={`absolute pointer-events-none ${className}`}
      style={{
        filter: `drop-shadow(0 0 ${glowRadius}px rgba(254, 243, 199, ${glowAlpha}))`,
      }}
      aria-hidden="true"
    >
      {litPath && (
        <defs>
          <clipPath id={clipId}>
            <path d={litPath} />
          </clipPath>
        </defs>
      )}

      {/* Disco lunare solido 100% opaco (luce cinerea sul lato non illuminato: copre le stelle dietro) */}
      <circle cx="32" cy="32" r="24" fill="#1e293b" stroke="#334155" strokeWidth="1" />
      <circle cx="24" cy="24" r="5" fill="#0f172a" />
      <circle cx="38" cy="21" r="3.8" fill="#0f172a" />
      <circle cx="35" cy="38" r="6" fill="#0f172a" />
      <circle cx="22" cy="40" r="3.2" fill="#0f172a" />

      {/* Porzione illuminata dal Sole con mari lunari dorati */}
      {litPath && (
        <g clipPath={`url(#${clipId})`}>
          <path d={litPath} fill="#fef3c7" />
          <circle cx="24" cy="24" r="5" fill="#fde68a" />
          <circle cx="38" cy="21" r="3.8" fill="#fde68a" />
          <circle cx="35" cy="38" r="6" fill="#fde68a" />
          <circle cx="22" cy="40" r="3.2" fill="#fde68a" />
        </g>
      )}
    </svg>
  );
};

const NIGHT_STARS = [
  { top: '14%', left: '18%', delay: '0s', size: 3 },
  { top: '26%', left: '34%', delay: '1.1s', size: 2.5 },
  { top: '16%', left: '52%', delay: '2.2s', size: 3 },
  { top: '34%', left: '66%', delay: '0.7s', size: 2 },
  { top: '42%', left: '24%', delay: '1.7s', size: 2.5 },
  { top: '12%', left: '72%', delay: '2.8s', size: 3 },
  { top: '46%', left: '46%', delay: '1.4s', size: 2 },
  { top: '28%', left: '88%', delay: '0.4s', size: 2.5 },
] as const;

export const StarField: React.FC = () => (
  <>
    {NIGHT_STARS.map((s, idx) => (
      <div
        key={idx}
        className="absolute rounded-full bg-amber-50 shadow-[0_0_6px_#ffffff] z-[1]"
        style={{
          top: s.top,
          left: s.left,
          width: s.size,
          height: s.size,
          animation: `starTwinkle 3.2s ease-in-out infinite ${s.delay}`,
        }}
      />
    ))}
  </>
);
