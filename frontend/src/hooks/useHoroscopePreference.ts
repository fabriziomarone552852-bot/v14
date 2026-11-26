// frontend/src/hooks/useHoroscopePreference.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { HoroscopePreference, ZodiacSignSlug } from '@/types/horoscope';
import { ZODIAC_SIGNS_LIST } from '@/types/horoscope';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/api/client';
import type { UserResponse } from '@/types/auth';

const STORAGE_KEY = 'vita_horoscope_preference';

const DEFAULT_PREFERENCE: HoroscopePreference = {
  enabled: true,
  sign: 'ariete',
};

const isValidZodiacSlug = (val: unknown): val is ZodiacSignSlug => {
  return typeof val === 'string' && ZODIAC_SIGNS_LIST.some((s) => s.slug === val);
};

const getStoredFallbackPreference = (): HoroscopePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<HoroscopePreference>;
      return {
        enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_PREFERENCE.enabled,
        sign: isValidZodiacSlug(parsed.sign) ? parsed.sign : DEFAULT_PREFERENCE.sign,
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PREFERENCE;
};

export const useHoroscopePreference = () => {
  const { user, updateUser } = useAuth();
  const currentUserId = user?.id ?? null;

  const [storedFallback] = useState<HoroscopePreference>(getStoredFallbackPreference);
  const [overrideState, setOverrideState] = useState<{
    userId: number | null;
    pref: HoroscopePreference;
  } | null>(null);

  const dbHoroscopePreference = useMemo<HoroscopePreference | null>(() => {
    const dbPref = user?.module_preferences?.horoscope;
    if (dbPref && isValidZodiacSlug(dbPref.sign)) {
      return {
        enabled: typeof dbPref.enabled === 'boolean' ? dbPref.enabled : true,
        sign: dbPref.sign,
      };
    }
    return null;
  }, [user?.module_preferences?.horoscope]);

  const preference = useMemo<HoroscopePreference>(() => {
    if (overrideState && overrideState.userId === currentUserId) {
      return overrideState.pref;
    }
    return dbHoroscopePreference ?? storedFallback;
  }, [overrideState, currentUserId, dbHoroscopePreference, storedFallback]);

  const preferenceRef = useRef<HoroscopePreference>(preference);
  useEffect(() => {
    preferenceRef.current = preference;
  }, [preference]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
    } catch {
      // ignore
    }
  }, [preference]);

  const saveToBackend = useCallback(
    async (newPref: HoroscopePreference) => {
      if (!user) return;
      try {
        const currentPrefs = user.module_preferences || {};
        const response = await apiClient.patch<UserResponse>('/users/me/settings', {
          module_preferences: {
            ...currentPrefs,
            horoscope: newPref,
          },
        });
        if (response?.data) {
          updateUser(response.data);
        }
      } catch (err) {
        console.warn('Impossibile salvare la preferenza oroscopo su DB:', err);
      }
    },
    [user, updateUser]
  );

  const toggleEnabled = useCallback(
    (enabled?: boolean) => {
      const prev = preferenceRef.current;
      const nextPref: HoroscopePreference = {
        ...prev,
        enabled: typeof enabled === 'boolean' ? enabled : !prev.enabled,
      };
      preferenceRef.current = nextPref;
      setOverrideState({ userId: currentUserId, pref: nextPref });
      void saveToBackend(nextPref);
    },
    [currentUserId, saveToBackend]
  );

  const setSign = useCallback(
    (sign: ZodiacSignSlug) => {
      const prev = preferenceRef.current;
      const nextPref: HoroscopePreference = {
        ...prev,
        sign,
      };
      preferenceRef.current = nextPref;
      setOverrideState({ userId: currentUserId, pref: nextPref });
      void saveToBackend(nextPref);
    },
    [currentUserId, saveToBackend]
  );

  return {
    preference,
    toggleEnabled,
    setSign,
  };
};
