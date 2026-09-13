// src/mobile/components/modals/review/shared/AutoExpandingReviewTextarea.tsx
import React, { useState, useRef, useEffect } from 'react';

export interface AutoExpandingReviewTextareaProps {
  initialValue: string;
  onSave: (val: string) => void;
  placeholder?: string;
}

/** Textarea ad auto-espansione per le risposte alle domande di review */
export const AutoExpandingReviewTextarea: React.FC<AutoExpandingReviewTextareaProps> = ({
  initialValue,
  onSave,
  placeholder = 'Scrivi la tua risposta...',
}) => {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(68, el.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        adjustHeight();
      }}
      onBlur={() => {
        const trimmed = value.trim();
        if (trimmed !== initialValue.trim()) {
          onSave(trimmed);
        }
      }}
      placeholder={placeholder}
      rows={2}
      className="w-full text-xs sm:text-sm text-gray-800 bg-white border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-[border-color,box-shadow] resize-none placeholder-gray-400 leading-relaxed overflow-hidden"
    />
  );
};
