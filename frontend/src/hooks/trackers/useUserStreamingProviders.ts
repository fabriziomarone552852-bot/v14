// src/hooks/trackers/useUserStreamingProviders.ts
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { api } from '@/api/apiService';
import { useAuth } from '@/context/AuthContext';
import { useTMDBMovieProviders } from '@/hooks/queries/useMovieQueries';
import { useTMDBProviders } from '@/hooks/queries/useTrackersQueries';
import { showTrackerToast } from '@/components/trackers/shared/TrackerToast';
import type { UserStreamingProvider } from '@/types/auth';
import type { UserServerSettings } from '@/types/settings';

export const useUserStreamingProviders = () => {
  const { user, updateUser } = useAuth();
  const { data: movieProviders = [], isLoading: isLoadingMovieProviders } = useTMDBMovieProviders();
  const { data: tvProviders = [], isLoading: isLoadingTvProviders } = useTMDBProviders();

  const userProviders: UserStreamingProvider[] = useMemo(() => {
    return user?.streaming_providers ?? [];
  }, [user?.streaming_providers]);

  const userProviderIds = useMemo(() => {
    return new Set(userProviders.map((p) => p.provider_id));
  }, [userProviders]);

  // Estrazione casuale stabile di una piattaforma dell'utente finché resta tra quelle attive
  const [randomProviderId, setRandomProviderId] = useState<number | null>(() => {
    const initial = user?.streaming_providers ?? [];
    if (initial.length === 0) return null;
    const idx = Math.floor(Math.random() * initial.length);
    return initial[idx].provider_id;
  });

  useEffect(() => {
    if (userProviders.length === 0) {
      if (randomProviderId !== null) {
        setRandomProviderId(null);
      }
      return;
    }

    const stillExists =
      randomProviderId !== null &&
      userProviders.some((p) => p.provider_id === randomProviderId);

    if (!stillExists) {
      const idx = Math.floor(Math.random() * userProviders.length);
      setRandomProviderId(userProviders[idx].provider_id);
    }
  }, [userProviders, randomProviderId]);

  const randomUserProvider: UserStreamingProvider | null = useMemo(() => {
    if (userProviders.length === 0) return null;
    if (randomProviderId !== null) {
      const found = userProviders.find((p) => p.provider_id === randomProviderId);
      if (found) return found;
    }
    return userProviders[0];
  }, [userProviders, randomProviderId]);

  // Catalogo completo unificato delle piattaforme attive in Italia (Film + Serie TV), ordinato per popolarità IT
  const allCatalogProviders: UserStreamingProvider[] = useMemo(() => {
    const map = new Map<
      number,
      { item: UserStreamingProvider; priority: number }
    >();

    const register = (raw: {
      provider_id: number;
      provider_name: string;
      logo_path?: string | null;
      display_priority?: number;
      display_priorities?: Record<string, number>;
    }) => {
      if (!raw || typeof raw.provider_id !== 'number' || !raw.provider_name) return;
      const prio =
        raw.display_priorities?.IT ??
        raw.display_priority ??
        999;

      const existing = map.get(raw.provider_id);
      if (!existing || prio < existing.priority) {
        map.set(raw.provider_id, {
          item: {
            provider_id: raw.provider_id,
            provider_name: raw.provider_name,
            logo_path: raw.logo_path ?? existing?.item.logo_path ?? null,
          },
          priority: prio,
        });
      }
    };

    movieProviders.forEach(register);
    tvProviders.forEach(register);

    // Garantisce che eventuali piattaforme già salvate dall'utente siano sempre presenti nella lista
    userProviders.forEach((up) => {
      if (!map.has(up.provider_id)) {
        map.set(up.provider_id, { item: up, priority: 0 });
      }
    });

    return Array.from(map.values())
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.item.provider_name.localeCompare(b.item.provider_name, 'it');
      })
      .map((entry) => entry.item);
  }, [movieProviders, tvProviders, userProviders]);

  // Gestione mutazione ottimistica a 0ms con protezione da tap ravvicinati
  const mutationCounterRef = useRef(0);
  const userRef = useRef(user);
  userRef.current = user;

  const saveProvidersOptimistically = useCallback(
    async (nextProviders: UserStreamingProvider[]) => {
      const currentUser = userRef.current;
      if (!currentUser) return;

      const snapshotUser = currentUser;
      const mutId = ++mutationCounterRef.current;

      // 1. Aggiornamento immediato in RAM e localStorage (0ms)
      updateUser({
        ...currentUser,
        streaming_providers: nextProviders,
      });

      try {
        await api.patch<UserServerSettings>('/users/me/settings', {
          streaming_providers: nextProviders,
        });
      } catch {
        // Rollback solo se non sono già scattate modifiche più recenti
        if (mutationCounterRef.current === mutId) {
          updateUser(snapshotUser);
        }
        showTrackerToast('Errore nel salvataggio delle piattaforme', 'warning');
      }
    },
    [updateUser]
  );

  const toggleProvider = useCallback(
    (provider: UserStreamingProvider) => {
      const currentList = userRef.current?.streaming_providers ?? [];
      const exists = currentList.some((p) => p.provider_id === provider.provider_id);
      const nextList = exists
        ? currentList.filter((p) => p.provider_id !== provider.provider_id)
        : [
            ...currentList,
            {
              provider_id: provider.provider_id,
              provider_name: provider.provider_name,
              logo_path: provider.logo_path ?? null,
            },
          ];

      void saveProvidersOptimistically(nextList);
    },
    [saveProvidersOptimistically]
  );

  const clearProviders = useCallback(() => {
    void saveProvidersOptimistically([]);
  }, [saveProvidersOptimistically]);

  return {
    userProviders,
    userProviderIds,
    randomUserProvider,
    allCatalogProviders,
    isLoadingProviders: isLoadingMovieProviders && isLoadingTvProviders,
    toggleProvider,
    clearProviders,
  };
};
