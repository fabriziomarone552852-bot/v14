// frontend/src/components/year/BingoModal.tsx
import React, { useState } from 'react';
import type { DbBingoEntry } from '@/types/yearlyentries';
import { TrashIcon } from '@/components/shared/utils/Icons';

interface BingoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cells: DbBingoEntry[];
  onCreateCell: (testo: string, posizione?: number) => Promise<void>;
  onUpdateText: (id: number, testo: string) => Promise<void>;
  onToggleDone: (id: number, done: boolean) => Promise<void>;
  onDeleteCell: (id: number) => Promise<void>;
}

const getFallbackRotation = (id: number, pos: number = 0): number => {
  return Math.abs((id * 137 + pos * 149) % 360);
};

export const BingoModal: React.FC<BingoModalProps> = ({
  isOpen,
  onClose,
  cells,
  onCreateCell,
  onUpdateText,
  onToggleDone,
  onDeleteCell,
}) => {
  const [editingPos, setEditingPos] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [lastClickTime, setLastClickTime] = useState<Record<number, number>>({});

  if (!isOpen) return null;

  const completedCount = cells.filter(c => c.done).length;

  const handleConfirmNew = async (pos: number) => {
    if (draftText.trim()) {
      await onCreateCell(draftText.trim(), pos);
    }
    setEditingPos(null);
    setDraftText('');
  };

  const handleConfirmEdit = async (id: number) => {
    if (draftText.trim()) {
      await onUpdateText(id, draftText.trim());
    }
    setEditingId(null);
    setDraftText('');
  };

  const handleCellClick = (cell: DbBingoEntry, _pos: number) => {
    const now = Date.now();
    const last = lastClickTime[cell.id] ?? 0;
    if (now - last < 300) {
      // Doppio click → modifica testo
      setEditingId(cell.id);
      setDraftText(cell.testo ?? '');
    } else {
      // Singolo click → segna/ruota timbro completato
      onToggleDone(cell.id, cell.done);
    }
    setLastClickTime(prev => ({ ...prev, [cell.id]: now }));
  };

  const gridSlots = Array.from({ length: 25 }, (_, index) => {
    const pos = index + 1;
    const cell = cells.find(c => c.posizione === pos);

    // Editing new cell at position
    if (editingPos === pos) {
      return (
        <div key={`new-${pos}`} className="aspect-square border-2 border-blue-500 rounded-xl bg-blue-50/80 flex items-center justify-center p-3 shadow-inner">
          <textarea
            autoFocus
            rows={2}
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleConfirmNew(pos);
              }
              if (e.key === 'Escape') {
                setEditingPos(null);
                setDraftText('');
              }
            }}
            onBlur={() => handleConfirmNew(pos)}
            className="w-full h-auto max-h-full my-auto text-center text-xs font-medium leading-tight text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-400 p-0"
            placeholder="Scrivi qui..."
          />
        </div>
      );
    }

    if (cell) {
      // Editing existing cell
      if (editingId === cell.id) {
        return (
          <div key={`edit-${cell.id}`} className="aspect-square border-2 border-blue-500 rounded-xl bg-blue-50/80 flex items-center justify-center p-3 shadow-inner">
            <textarea
              autoFocus
              rows={2}
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleConfirmEdit(cell.id);
                }
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setDraftText('');
                }
              }}
              onBlur={() => handleConfirmEdit(cell.id)}
              className="w-full h-auto max-h-full my-auto text-center text-xs font-medium leading-tight text-gray-800 bg-transparent border-none focus:ring-0 focus:outline-none resize-none p-0"
            />
          </div>
        );
      }

      // Cell done (stamped with DB 360° rotation)
      if (cell.done) {
        const rotDeg = typeof cell.rotazione === 'number' ? cell.rotazione : getFallbackRotation(cell.id, pos);
        return (
          <div
            key={`done-${cell.id}`}
            onClick={() => handleCellClick(cell, pos)}
            className="aspect-square border border-gray-200 rounded-xl flex items-center justify-center p-3 cursor-pointer relative overflow-hidden group bg-gray-50/40 hover:border-blue-400 transition-colors shadow-sm"
          >
            <span className="text-xs text-center text-gray-400 font-medium leading-tight opacity-50 select-none">
              {cell.testo}
            </span>
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
              style={{ transform: `rotate(${rotDeg}deg)` }}
            >
              <img
                src="/stamp-star.png"
                alt="✓"
                className="w-4/5 h-4/5 object-contain opacity-85"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(200,0,0,0.3))' }}
              />
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onDeleteCell(cell.id);
              }}
              title="Elimina"
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-100 text-red-500 items-center justify-center hidden group-hover:flex hover:bg-red-500 hover:text-white transition-colors z-10 shadow-sm"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }

      // Cell with text (not done)
      return (
        <div
          key={`cell-${cell.id}`}
          onClick={() => handleCellClick(cell, pos)}
          className="aspect-square border border-gray-200 rounded-xl flex items-center justify-center p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all group relative bg-white shadow-sm"
        >
          <span className="text-xs text-center text-gray-700 font-medium leading-tight select-none">
            {cell.testo}
          </span>
          <button
            onClick={e => {
              e.stopPropagation();
              onDeleteCell(cell.id);
            }}
            title="Elimina"
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-100 text-red-500 items-center justify-center hidden group-hover:flex hover:bg-red-500 hover:text-white transition-colors shadow-sm"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    }

    // Empty cell slot
    return (
      <div
        key={`empty-${pos}`}
        onClick={() => {
          setEditingPos(pos);
          setDraftText('');
        }}
        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
      >
        <span className="text-gray-300 text-2xl group-hover:text-blue-500 transition-colors">+</span>
      </div>
    );
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[560px] p-4 flex flex-col z-10 animate-fadeIn border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-black text-gray-800 tracking-wider">
              BINGO CARD
            </h2>
            <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
              {completedCount} / 25 completate
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Grid 5x5 */}
        <div className="grid grid-cols-5 gap-2 p-0.5">
          {gridSlots}
        </div>

        {/* Footer Hint */}
        <div className="mt-3 pt-2 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-medium">
            💡 Click singolo per timbrare / ruotare · Doppio click per modificare · Passa il mouse per eliminare
          </p>
        </div>
      </div>
    </div>
  );
};

export default BingoModal;
