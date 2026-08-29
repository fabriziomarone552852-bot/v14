// src/components/shared/dialog/ImagePositionModal.tsx
import React from 'react';
import BaseModal from '@/components/shared/dialog/BaseModal';
import ImagePositionPicker from '@/components/shared/utils/ImagePositionPicker';
import { TargetIcon } from '@/components/shared/utils/Icons';

interface ImagePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  value?: string | null;
  onChange: (position: string) => void;
  titlePreview?: string;
}

export const ImagePositionModal: React.FC<ImagePositionModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  value,
  onChange,
  titlePreview = 'Anteprima Card',
}) => {
  if (!isOpen) return null;

  const modalTitle = (
    <div className="flex items-center gap-2 text-base font-extrabold text-gray-800 uppercase tracking-wider">
      <TargetIcon className="w-5 h-5 text-blue-600" />
      <span>Centra l'immagine</span>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      maxWidthClass="max-w-lg"
      confirmText="Conferma"
      onConfirm={onClose}
      cancelText="Chiudi"
    >
      <div className="space-y-4">
        <p className="text-xs text-gray-500 font-medium">
          Trascina l'immagine per centrare o inquadrare la parte desiderata dello sfondo.
        </p>

        <ImagePositionPicker
          imageUrl={imageUrl}
          value={value}
          onChange={onChange}
          titlePreview={titlePreview}
        />
      </div>
    </BaseModal>
  );
};

export default ImagePositionModal;
