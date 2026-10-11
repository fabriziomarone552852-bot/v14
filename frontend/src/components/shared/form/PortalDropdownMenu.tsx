// src/components/shared/form/PortalDropdownMenu.tsx
import React from 'react';
import { createPortal } from 'react-dom';

export interface DropdownCoords {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

export interface PortalDropdownMenuProps {
  isOpen: boolean;
  coords: DropdownCoords;
  openUpwards: boolean;
  dropdownRef?: React.RefObject<HTMLDivElement | null>;
  usePortal?: boolean;
  zIndex?: number;
  className?: string;
  children: React.ReactNode;
}

/**
 * Componente riutilizzabile per menu a discesa renderizzati tramite Portal sul body
 * per evitare overflow clipping da card/modali o tabelle.
 */
export const PortalDropdownMenu: React.FC<PortalDropdownMenuProps> = ({
  isOpen,
  coords,
  openUpwards,
  dropdownRef,
  usePortal = true,
  zIndex = 10030,
  className = '',
  children,
}) => {
  if (!isOpen) return null;

  const content = (
    <div
      ref={dropdownRef}
      style={
        usePortal
          ? {
              position: 'fixed',
              top: openUpwards ? undefined : `${coords.top + 4}px`,
              bottom: openUpwards ? `${coords.bottom + 4}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex,
            }
          : undefined
      }
      className={`bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-fadeIn ${
        !usePortal
          ? openUpwards
            ? 'absolute bottom-full mb-1 left-0 right-0 z-50'
            : 'absolute top-full mt-1 left-0 right-0 z-50'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );

  return usePortal ? createPortal(content, document.body) : content;
};
