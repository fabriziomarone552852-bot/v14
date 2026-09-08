// src/context/ShoppingModalContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

interface ShoppingModalHandlers {
  openQuickPrice?: (productName?: string) => void;
  openCreateItem?: () => void;
  openCreateList?: (groupId?: number) => void;
  openCreateGroup?: () => void;
  openOmniSearch?: () => void;
}

interface ShoppingModalContextValue {
  isOmniSearchOpen: boolean;
  setIsOmniSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openOmniSearch: () => void;
  closeOmniSearch: () => void;
  
  openQuickPrice: (productName?: string) => void;
  openCreateItem: () => void;
  openCreateList: (groupId?: number) => void;
  openCreateGroup: () => void;
  
  registerHandlers: (handlers: ShoppingModalHandlers) => void;
}

const ShoppingModalContext = createContext<ShoppingModalContextValue | undefined>(undefined);

export const ShoppingModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOmniSearchOpen, setIsOmniSearchOpen] = useState(false);
  const handlersRef = React.useRef<ShoppingModalHandlers>({});

  const registerHandlers = useCallback((newHandlers: ShoppingModalHandlers) => {
    handlersRef.current = { ...handlersRef.current, ...newHandlers };
  }, []);

  const openOmniSearch = useCallback(() => {
    if (handlersRef.current.openOmniSearch) {
      handlersRef.current.openOmniSearch();
    } else {
      setIsOmniSearchOpen((prev) => !prev);
    }
  }, []);

  const closeOmniSearch = useCallback(() => {
    setIsOmniSearchOpen(false);
  }, []);

  const openQuickPrice = useCallback((productName?: string) => {
    handlersRef.current.openQuickPrice?.(productName);
  }, []);

  const openCreateItem = useCallback(() => {
    handlersRef.current.openCreateItem?.();
  }, []);

  const openCreateList = useCallback((groupId?: number) => {
    handlersRef.current.openCreateList?.(groupId);
  }, []);

  const openCreateGroup = useCallback(() => {
    handlersRef.current.openCreateGroup?.();
  }, []);

  const value = useMemo(
    () => ({
      isOmniSearchOpen,
      setIsOmniSearchOpen,
      openOmniSearch,
      closeOmniSearch,
      openQuickPrice,
      openCreateItem,
      openCreateList,
      openCreateGroup,
      registerHandlers,
    }),
    [
      isOmniSearchOpen,
      openOmniSearch,
      closeOmniSearch,
      openQuickPrice,
      openCreateItem,
      openCreateList,
      openCreateGroup,
      registerHandlers,
    ]
  );

  return (
    <ShoppingModalContext.Provider value={value}>
      {children}
    </ShoppingModalContext.Provider>
  );
};

export const useShoppingModals = (): ShoppingModalContextValue => {
  const context = useContext(ShoppingModalContext);
  if (!context) {
    throw new Error('useShoppingModals must be used within a ShoppingModalProvider');
  }
  return context;
};
