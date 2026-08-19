import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CategoryGenre } from '@/types';
import { useCreateCategory, categoriesQueryKey } from '@/hooks/useCategories';
import { logger } from '@/utils/logger';
import { CloseIcon } from '@/components/shared/utils/Icons';

interface CreateMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newCategoryId: number) => void;
}

export const CreateMoodModal: React.FC<CreateMoodModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: addCategory } = useCreateCategory();
  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>('#3B82F6');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    const nomePulito = name.trim();
    if (!nomePulito) {
      setErrorMsg('Inserisci un nome per la categoria / stato d\'animo.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const created = await addCategory({
        category_name: nomePulito,
        colore: color,
        genre: CategoryGenre.MOOD
      });
      await queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
      setIsSubmitting(false);
      setName('');
      setColor('#3B82F6');
      if (created?.id) onSuccess?.(created.id);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      logger.error("Errore creazione stato d'animo:", err);
      let message = 'Impossibile salvare lo stato d\'animo.';
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed.detail) message = parsed.detail;
        } catch {
          if (err.message) message = err.message;
        }
      }
      setErrorMsg(message);
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all animate-fadeIn" 
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto animate-scaleUp relative z-[10000]" 
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wider">Nuovo Stato d'Animo / Emozione</h4>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-gray-200/50">
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Nome Emozione</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="es. Felice, Produttivo..."
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Colore (HEX)</label>
            <div className="flex gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 p-0.5 border border-gray-200 rounded-xl cursor-pointer shrink-0 shadow-2xs" />
              <input type="text" value={color} onChange={e => setColor(e.target.value)} className="flex-1 px-3.5 py-2 border border-gray-200 rounded-xl text-xs uppercase outline-none focus:border-blue-500 transition-all font-mono" />
            </div>
          </div>
          
          {errorMsg && <p className="text-xs text-red-500 font-bold">{errorMsg}</p>}
          
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              Annulla
            </button>
            <button type="button" disabled={isSubmitting} onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50">
              {isSubmitting ? 'Salvataggio...' : 'Salva Emozione'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
