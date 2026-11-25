// frontend/src/components/dashboard/weather/WeatherAtmosphereCard.tsx
import React, { useMemo } from 'react';
import { useWeather } from '@/hooks/useWeather';
import { getWeatherDescription } from '@/utils/weatherUtils';
import fairytaleHill from '@/assets/fairytale-hill.svg';

type WeatherAtmosphereType =
  | 'clear_day'
  | 'clear_night'
  | 'partly_cloudy_day'
  | 'partly_cloudy_night'
  | 'cloudy'
  | 'fog'
  | 'rain'
  | 'thunder'
  | 'snow';

interface AtmosphereConfig {
  type: WeatherAtmosphereType;
  bgGradient: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  label: string;
}

export const WeatherAtmosphereCard: React.FC = () => {
  const { current, cityName, isWeatherEnabled, isLoading } = useWeather();

  const symbolCode = current?.symbol_code;
  const temp = typeof current?.temperature === 'number' ? Math.round(current.temperature) : null;
  const weatherDesc = isLoading && !current
    ? 'Caricamento...'
    : getWeatherDescription(symbolCode, current?.weather_code);

  const atmosphere: AtmosphereConfig = useMemo(() => {
    if (!symbolCode) {
      return {
        type: 'clear_day',
        bgGradient: 'from-sky-400 via-sky-300 to-amber-100',
        badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-200/60',
        badgeText: 'text-amber-900',
        icon: '☀️',
        label: 'Sereno',
      };
    }

    const code = symbolCode.toLowerCase();

    // 1. Temporale
    if (code.includes('thunder')) {
      return {
        type: 'thunder',
        bgGradient: 'from-slate-950 via-slate-900 to-indigo-950',
        badgeBg: 'bg-indigo-900/80 text-amber-300 border-indigo-700/60',
        badgeText: 'text-amber-300',
        icon: '⛈️',
        label: 'Temporale',
      };
    }

    // 2. Neve o nevischio
    if (code.includes('snow') || code.includes('sleet')) {
      return {
        type: 'snow',
        bgGradient: 'from-slate-800 via-blue-900 to-sky-950',
        badgeBg: 'bg-sky-900/80 text-cyan-200 border-sky-700/60',
        badgeText: 'text-cyan-200',
        icon: '❄️',
        label: 'Neve',
      };
    }

    // 3. Pioggia
    if (code.includes('rain')) {
      return {
        type: 'rain',
        bgGradient: 'from-slate-800 via-slate-700 to-blue-900',
        badgeBg: 'bg-slate-900/80 text-blue-200 border-blue-800/60',
        badgeText: 'text-blue-200',
        icon: '🌧️',
        label: code.includes('heavy') ? 'Forte Pioggia' : 'Pioggia',
      };
    }

    // 4. Nebbia / Foschia
    if (code.includes('fog')) {
      return {
        type: 'fog',
        bgGradient: 'from-slate-400 via-slate-300 to-stone-400',
        badgeBg: 'bg-slate-200/90 text-slate-800 border-slate-300',
        badgeText: 'text-slate-800',
        icon: '🌫️',
        label: 'Nebbia o Foschia',
      };
    }

    // 5. Nuvoloso / Coperto
    if (code.includes('cloudy') && !code.includes('partly')) {
      return {
        type: 'cloudy',
        bgGradient: 'from-slate-500 via-slate-400 to-gray-300',
        badgeBg: 'bg-slate-200/90 text-slate-800 border-slate-300',
        badgeText: 'text-slate-800',
        icon: '☁️',
        label: 'Coperto',
      };
    }

    // 6. Parzialmente nuvoloso giorno / notte
    if (code.includes('partlycloudy')) {
      if (code.includes('night')) {
        return {
          type: 'partly_cloudy_night',
          bgGradient: 'from-slate-900 via-indigo-950 to-slate-800',
          badgeBg: 'bg-indigo-950/80 text-indigo-200 border-indigo-800/60',
          badgeText: 'text-indigo-200',
          icon: '☁️🌙',
          label: 'Nubi sparse (Notte)',
        };
      }
      return {
        type: 'partly_cloudy_day',
        bgGradient: 'from-sky-400 via-sky-300 to-blue-200',
        badgeBg: 'bg-white/80 text-sky-900 border-sky-200',
        badgeText: 'text-sky-900',
        icon: '⛅',
        label: 'Parzialmente Nuvoloso',
      };
    }

    // 7. Sereno Notte
    if (code.includes('night')) {
      return {
        type: 'clear_night',
        bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
        badgeBg: 'bg-slate-900/80 text-amber-200 border-indigo-900/60',
        badgeText: 'text-amber-200',
        icon: '🌙',
        label: 'Sereno (Notte)',
      };
    }

    // 8. Sereno Giorno (Default)
    return {
      type: 'clear_day',
      bgGradient: 'from-sky-400 via-sky-300 to-amber-100',
      badgeBg: 'bg-white/85 text-amber-900 border-amber-200/60',
      badgeText: 'text-amber-900',
      icon: '☀️',
      label: 'Sereno',
    };
  }, [symbolCode]);

  // Se il meteo è disattivato dall'utente nelle Impostazioni, mostriamo l'Oasi Naturale originale
  if (!isWeatherEnabled) {
    return (
      <div className="xl:col-span-7 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-white rounded-xl shadow-sm border border-gray-200 h-full relative overflow-hidden flex items-end justify-end group">
        <div className="absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-emerald-50/70 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-3.5 left-4 z-20 pointer-events-none opacity-85">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-lg backdrop-blur-xs shadow-2xs">
            🌸 Oasi di Ispirazione & Focus
          </span>
        </div>
        <img
          src={fairytaleHill}
          alt="Collina fatata fiorita"
          className="h-full w-full object-cover object-right-bottom drop-shadow-xs transition-transform duration-700 ease-out group-hover:scale-[1.02] select-none"
        />
      </div>
    );
  }

  return (
    <div className={`xl:col-span-7 bg-gradient-to-r ${atmosphere.bgGradient} rounded-xl shadow-sm border border-gray-200/80 h-full relative overflow-hidden flex items-center justify-center select-none group transition-all duration-700`}>
      {/* Stili CSS con animazioni fluide a 60fps isolate */}
      <style>{`
        @keyframes sunPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.7)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 28px rgba(245, 158, 11, 0.9)); }
        }
        @keyframes sunRayRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes cloudDriftSlow {
          0% { transform: translateX(-15%); }
          50% { transform: translateX(15%); }
          100% { transform: translateX(-15%); }
        }
        @keyframes cloudDriftFast {
          0% { transform: translateX(20%); }
          50% { transform: translateX(-20%); }
          100% { transform: translateX(20%); }
        }
        @keyframes fogSway {
          0%, 100% { transform: translateX(-8%) scaleY(1); opacity: 0.65; }
          50% { transform: translateX(8%) scaleY(1.06); opacity: 0.85; }
        }
        @keyframes fogSwayReverse {
          0%, 100% { transform: translateX(6%) scaleY(1.04); opacity: 0.55; }
          50% { transform: translateX(-6%) scaleY(0.96); opacity: 0.75; }
        }
        @keyframes rainfall {
          0% { transform: translateY(-30px) rotate(15deg); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(160px) rotate(15deg); opacity: 0.2; }
        }
        @keyframes thunderFlash {
          0%, 88%, 92%, 100% { opacity: 0; }
          89% { opacity: 0.75; }
          90% { opacity: 0.2; }
          91% { opacity: 0.9; }
        }
        @keyframes snowfall {
          0% { transform: translate3d(0, -20px, 0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translate3d(25px, 160px, 0) rotate(360deg); opacity: 0.2; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      {/* Sfumatura bordo sinistro per armonizzarla con la card della citazione */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white/30 to-transparent z-10 pointer-events-none" />

      {/* Badge Sovraimposto: Località, Temperatura e Stato */}
      <div className="absolute top-3 left-4 z-20 pointer-events-none">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg backdrop-blur-md shadow-xs border text-[11px] font-bold ${atmosphere.badgeBg}`}>
          <span className="text-sm">{atmosphere.icon}</span>
          <span className="font-extrabold tracking-wide uppercase">
            {cityName || 'Meteo'}
          </span>
          {temp !== null && (
            <span className="font-black px-1.5 py-0.2 rounded bg-black/10">
              {temp}°C
            </span>
          )}
          <span className="font-medium opacity-90 hidden sm:inline">
            • {weatherDesc}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCENARIO 1: SERENO GIORNO                                    */}
      {/* ============================================================ */}
      {atmosphere.type === 'clear_day' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sole splendente con alone luminoso pulsante */}
          <div
            className="absolute -top-4 right-16 w-32 h-32 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 opacity-90"
            style={{ animation: 'sunPulse 6s ease-in-out infinite' }}
          >
            {/* Raggi solari rotanti */}
            <div
              className="absolute inset-[-18px] rounded-full border border-amber-300/40 border-dashed"
              style={{ animation: 'sunRayRotate 40s linear infinite' }}
            />
          </div>

          {/* Colline verdi soleggiate all'orizzonte */}
          <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-emerald-500/80" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,90 Q200,40 420,80 T800,60 L800,120 L0,120 Z" fill="currentColor" opacity="0.6" />
            <path d="M0,105 Q300,65 560,95 T800,80 L800,120 L0,120 Z" fill="#059669" opacity="0.9" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 2: SERENO NOTTE                                     */}
      {/* ============================================================ */}
      {atmosphere.type === 'clear_night' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Cielo stellato con stelle scintillanti */}
          {[
            { top: '15%', left: '20%', delay: '0s', size: 3 },
            { top: '25%', left: '45%', delay: '1.2s', size: 2 },
            { top: '18%', left: '70%', delay: '2.4s', size: 3.5 },
            { top: '35%', left: '85%', delay: '0.8s', size: 2 },
            { top: '40%', left: '30%', delay: '1.8s', size: 2.5 },
            { top: '10%', left: '60%', delay: '3.1s', size: 3 },
            { top: '50%', left: '15%', delay: '2.1s', size: 2 },
            { top: '30%', left: '75%', delay: '1.5s', size: 3 },
          ].map((s, idx) => (
            <div
              key={idx}
              className="absolute rounded-full bg-white shadow-[0_0_6px_#fff]"
              style={{
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                animation: `starTwinkle 3s ease-in-out infinite ${s.delay}`,
              }}
            />
          ))}

          {/* Luna crescente argentata con alone morbido */}
          <div className="absolute top-4 right-16 w-14 h-14 rounded-full bg-amber-100/90 shadow-[0_0_24px_rgba(254,243,199,0.7)] flex items-center justify-center">
            <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-slate-900" />
          </div>

          {/* Colline scure notturne */}
          <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-slate-900/90" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,90 Q220,50 460,85 T800,65 L800,120 L0,120 Z" fill="#0f172a" opacity="0.75" />
            <path d="M0,105 Q320,70 580,100 T800,85 L800,120 L0,120 Z" fill="#020617" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 3: PARZIALMENTE NUVOLOSO (Giorno / Notte)          */}
      {/* ============================================================ */}
      {(atmosphere.type === 'partly_cloudy_day' || atmosphere.type === 'partly_cloudy_night') && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sole o Luna sullo sfondo */}
          <div className="absolute top-2 right-20 w-20 h-20 rounded-full bg-amber-300/90 shadow-[0_0_20px_rgba(252,211,77,0.6)]" />

          {/* Nuvole soffici a doppio strato */}
          <svg
            className="absolute top-4 left-1/4 w-72 text-white/70"
            viewBox="0 0 200 80"
            style={{ animation: 'cloudDriftSlow 32s ease-in-out infinite' }}
          >
            <path d="M20,60 Q30,30 60,35 Q80,15 110,25 Q140,10 160,35 Q190,40 180,60 Z" fill="currentColor" />
          </svg>
          <svg
            className="absolute top-10 right-10 w-80 text-white/85"
            viewBox="0 0 200 80"
            style={{ animation: 'cloudDriftFast 26s ease-in-out infinite' }}
          >
            <path d="M25,65 Q40,35 70,40 Q95,15 125,30 Q150,20 175,45 Q195,50 185,65 Z" fill="currentColor" />
          </svg>

          {/* Orizzonte collinare */}
          <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-emerald-600/70" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,95 Q250,55 480,90 T800,75 L800,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 4: COPERTO / NUVOLOSO                               */}
      {/* ============================================================ */}
      {atmosphere.type === 'cloudy' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Nuvole dense e stratificate */}
          <svg
            className="absolute top-0 inset-x-0 w-[130%] text-slate-300/60"
            viewBox="0 0 600 140"
            style={{ animation: 'cloudDriftSlow 35s ease-in-out infinite' }}
          >
            <path d="M0,80 Q100,20 220,50 Q320,10 440,60 Q540,25 600,70 L600,140 L0,140 Z" fill="currentColor" />
          </svg>
          <svg
            className="absolute top-6 inset-x-0 w-[125%] text-slate-200/75"
            viewBox="0 0 600 140"
            style={{ animation: 'cloudDriftFast 28s ease-in-out infinite' }}
          >
            <path d="M0,90 Q120,40 260,75 Q380,30 500,80 L600,90 L600,140 L0,140 Z" fill="currentColor" />
          </svg>

          {/* Orizzonte grigio-verde */}
          <svg className="absolute bottom-0 inset-x-0 h-24 w-full text-slate-600/60" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,100 Q260,65 520,95 T800,85 L800,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 5: FOSCHIA / NEBBIA (Richiesta Esplicita Utente)      */}
      {/* ============================================================ */}
      {atmosphere.type === 'fog' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Sagome misteriose di colline e alberi immerse nella nebbia */}
          <svg className="absolute bottom-0 inset-x-0 h-32 w-full text-slate-500/40" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,80 Q220,35 480,75 T800,50 L800,120 L0,120 Z" fill="currentColor" />
          </svg>

          {/* Banchi di nebbia orizzontali fluttuanti con onde morbide e backdrop-blur */}
          <div
            className="absolute inset-x-[-15%] top-4 h-16 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full blur-md"
            style={{ animation: 'fogSway 14s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-x-[-10%] top-14 h-20 bg-gradient-to-r from-transparent via-slate-100/80 to-transparent rounded-full blur-lg"
            style={{ animation: 'fogSwayReverse 18s ease-in-out infinite' }}
          />
          <div
            className="absolute inset-x-[-20%] bottom-0 h-24 bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full blur-md"
            style={{ animation: 'fogSway 12s ease-in-out infinite 2s' }}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 6: PIOGGIA / ROVESCI                                 */}
      {/* ============================================================ */}
      {atmosphere.type === 'rain' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Nuvole scure cariche di pioggia in alto */}
          <div className="absolute -top-10 inset-x-0 h-28 bg-gradient-to-b from-slate-900/80 via-slate-800/50 to-transparent" />

          {/* Gocce di pioggia animate che cadono a cascata */}
          {[
            { left: '10%', delay: '0s', dur: '0.65s' },
            { left: '18%', delay: '0.2s', dur: '0.7s' },
            { left: '26%', delay: '0.4s', dur: '0.6s' },
            { left: '34%', delay: '0.1s', dur: '0.75s' },
            { left: '42%', delay: '0.35s', dur: '0.62s' },
            { left: '50%', delay: '0.05s', dur: '0.68s' },
            { left: '58%', delay: '0.25s', dur: '0.72s' },
            { left: '66%', delay: '0.45s', dur: '0.58s' },
            { left: '74%', delay: '0.15s', dur: '0.66s' },
            { left: '82%', delay: '0.3s', dur: '0.7s' },
            { left: '90%', delay: '0.5s', dur: '0.64s' },
          ].map((d, idx) => (
            <div
              key={idx}
              className="absolute top-0 w-[1.5px] h-8 bg-gradient-to-b from-transparent via-blue-200 to-white/90 rounded-full"
              style={{
                left: d.left,
                animation: `rainfall ${d.dur} linear infinite ${d.delay}`,
              }}
            />
          ))}

          {/* Sagoma colline bagnate */}
          <svg className="absolute bottom-0 inset-x-0 h-24 w-full text-slate-900/70" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,95 Q240,65 500,90 T800,80 L800,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 7: TEMPORALE CON LAMPI                              */}
      {/* ============================================================ */}
      {atmosphere.type === 'thunder' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Bagliore del lampo intermittente a schermo */}
          <div
            className="absolute inset-0 bg-indigo-100 mix-blend-screen"
            style={{ animation: 'thunderFlash 7s infinite' }}
          />

          {/* Pioggia battente fitta */}
          {[12, 22, 32, 42, 52, 62, 72, 82, 92].map((pos, idx) => (
            <div
              key={idx}
              className="absolute top-0 w-[2px] h-10 bg-gradient-to-b from-transparent via-indigo-200 to-white rounded-full"
              style={{
                left: `${pos}%`,
                animation: `rainfall 0.5s linear infinite ${idx * 0.08}s`,
              }}
            />
          ))}

          {/* Fulmine stilizzato che compare con il lampo */}
          <svg
            className="absolute top-2 right-1/3 w-16 h-28 text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.9)]"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ animation: 'thunderFlash 7s infinite' }}
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>

          {/* Orizzonte tempestoso scuro */}
          <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-black" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,100 Q260,70 520,95 T800,85 L800,120 L0,120 Z" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ============================================================ */}
      {/* SCENARIO 8: NEVE SOFFICE                                     */}
      {/* ============================================================ */}
      {atmosphere.type === 'snow' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Fiocchi di neve che scendono lenti e oscillanti */}
          {[
            { left: '12%', size: 4, dur: '3.5s', delay: '0s' },
            { left: '24%', size: 6, dur: '4.2s', delay: '1s' },
            { left: '36%', size: 3.5, dur: '3.2s', delay: '1.8s' },
            { left: '48%', size: 5, dur: '4.6s', delay: '0.4s' },
            { left: '60%', size: 3, dur: '3.8s', delay: '2.2s' },
            { left: '72%', size: 5.5, dur: '4.1s', delay: '1.2s' },
            { left: '84%', size: 4, dur: '3.6s', delay: '0.8s' },
            { left: '94%', size: 3, dur: '4.5s', delay: '2.5s' },
          ].map((flake, idx) => (
            <div
              key={idx}
              className="absolute top-0 rounded-full bg-white shadow-[0_0_5px_#fff]"
              style={{
                left: flake.left,
                width: flake.size,
                height: flake.size,
                animation: `snowfall ${flake.dur} linear infinite ${flake.delay}`,
              }}
            />
          ))}

          {/* Colline innevate candide alla base */}
          <svg className="absolute bottom-0 inset-x-0 h-28 w-full text-slate-100" viewBox="0 0 800 120" preserveAspectRatio="none">
            <path d="M0,90 Q220,50 460,85 T800,65 L800,120 L0,120 Z" fill="#e2e8f0" opacity="0.8" />
            <path d="M0,105 Q300,70 560,95 T800,80 L800,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>
      )}
    </div>
  );
};
