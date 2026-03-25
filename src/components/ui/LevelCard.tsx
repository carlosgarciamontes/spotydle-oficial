import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface LevelCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  imageUrl?: string;
}

const LevelCard = React.forwardRef<HTMLButtonElement, LevelCardProps>(
  ({ title, imageUrl, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative w-full aspect-square flex flex-col justify-end p-5 rounded-[2rem]",
          "transition-transform duration-300 active:scale-95 group overflow-hidden",
          "bg-black border border-spotydle", 
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0">
         {imageUrl && (
            <Image 
              src={imageUrl} 
              alt={title || "Imagen del nivel"} 
              fill 
              className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-110" 
            />
          )}

          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        </div>

        <h3 className="relative z-10 text-left font-bold text-white text-2xl leading-tight whitespace-pre-line drop-shadow-lg">
          {title}
        </h3>
      </button>
    );
  }
);

LevelCard.displayName = "LevelCard";

export default LevelCard;