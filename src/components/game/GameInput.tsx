'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';

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
  isSearching = false
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const showDropdown = isFocused && value && value.length > 0;

  return (
    <div className="flex-1 h-full relative group">
      
      {/* EL MENÚ DESPLEGABLE (Z-40: Por debajo del input) */}
      {showDropdown && (
        <div className="
          absolute left-0 right-0 z-40
          bottom-[calc(100%-20px)] /* Lo bajamos 20px para que se esconda detrás del input */
          bg-[#2A2A2A] border border-spotydle border-b-0 rounded-t-2xl 
          shadow-[0_-15px_40px_rgba(0,0,0,0.5)] 
          max-h-60 overflow-y-auto 
          pt-2 pb-6 /* Añadimos padding abajo (pb-6) para que el input no tape el último elemento */
          
          /* --- MAGIA DEL SCROLLBAR CORPORATIVO --- */
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:bg-[#1a1a1a]
          [&::-webkit-scrollbar-track]:rounded-tr-2xl
          [&::-webkit-scrollbar-thumb]:bg-spotydle
          [&::-webkit-scrollbar-thumb]:rounded-full
        ">
          {isSearching ? (
            /* --- SKELETONS DE CARGA --- */
            <ul className="flex flex-col">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="p-3 flex items-center gap-3 border-b border-white/5 last:border-none">
                  <div className="flex flex-col gap-2 w-full">
                    {/* Skeleton del Título */}
                    <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                    {/* Skeleton del Artista */}
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
                    <span className="text-white text-sm font-bold">{song.title}</span>
                    <span className="text-gray-400 text-xs">{song.artist}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-gray-400 text-center">No se encontraron canciones</div>
          )}
        </div>
      )}

      {/* CONTENEDOR DEL INPUT (Z-50: Siempre por encima del menú) */}
      <div className="relative z-50 h-full w-full">
        <Input 
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search artist or track..." 
          className="h-full w-full bg-[#444444] border-none text-white placeholder:text-gray-400 shadow-lg"
        />
      </div>
      
    </div>
  );
};

export default GameInput;