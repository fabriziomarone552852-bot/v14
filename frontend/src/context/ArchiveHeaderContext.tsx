// src/context/ArchiveHeaderContext.tsx
import React, { createContext, useContext, useState, useRef, useCallback, useMemo, useEffect, type ReactNode } from 'react';

export interface ArchiveHeaderConfig {
  title?: string;
  onOpenSearch?: () => void;
  onOpenNew?: () => void;
  activeFiltersCount?: number;
  onBack?: () => void;
}

interface ArchiveHeaderContextValue {
  config: {
    title?: string;
    activeFiltersCount?: number;
    hasSearch: boolean;
    hasNew: boolean;
    hasBack: boolean;
  };
  triggerOpenSearch: () => void;
  triggerOpenNew: () => void;
  triggerBack: () => void;
  setHeaderConfig: (config: ArchiveHeaderConfig) => void;
  clearHeaderConfig: () => void;
}

const ArchiveHeaderContext = createContext<ArchiveHeaderContextValue | undefined>(undefined);

export const ArchiveHeaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerState, setHeaderState] = useState<{
    title?: string;
    activeFiltersCount?: number;
    hasSearch: boolean;
    hasNew: boolean;
    hasBack: boolean;
  }>({
    title: undefined,
    activeFiltersCount: undefined,
    hasSearch: false,
    hasNew: false,
    hasBack: false,
  });

  const callbacksRef = useRef<{
    onOpenSearch?: () => void;
    onOpenNew?: () => void;
    onBack?: () => void;
  }>({});

  const setHeaderConfig = useCallback((newConfig: ArchiveHeaderConfig) => {
    callbacksRef.current = {
      onOpenSearch: newConfig.onOpenSearch,
      onOpenNew: newConfig.onOpenNew,
      onBack: newConfig.onBack,
    };

    const hasSearch = Boolean(newConfig.onOpenSearch);
    const hasNew = Boolean(newConfig.onOpenNew);
    const hasBack = Boolean(newConfig.onBack);

    setHeaderState((prev) => {
      if (
        prev.title === newConfig.title &&
        prev.activeFiltersCount === newConfig.activeFiltersCount &&
        prev.hasSearch === hasSearch &&
        prev.hasNew === hasNew &&
        prev.hasBack === hasBack
      ) {
        return prev;
      }
      return {
        title: newConfig.title,
        activeFiltersCount: newConfig.activeFiltersCount,
        hasSearch,
        hasNew,
        hasBack,
      };
    });
  }, []);

  const clearHeaderConfig = useCallback(() => {
    callbacksRef.current = {};
    setHeaderState((prev) => {
      if (!prev.title && !prev.activeFiltersCount && !prev.hasSearch && !prev.hasNew && !prev.hasBack) {
        return prev;
      }
      return {
        title: undefined,
        activeFiltersCount: undefined,
        hasSearch: false,
        hasNew: false,
        hasBack: false,
      };
    });
  }, []);

  const triggerOpenSearch = useCallback(() => {
    callbacksRef.current.onOpenSearch?.();
  }, []);

  const triggerOpenNew = useCallback(() => {
    callbacksRef.current.onOpenNew?.();
  }, []);

  const triggerBack = useCallback(() => {
    callbacksRef.current.onBack?.();
  }, []);

  const value = useMemo(
    () => ({
      config: headerState,
      triggerOpenSearch,
      triggerOpenNew,
      triggerBack,
      setHeaderConfig,
      clearHeaderConfig,
    }),
    [headerState, triggerOpenSearch, triggerOpenNew, triggerBack, setHeaderConfig, clearHeaderConfig]
  );

  return (
    <ArchiveHeaderContext.Provider value={value}>
      {children}
    </ArchiveHeaderContext.Provider>
  );
};

export const useArchiveHeader = (pageConfig?: ArchiveHeaderConfig) => {
  const context = useContext(ArchiveHeaderContext);
  if (!context) {
    throw new Error('useArchiveHeader must be used within an ArchiveHeaderProvider');
  }

  const { setHeaderConfig, clearHeaderConfig } = context;

  const title = pageConfig?.title;
  const activeFiltersCount = pageConfig?.activeFiltersCount;
  const hasSearch = Boolean(pageConfig?.onOpenSearch);
  const hasNew = Boolean(pageConfig?.onOpenNew);
  const hasBack = Boolean(pageConfig?.onBack);

  useEffect(() => {
    if (!pageConfig) {
      return undefined;
    }
    setHeaderConfig(pageConfig);
    return () => {
      clearHeaderConfig();
    };
  }, [title, activeFiltersCount, hasSearch, hasNew, hasBack, setHeaderConfig, clearHeaderConfig]);

  // Aggiorna sempre i callback su ref all'ultimo render del componente pagina
  useEffect(() => {
    if (pageConfig) {
      setHeaderConfig(pageConfig);
    }
  });

  return context;
};

export default useArchiveHeader;
