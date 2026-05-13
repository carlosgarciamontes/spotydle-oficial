"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

export interface SongSuggestion {
  id: string;
  artist: string;
  title: string;
}

interface GameInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  suggestions?: SongSuggestion[];
  onSelect?: (suggestion: SongSuggestion) => void;
  isSearching?: boolean;
}

const GameInput: React.FC<GameInputProps> = ({
  value,
  onChange,
  onKeyDown,
  suggestions = [],
  onSelect,
  isSearching = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const showDropdown = isFocused && value && value.length > 0;

  return (
    <div className="flex-1 h-full relative group">
      {showDropdown && (
        <div
          className="
          absolute left-0 right-0 z-40
          bottom-[calc(100%-20px)]
          bg-[#2A2A2A] border border-spotydle border-b-0 rounded-t-[2rem] 
          shadow-[0_-15px_40px_rgba(0,0,0,0.5)] 
          max-h-60 overflow-y-auto 
          pt-2 pb-6
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
          [&::-webkit-scrollbar-track]:rounded-tr-2xl
          [&::-webkit-scrollbar-thumb]:bg-spotydle
          [&::-webkit-scrollbar-thumb]:rounded-full
        "
        >
          {isSearching ? (
            <ul className="flex flex-col">
              {[1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="p-3 flex items-center gap-3 border-b border-white/5 last:border-none"
                >
                  <div className="flex flex-col gap-2 w-full">
                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-white/10 rounded animate-pulse w-1/2"></div>
                  </div>
                </li>
              ))}
            </ul>
          ) : suggestions.length > 0 ? (
            <ul className="flex flex-col">
              {suggestions.map((song) => (
                <li
                  key={song.id}
                  onClick={() => onSelect && onSelect(song)}
                  className="p-3 hover:bg-white/5 cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-none"
                >
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-bold">
                      {song.title}
                    </span>
                    <span className="text-gray-400 text-xs">{song.artist}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-gray-400 text-center">
              No se encontraron canciones
            </div>
          )}
        </div>
      )}

      <div className="relative z-50 h-full w-full">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-spotydle" />
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Busca un artista o canción"
          className="h-full w-full bg-[#1A1A1A] border-2 border-spotydle text-white rounded-full py-3 pl-11 pr-4 focus:outline-none focus:shadow-[0_0_15px_rgba(233,64,150,0.4)] transition-shadow placeholder:text-gray-500 placeholder:text-sm"
        />
      </div>
    </div>
  );
};

export default GameInput;
