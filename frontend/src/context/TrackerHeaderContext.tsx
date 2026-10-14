// src/context/TrackerHeaderContext.tsx
import React, { createContext, useContext, useState, useRef, useCallback, useMemo, type ReactNode } from 'react';

export interface TrackerHeaderConfig {
  onOpenSearch?: () => void;
  onOpenRandom?: () => void;
  hasActiveFilters?: boolean;
}

interface TrackerHeaderContextValue {
  hasSearch: boolean;
  hasRandom: boolean;
  hasActiveFilters: boolean;
  triggerSearch: () => void;
  triggerRandom: () => void;
  setTrackerHeaderConfig: (config: TrackerHeaderConfig) => void;
  clearTrackerHeaderConfig: () => void;
}

const TrackerHeaderContext = createContext<TrackerHeaderContextValue | undefined>(undefined);

export const TrackerHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<{ hasSearch: boolean; hasRandom: boolean; hasActiveFilters: boolean }>({
    hasSearch: false,
    hasRandom: false,
    hasActiveFilters: false,
  });

  const callbacksRef = useRef<TrackerHeaderConfig>({});

  const setTrackerHeaderConfig = useCallback((config: TrackerHeaderConfig) => {
    callbacksRef.current = config;
    const nextSearch = Boolean(config.onOpenSearch);
    const nextRandom = Boolean(config.onOpenRandom);
    const nextActive = Boolean(config.hasActiveFilters);
    setFlags((prev) => {
      if (
        prev.hasSearch === nextSearch &&
        prev.hasRandom === nextRandom &&
        prev.hasActiveFilters === nextActive
      ) {
        return prev;
      }
      return { hasSearch: nextSearch, hasRandom: nextRandom, hasActiveFilters: nextActive };
    });
  }, []);

  const clearTrackerHeaderConfig = useCallback(() => {
    callbacksRef.current = {};
    setFlags((prev) => {
      if (!prev.hasSearch && !prev.hasRandom && !prev.hasActiveFilters) {
        return prev;
      }
      return { hasSearch: false, hasRandom: false, hasActiveFilters: false };
    });
  }, []);

  const triggerSearch = useCallback(() => {
    callbacksRef.current.onOpenSearch?.();
  }, []);

  const triggerRandom = useCallback(() => {
    callbacksRef.current.onOpenRandom?.();
  }, []);

  const contextValue = useMemo(
    () => ({
      hasSearch: flags.hasSearch,
      hasRandom: flags.hasRandom,
      hasActiveFilters: flags.hasActiveFilters,
      triggerSearch,
      triggerRandom,
      setTrackerHeaderConfig,
      clearTrackerHeaderConfig,
    }),
    [flags.hasSearch, flags.hasRandom, flags.hasActiveFilters, triggerSearch, triggerRandom, setTrackerHeaderConfig, clearTrackerHeaderConfig]
  );

  return (
    <TrackerHeaderContext.Provider value={contextValue}>
      {children}
    </TrackerHeaderContext.Provider>
  );
};

export const useTrackerHeader = (config?: TrackerHeaderConfig) => {
  const context = useContext(TrackerHeaderContext);
  if (!context) {
    throw new Error('useTrackerHeader deve essere utilizzato all\'interno di TrackerHeaderProvider');
  }

  const { setTrackerHeaderConfig, clearTrackerHeaderConfig } = context;

  // Mantiene aggiornati i callback più recenti nel ref ad ogni render
  React.useEffect(() => {
    if (config) {
      setTrackerHeaderConfig(config);
    }
  });

  // Cleanup alla distruzione del componente
  React.useEffect(() => {
    return () => {
      clearTrackerHeaderConfig();
    };
  }, [clearTrackerHeaderConfig]);

  return context;
};

export default TrackerHeaderContext;
