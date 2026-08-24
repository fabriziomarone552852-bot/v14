import React, { useState } from 'react';
import type { DbBingoEntry } from '@/types/yearlyentries';

interface BingoCardProps {
  cells: DbBingoEntry[];
  onCreateCell: (testo: string) => Promise<void>;
  onUpdateText: (id: number, testo: string) => Promise<void>;
  onToggleDone: (id: number, done: boolean) => Promise<void>;
  onDeleteCell: (id: number) => Promise<void>;
}

const getStampRotation = (id: number): string => {
  const rotations = [-15, -10, -8, -5, 5, 8, 10, 12, 15, -12];
  return `${rotations[id % rotations.length]}deg`;
};

const BingoCard: React.FC<BingoCardProps> = ({
  cells,
  onCreateCell,
  onUpdateText,
  onToggleDone,
  onDeleteCell
}) => {
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [editingNewIndex, setEditingNewIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState<string>('');
  const [lastClickTime, setLastClickTime] = useState<Record<number, number>>({});

  const completedCount = cells.filter(c => c.done).length;

  const handleConfirmNew = async () => {
    if (draftText.trim()) {
      await onCreateCell(draftText.trim());
    }
    setEditingNewIndex(null);
    setDraftText('');
  };

  const handleConfirmEdit = async (id: number) => {
    if (draftText.trim()) {
      await onUpdateText(id, draftText.trim());
    }
    setEditingId(null);
    setDraftText('');
  };

  const handleCellClick = (cell: DbBingoEntry) => {
    const now = Date.now();
    const last = lastClickTime[cell.id] ?? 0;
    if (now - last < 300) {
      // Doppio click → edit
      setEditingId(cell.id);
      setDraftText(cell.testo ?? '');
    } else {
      // Singolo click → toggle done
      onToggleDone(cell.id, !cell.done);
    }
    setLastClickTime(prev => ({ ...prev, [cell.id]: now }));
  };

  // Creiamo l'array da 25 celle (vuote o piene)
  const renderCells = Array.from({ length: 25 }, (_, index) => {
    if (index < cells.length) {
      const cell = cells[index];
      
      if (editingId === cell.id) {
        return (
          <div key={`edit-${cell.id}`} className="aspect-square border-2 border-blue-400 rounded-lg bg-blue-50 flex items-center justify-center p-1">
            <textarea
              autoFocus
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setDraftText('');
                }
              }}
              onBlur={() => { handleConfirmEdit(cell.id); }}
              className="w-full h-full text-center text-xs bg-transparent border-none focus:ring-0 resize-none text-gray-700"
            />
          </div>
        );
      }

      if (cell.done) {
        return (
          <div
            key={`done-${cell.id}`}
            onClick={() => handleCellClick(cell)}
            className="aspect-square border border-gray-200 rounded-lg flex items-center justify-center p-2 cursor-pointer relative overflow-hidden group"
          >
            <span className="text-xs text-center text-gray-400 font-medium leading-tight opacity-60">
              {cell.testo}
            </span>
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${getStampRotation(cell.id)})` }}
            >
              <img
                src="/stamp-star.png"
                alt="completato"
                className="w-3/4 h-3/4 object-contain opacity-80"
                style={{ filter: 'drop-shadow(0 1px 2px rgba(200,0,0,0.3))' }}
              />
            </div>
            <button
              onClick={e => { e.stopPropagation(); onDeleteCell(cell.id); }}
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-100 text-red-400 text-[10px] items-center justify-center hidden group-hover:flex hover:bg-red-500 hover:text-white transition-colors z-10"
            >
              ✕
            </button>
          </div>
        );
      }

      return (
        <div
          key={`cell-${cell.id}`}
          onClick={() => handleCellClick(cell)}
          className="aspect-square border border-gray-200 rounded-lg flex items-center justify-center p-2 cursor-pointer hover:border-blue-300 hover:bg-gray-50 transition-colors group relative"
        >
          <span className="text-xs text-center text-gray-700 font-medium leading-tight">
            {cell.testo}
          </span>
          <button
            onClick={e => { e.stopPropagation(); onDeleteCell(cell.id); }}
            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-100 text-red-400 text-[10px] items-center justify-center hidden group-hover:flex hover:bg-red-500 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      );
    } else {
      // Slot vuoto
      if (editingNewIndex === index) {
        return (
          <div key={`new-${index}`} className="aspect-square border-2 border-blue-400 rounded-lg bg-blue-50 flex flex-col items-center justify-center p-1">
            <input
              autoFocus
              value={draftText}
              onChange={e => setDraftText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleConfirmNew();
                if (e.key === 'Escape') { setEditingNewIndex(null); setDraftText(''); }
              }}
              onBlur={handleConfirmNew}
              className="w-full text-center text-xs bg-transparent border-none focus:ring-0 text-gray-700"
              placeholder="Cosa vuoi fare?"
            />
          </div>
        );
      }

      return (
        <div
          key={`empty-${index}`}
          onClick={() => { setEditingNewIndex(index); setDraftText(''); }}
          className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
        >
          <span className="text-gray-300 text-xl">+</span>
        </div>
      );
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          BINGO CARD
        </h3>
        <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-full text-gray-600">
          {completedCount} / 25
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {renderCells}
      </div>
    </div>
  );
};

export default BingoCard;
