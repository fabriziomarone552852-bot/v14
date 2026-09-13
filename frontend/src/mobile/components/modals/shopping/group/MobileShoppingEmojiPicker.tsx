// src/mobile/components/modals/shopping/group/MobileShoppingEmojiPicker.tsx
import React from 'react';

const COMMON_EMOJIS = ['👥', '🏠', '🛒', '👨‍👩‍👧‍👦', '🍕', '🍻', '🎉', '🏖️', '💼', '⭐', '🍎', '🚗'];

export interface MobileShoppingEmojiPickerProps {
  icon: string;
  setIcon: (icon: string) => void;
}

export const MobileShoppingEmojiPicker: React.FC<MobileShoppingEmojiPickerProps> = ({
  icon,
  setIcon,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5">
        Icona Gruppo
      </label>
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Input Emoji personalizzabile libera come nella webpage */}
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={4}
          className="w-12 h-10 text-center border-2 border-blue-500 rounded-xl text-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-2xs shrink-0"
          title="Emoji personalizzabile"
        />

        {/* Palette rapida di suggerimenti */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setIcon(emoji)}
              className={`w-9 h-9 text-base rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                icon === emoji
                  ? 'bg-blue-600 text-white scale-110 shadow-xs ring-2 ring-blue-400 ring-offset-1'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
