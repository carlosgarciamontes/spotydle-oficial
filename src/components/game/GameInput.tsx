'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';

interface GameInputProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const GameInput: React.FC<GameInputProps> = ({ value, onChange, onKeyDown }) => {
  return (
    <div className="flex-1 h-full relative group">
      <Input 
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Search artist or track..." 
        className="h-full w-full bg-[#444444] border-none text-white placeholder:text-gray-400"
      />
    </div>
  );
};

export default GameInput;