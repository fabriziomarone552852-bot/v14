// frontend/src/hooks/useWeatherLocation.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { WeatherLocationPreference } from '@/types/weather';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import { weatherApi } from '@/api/weatherApi';
import type { UserResponse } from '@/types/auth';

const STORAGE_KEY = 'vita_weather_preference';

const DEFAULT_PREFERENCE: WeatherLocationPreference = {
  enabled: true,
  cityName: 'Foggia',
  latitude: 41.4620,
  longitude: 15.5433,
  isAutoGeolocation: false,
};

const getStoredFallbackPreference = (): WeatherLocationPreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<WeatherLocationPreference>;
      // Se era il vecchio default temporaneo 'Roma', aggiorna al default 'Foggia'
      if (
        parsed.cityName === 'Roma' &&
        typeof parsed.latitude === 'number' &&
        Math.abs(parsed.latitude - 41.9028) < 0.01
      ) {
        return DEFAULT_PREFERENCE;
      }
      return { ...DEFAULT_PREFERENCE, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCE;
};

export const useWeatherLocation = () => {
  const { user, updateUser } = useAuth();
  const currentUserId = user?.id ?? null;

  const [storedFallback] = useState<WeatherLocationPreference>(getStoredFallbackPreference);
  const [overrideState, setOverrideState] = useState<{
    userId: number | null;
    pref: WeatherLocationPreference;
  } | null>(null);

  const dbWeatherPreference = useMemo<WeatherLocationPreference | null>(() => {
    const dbWeather = user?.module_preferences?.weather as WeatherLocationPreference | undefined;
    if (dbWeather && typeof dbWeather.latitude === 'number' && typeof dbWeather.longitude === 'number') {
      return { ...DEFAULT_PREFERENCE, ...dbWeather };
    }
    return null;
  }, [user?.module_preferences?.weather]);

  const preference = useMemo<WeatherLocationPreference>(() => {
    if (overrideState && overrideState.userId === currentUserId) {
      return overrideState.pref;
    }
    return dbWeatherPreference ?? storedFallback;
  }, [overrideState, currentUserId, dbWeatherPreference, storedFallback]);

  const preferenceRef = useRef<WeatherLocationPreference>(preference);
  useEffect(() => {
    preferenceRef.current = preference;
  }, [preference]);

  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

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
    const prev = preferenceRef.current;
    const nextPref: WeatherLocationPreference = {
      ...prev,
      enabled: typeof enabled === 'boolean' ? enabled : !prev.enabled,
    };
    preferenceRef.current = nextPref;
    setOverrideState({ userId: currentUserId, pref: nextPref });
    void saveToBackend(nextPref);
  }, [currentUserId, saveToBackend]);

  const setManualLocation = useCallback((cityName: string, latitude: number, longitude: number) => {
    const prev = preferenceRef.current;
    const nextPref: WeatherLocationPreference = {
      ...prev,
      cityName,
      latitude,
      longitude,
      isAutoGeolocation: false,
    };
    preferenceRef.current = nextPref;
    setOverrideState({ userId: currentUserId, pref: nextPref });
    void saveToBackend(nextPref);
    setGeoError(null);
  }, [currentUserId, saveToBackend]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalizzazione non supportata dal tuo browser');
      return;
    }

    setIsDetecting(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let resolvedCityName = 'Posizione attuale';
        try {
          const reverse = await weatherApi.reverseGeocode(latitude, longitude);
          if (reverse?.name) {
            resolvedCityName = reverse.name;
          }
        } catch {
          // Fallback silenzioso a 'Posizione attuale'
        }

        setIsDetecting(false);
        const prev = preferenceRef.current;
        const nextPref: WeatherLocationPreference = {
          ...prev,
          latitude,
          longitude,
          cityName: resolvedCityName,
          isAutoGeolocation: true,
        };
        preferenceRef.current = nextPref;
        setOverrideState({ userId: currentUserId, pref: nextPref });
        void saveToBackend(nextPref);
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
  }, [currentUserId, saveToBackend]);

  return {
    preference,
    isDetecting,
    geoError,
    toggleEnabled,
    setManualLocation,
    detectLocation,
  };
};
