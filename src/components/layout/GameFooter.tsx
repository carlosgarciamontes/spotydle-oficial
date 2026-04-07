'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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
    <div className="absolute bottom-0 left-0 w-full flex justify-center pb-0 md:pb-8 z-50">
      <div className={cn(
        "w-full bg-[#353535] px-4 py-8 border-t border-gray-600 shadow-primary rounded-t-2xl shadow-[0_0px_20px_rgba(0,0,0,0.5)]", 
        "md:bg-transparent md:border-none md:shadow-none md:max-w-xl",
        className
      )}>
        <div className="flex gap-3 w-full h-10 my-2 items-center">
          
          <Button 
            intent="outline" 
            size="sm" 
            onClick={onSkip}
            className="px-6"
          >
            SKIP
          </Button>

          <div className="flex-1 h-full relative group">
            <Input 
              defaultValue={inputValue}
              placeholder="Search artist or track..." 
              onKeyDown={handleKeyDown}
              className="h-full w-full"
            />
          </div>

          <Button 
            intent="primary" 
            onClick={onGuess} 
            disabled={isGuessDisabled}
            className="px-4 h-full"
          >
            GUESS
          </Button>
          
        </div>
      </div>
    </div>
  );
};

export default GameFooter;