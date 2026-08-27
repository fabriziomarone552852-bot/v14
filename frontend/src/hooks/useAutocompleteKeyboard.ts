// src/hooks/useAutocompleteKeyboard.ts
//
// Hook condiviso per la navigazione da tastiera nei dropdown autocomplete.
// Elimina la duplicazione dello stesso pattern (ArrowUp/Down, Enter, Escape)
// presente in ShoppingBrandAutocomplete, ShoppingProductAutocomplete e LocationAutocompleteInput.

import { useState, useCallback } from 'react';

interface UseAutocompleteKeyboardOptions<T> {
  /** Lista dei suggerimenti attualmente visibili */
  items: T[];
  /** Se il dropdown è attualmente aperto */
  isOpen: boolean;
  /** Funzione per aprire/chiudere il dropdown */
  setIsOpen: (open: boolean) => void;
  /** Callback invocata quando l'utente seleziona un elemento (Enter o click) */
  onSelect: (item: T) => void;
  /**
   * Callback opzionale: invocata quando l'utente preme Enter 
   * ma nessun elemento è evidenziato (highlightedIndex === -1).
   * Utile per auto-selezionare il primo risultato se coincide col testo digitato.
   */
  onEnterWithoutHighlight?: () => void;
}

interface UseAutocompleteKeyboardReturn {
  /** Indice dell'elemento attualmente evidenziato (-1 = nessuno) */
  highlightedIndex: number;
  /** Setter diretto per l'indice evidenziato (utile per hover del mouse) */
  setHighlightedIndex: (index: number) => void;
  /** Resetta l'indice a -1 (da chiamare quando il dropdown si chiude o cambia la lista) */
  resetHighlight: () => void;
  /** Handler da passare all'onKeyDown dell'input */
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Gestisce la navigazione da tastiera in un dropdown autocomplete:
 * - ↓ Freccia Giù: scorre avanti tra i suggerimenti (loop circolare)
 * - ↑ Freccia Su: scorre indietro tra i suggerimenti (loop circolare)
 * - Enter: seleziona l'elemento evidenziato
 * - Escape: chiude il dropdown
 */
export function useAutocompleteKeyboard<T>({
  items,
  isOpen,
  setIsOpen,
  onSelect,
  onEnterWithoutHighlight,
}: UseAutocompleteKeyboardOptions<T>): UseAutocompleteKeyboardReturn {
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const resetHighlight = useCallback(() => {
    setHighlightedIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        }
        setHighlightedIndex((prev) =>
          prev < items.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : items.length - 1
        );
        return;
      }

      if (e.key === 'Enter') {
        if (isOpen && items.length > 0 && highlightedIndex >= 0 && highlightedIndex < items.length) {
          e.preventDefault();
          onSelect(items[highlightedIndex]);
        } else if (isOpen && items.length > 0 && highlightedIndex === -1 && onEnterWithoutHighlight) {
          onEnterWithoutHighlight();
        }
      }
    },
    [items, isOpen, highlightedIndex, setIsOpen, onSelect, onEnterWithoutHighlight]
  );

  return {
    highlightedIndex,
    setHighlightedIndex,
    resetHighlight,
    handleKeyDown,
  };
}
