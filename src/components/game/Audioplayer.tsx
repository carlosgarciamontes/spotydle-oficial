'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';

interface AudioPlayerProps {
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ className }) => {
  const { targetSong, guesses, gameState } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasNewAudio, setHasNewAudio] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const leftBars = [1, 3, 5, 2, 1, 2, 4, 3, 1];
  const rightBars = [1, 3, 4, 2, 1, 2, 5, 3, 1];

  // 1. CÁLCULO DE DURACIÓN
  let maxDuration = 5; 
  if (gameState === 'won' || gameState === 'lost') {
    maxDuration = 30; 
  } else if (guesses.length >= 5) {
    maxDuration = 30; 
  } else if (guesses.length >= 2) {
    maxDuration = 10; 
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewAudio(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [maxDuration]);

  // 2. CONTROL DEL PLAY/PAUSE
  const togglePlay = () => {
    if (!audioRef.current || !targetSong?.previewUrl) return;
    if (hasNewAudio) setHasNewAudio(false);
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.currentTime >= maxDuration) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 3. ACTUALIZACIÓN DEL TIEMPO
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    
    const current = audioRef.current.currentTime;
    setCurrentTime(current);
    
    setProgress((current / maxDuration) * 100);

    if (current >= maxDuration) {
      audioRef.current.pause();
      audioRef.current.currentTime = maxDuration; 
      setIsPlaying(false);
    }
  };

  // 4. CLICK PARA MOVERSE (SCRUBBING) INSTANTÁNEO
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    setIsSeeking(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * maxDuration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage * 100);

    setTimeout(() => {
      setIsSeeking(false);
    }, 50);
  };

  // 5. RESETEO AL CAMBIAR TURNO
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const resetTimer = setTimeout(() => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    }, 0);

    return () => clearTimeout(resetTimer);
  }, [guesses.length, gameState]);

  if (!targetSong?.previewUrl) return null;

  return (
    <div className={cn("flex flex-col items-center w-full my-8 gap-8", className)}>
      
      <audio 
        ref={audioRef} 
        src={targetSong.previewUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />

      {/* --- DISEÑO DE ONDAS Y BOTÓN --- */}
      <div className="flex items-center justify-center w-full gap-2 md:gap-4">
        
        <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
          {leftBars.map((multiplier, i) => (
            <div 
              key={`l-${i}`} 
              className={cn(
                "w-1.5 md:w-2 rounded-full bg-spotydle/50 shadow-[0_0_10px_rgba(233,64,150,0.6)] origin-center",
                isPlaying ? "animate-sound" : "transition-transform duration-300"
              )}
              style={{ 
                height: `${multiplier * 10}px`,
                transform: isPlaying ? 'none' : 'scaleY(0.4)',
                animationDelay: `-${i * 0.15}s` 
              }}
            />
          ))}
        </div>

        <button 
          onClick={togglePlay}
          className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full bg-spotydle flex items-center justify-center shadow-[0_0_35px_rgba(233,64,150,0.5)] z-10 mx-2 cursor-pointer transition-all shrink-0",
            !isPlaying && hasNewAudio 
              ? "animate-pulse scale-105" 
              : "hover:scale-105 active:scale-95"
          )}
        >
          {isPlaying ? (
            <Pause size={36} className="text-[#2A2A2A] fill-current" />
          ) : (
            <Play size={36} className="text-[#2A2A2A] fill-current ml-2" />
          )}
        </button>

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
                animationDelay: `-${(rightBars.length - i) * 0.15}s` 
              }}
            />
          ))}
        </div>
      </div>

      {/* --- BARRA DE PROGRESO INFERIOR --- */}
      <div className="w-full flex flex-col gap-2 relative max-w-sm px-4">
        <div className="flex justify-end items-center px-1">
          <span className="text-[10px] md:text-xs font-mono font-bold text-spotydle">
            0:{Math.floor(currentTime) < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 0:{maxDuration < 10 ? `0${maxDuration}` : maxDuration}
          </span>
        </div>

        <div 
          className="w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden relative shadow-inner border border-white/5 cursor-pointer group hover:bg-[#333] transition-colors"
          onClick={handleSeek}
        >
          <div 
            className={cn(
              "h-full bg-spotydle rounded-full relative group-hover:brightness-110",
              !isSeeking && "transition-[width] duration-200 ease-linear"
            )}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px] rounded-full"></div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AudioPlayer;