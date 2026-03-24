'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GameFooterProps {
  onSkip?: () => void;
  onGuess?: () => void;
  inputValue?: string;
  isGuessDisabled?: boolean;
  className?: string;
}

const GameFooter: React.FC<GameFooterProps> = ({ 
  onSkip, 
  onGuess, 
  inputValue = "", 
  isGuessDisabled = false,
  className 
}) => {

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onGuess && !isGuessDisabled) {
      onGuess(); 
    }
  };

  return (
    <div 
      className={cn(
        "absolute bottom-0 w-full z-50",
        "bg-[#353535] px-4 py-8 rounded-t-2xl",
        "border-t border-gray-600",
        "shadow-[0_0px_20px_rgba(0,0,0,0.5)] shadow-primary",
        className
      )}
    >
      <div className="flex items-center gap-3 w-full h-10 my-2">
        <button 
          onClick={onSkip}
          className={cn(
            "px-6 py-2 h-full rounded-[10px] border border-primary",
            "text-primary font-bold text-xs",
            "shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-primary",
            "hover:bg-white/10 hover:text-white hover:border-white",
            "active:scale-95 transition-colors"
          )}
        >
          SKIP
        </button>

        <div className="flex-1 h-full relative group">
          <input 
            type="text" 
            defaultValue={inputValue}
            placeholder="Search artist or track..." 
            onKeyDown={handleKeyDown}
            className={cn(
              "w-full h-full bg-[#525252] rounded-xl px-5",
              "text-[#D9D9D9] text-sm placeholder:text-[#D9D9D9]/70 placeholder:font-semibold",
              "border border-transparent focus:outline-none focus:ring-2 focus:ring-primary",
              "transition-all"
            )}
          />
        </div>

        <button 
          onClick={onGuess}
          disabled={isGuessDisabled}
          className={cn(
            "px-4 h-full rounded-xl bg-primary",
            "text-white font-semibold text-md",
            "shadow-[0_0_15px_rgba(233,64,150,0.4)] hover:shadow-[0_0_20px_rgba(233,64,150,0.6)]",
            "active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          GUESS
        </button>
      </div>
    </div>
  );
};

export default GameFooter;