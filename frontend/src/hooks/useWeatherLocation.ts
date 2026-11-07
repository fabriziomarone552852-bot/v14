// frontend/src/hooks/useWeatherLocation.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import type { WeatherLocationPreference } from '@/types/weather';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import type { UserResponse } from '@/types/auth';

const STORAGE_KEY = 'vita_weather_preference';

const DEFAULT_PREFERENCE: WeatherLocationPreference = {
  enabled: true,
  cityName: 'Foggia',
  latitude: 41.4620,
  longitude: 15.5433,
  isAutoGeolocation: false,
};

export const useWeatherLocation = () => {
  const { user, updateUser } = useAuth();
  const hasInitializedFromUserRef = useRef(false);

  const [preference, setPreference] = useState<WeatherLocationPreference>(() => {
    // 1. Prova prima dal profilo dell'utente loggato su DB
    const dbWeather = user?.module_preferences?.weather as WeatherLocationPreference | undefined;
    if (dbWeather && typeof dbWeather.latitude === 'number' && typeof dbWeather.longitude === 'number') {
      return { ...DEFAULT_PREFERENCE, ...dbWeather };
    }

    // 2. Fallback su localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Se era il vecchio default temporaneo 'Roma', aggiorna al default 'Foggia'
        if (parsed.cityName === 'Roma' && Math.abs(parsed.latitude - 41.9028) < 0.01) {
          return DEFAULT_PREFERENCE;
        }
        return { ...DEFAULT_PREFERENCE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PREFERENCE;
  });

  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Allinea con il DB al caricamento dell'utente se disponibile
  useEffect(() => {
    if (!hasInitializedFromUserRef.current && user?.module_preferences?.weather) {
      const dbWeather = user.module_preferences.weather as WeatherLocationPreference;
      if (typeof dbWeather.latitude === 'number' && typeof dbWeather.longitude === 'number') {
        hasInitializedFromUserRef.current = true;
        setPreference((prev) => ({ ...prev, ...dbWeather }));
      }
    }
  }, [user?.module_preferences?.weather]);

  // Sincronizza su localStorage per resilienza offline e avvio a 0ms
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    } catch {
      // ignore
    }
  }, [preference]);

  // Salva sul database per l'utente loggato
  const saveToBackend = useCallback(async (newPref: WeatherLocationPreference) => {
    if (!user) return;
    try {
      const currentPrefs = user.module_preferences || {};
      const response = await apiClient.patch<UserResponse>('/users/me/settings', {
        module_preferences: {
          ...currentPrefs,
          weather: newPref,
        },
      });
      if (response?.data) {
        updateUser(response.data);
      }
    } catch (err) {
      console.warn('Impossibile salvare la preferenza meteo su DB:', err);
    }
  }, [user, updateUser]);

  const toggleEnabled = useCallback((enabled?: boolean) => {
    setPreference((prev) => {
      const nextPref: WeatherLocationPreference = {
        ...prev,
        enabled: typeof enabled === 'boolean' ? enabled : !prev.enabled,
      };
      saveToBackend(nextPref);
      return nextPref;
    });
  }, [saveToBackend]);

  const setManualLocation = useCallback((cityName: string, latitude: number, longitude: number) => {
    setPreference((prev) => {
      const nextPref: WeatherLocationPreference = {
        ...prev,
        cityName,
        latitude,
        longitude,
        isAutoGeolocation: false,
      };
      saveToBackend(nextPref);
      return nextPref;
    });
    setGeoError(null);
  }, [saveToBackend]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalizzazione non supportata dal tuo browser');
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;
        setPreference((prev) => {
          const nextPref: WeatherLocationPreference = {
            ...prev,
            latitude,
            longitude,
            cityName: prev.isAutoGeolocation ? prev.cityName : 'Posizione attuale',
            isAutoGeolocation: true,
          };
          saveToBackend(nextPref);
          return nextPref;
        });
      },
      (err) => {
        setIsDetecting(false);
        let msg = 'Impossibile rilevare la posizione.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Permesso di geolocalizzazione negato.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Timeout nel rilevamento della posizione.';
        }
        setGeoError(msg);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }, [saveToBackend]);

  return {
    preference,
    isDetecting,
    geoError,
    toggleEnabled,
    setManualLocation,
    detectLocation,
  };
};
