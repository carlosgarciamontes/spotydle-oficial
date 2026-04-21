import React from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  isPlaying, 
  onTogglePlay, 
  className 
}) => {

  const leftBars = [1, 3, 5, 2, 1, 2, 4, 3, 1];
  const rightBars = [1, 3, 4, 2, 1, 2, 5, 3, 1];

  return (
    <div className={cn("flex flex-col items-center w-full my-8", className)}>
      <div className="flex items-center justify-center w-full gap-2 md:gap-4">
        
        {/* Ondas Izquierda */}
        <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
          {leftBars.map((multiplier, i) => (
            <div 
              key={`l-${i}`} 
              className={cn(
                "w-1.5 md:w-2 rounded-full bg-spotydle/50 shadow-[0_0_10px_rgba(233,64,150,0.6)] origin-center",
                // Si suena, aplicamos la animación. Si pausa, una transición suave para aplastarlo
                isPlaying ? "animate-sound" : "transition-transform duration-300"
              )}
              style={{ 
                height: `${multiplier * 10}px`, // Altura SIEMPRE fija al máximo
                transform: isPlaying ? 'none' : 'scaleY(0.4)', // En pausa lo aplastamos al 40%
                animationDelay: `-${i * 0.15}s` // MAGIA: Delay NEGATIVO para que empiece fluido
              }}
            />
          ))}
        </div>

        {/* Botón Central de Play/Pause */}
        <button 
          onClick={onTogglePlay}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-spotydle flex items-center justify-center shadow-[0_0_35px_rgba(233,64,150,0.5)] z-10 mx-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform shrink-0"
        >
          {isPlaying ? (
            <Pause size={36} className="text-[#2A2A2A] fill-current" />
          ) : (
            <Play size={36} className="text-[#2A2A2A] fill-current ml-2" />
          )}
        </button>

        {/* Ondas Derecha */}
        <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
          {rightBars.map((multiplier, i) => (
            <div 
              key={`r-${i}`} 
              className={cn(
                "w-1.5 md:w-2 rounded-full bg-spotydle/50 shadow-[0_0_10px_rgba(233,64,150,0.6)] origin-center",
                isPlaying ? "animate-sound" : "transition-transform duration-300"
              )}
              style={{ 
                height: `${multiplier * 10}px`,
                transform: isPlaying ? 'none' : 'scaleY(0.4)',
                // MAGIA: Delay NEGATIVO invertido
                animationDelay: `-${(rightBars.length - i) * 0.15}s` 
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;