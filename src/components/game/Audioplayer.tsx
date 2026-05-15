'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { useReverseAudio } from '@/hooks/useReverseAudio';

const FriendlyUnlockAnimationCSS = () => (
  <style>{`
    @keyframes spotydle-unlock-soft {
      0% {
        transform: scale(1);
        box-shadow: 0 0 35px rgba(233, 64, 150, 0.5);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 0 60px rgba(233, 64, 150, 0.9);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 35px rgba(233, 64, 150, 0.5);
      }
    }
    .animate-unlock-soft {
      animation: spotydle-unlock-soft 0.8s ease-in-out;
      animation-iteration-count: 1;
    }
  `}</style>
);

interface AudioPlayerProps {
  className?: string;
  autoPlayClueId?: number | null;
  onPlayClear?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ className, autoPlayClueId, onPlayClear }) => {
  const { targetSong, guesses, gameState, clues } = useGame();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasNewAudio, setHasNewAudio] = useState(true);
  
  const [isVibrating, setIsVibrating] = useState(false);
  const [overrideClue, setOverrideClue] = useState<{ maxDuration: number, isReverseTurn: boolean } | null>(null);
  const prevFallosRef = useRef<number>(guesses.length);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFadingOut = useRef(false);
  
  const leftBars = [1, 3, 5, 2, 1, 2, 4, 3, 1];
  const rightBars = [1, 3, 4, 2, 1, 2, 5, 3, 1];

  const { processReverseAudio, playReversed, stopReversed, isReversedReady } = useReverseAudio();

  // Limpieza segura al salir de la página
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (targetSong?.previewUrl) {
      processReverseAudio(targetSong.previewUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSong?.previewUrl]);

  // --- LÓGICA DINÁMICA DEL REPRODUCTOR PRINCIPAL ---
  let defaultMaxDuration = 0; 
  let defaultIsReverseTurn = false;

  if (gameState === 'won' || gameState === 'lost') {
    defaultMaxDuration = 30; 
    defaultIsReverseTurn = false;
  } else {
    const fallos = guesses.length;
    // Buscamos hacia atrás cuál fue el último audio desbloqueado
    for (let i = fallos; i >= 0; i--) {
      const clue = clues[i];
      if (clue && clue.type === 'audio') {
        defaultMaxDuration = clue.duration;
        defaultIsReverseTurn = clue.label.toLowerCase().includes('invertido');
        break;
      }
    }
  }

  const maxDuration = overrideClue ? overrideClue.maxDuration : defaultMaxDuration;
  const isReverseTurn = overrideClue ? overrideClue.isReverseTurn : defaultIsReverseTurn;

  // --- PARCHE iPHONE: Cortafuegos de precisión ---
  useEffect(() => {
    let safetyNet: NodeJS.Timeout;
    if (isPlaying && !isReverseTurn && maxDuration > 0) {
      safetyNet = setInterval(() => {
        if (audioRef.current && audioRef.current.currentTime >= maxDuration) {
          audioRef.current.pause();
          audioRef.current.currentTime = maxDuration;
          setCurrentTime(maxDuration);
          setProgress(100);
          setIsPlaying(false);
          setOverrideClue(null);
          clearInterval(safetyNet);
        }
      }, 50); // Chequea cada 50ms para que iOS no se pase del tiempo
    }
    return () => clearInterval(safetyNet);
  }, [isPlaying, isReverseTurn, maxDuration]);

  // --- LÓGICA DINÁMICA AL PULSAR UNA PASTILLA DE AUDIO ---
  useEffect(() => {
    if (autoPlayClueId) {
      const clickedClue = clues.find(c => c.id === autoPlayClueId);
      
      if (clickedClue && clickedClue.type === 'audio') {
        const newMax = clickedClue.duration;
        const newRev = clickedClue.label.toLowerCase().includes('invertido');

        if (isPlaying) {
          if (isReverseTurn) stopReversed();
          else audioRef.current?.pause();
        }

        setOverrideClue({ maxDuration: newMax, isReverseTurn: newRev });
        setCurrentTime(0);
        setProgress(0);
        
        setTimeout(() => {
          if (newRev) {
            if (isReversedReady) {
              playReversed(newMax);
              setIsPlaying(true);
            }
          } else {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.volume = 1;
              isFadingOut.current = false;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error(e));
            }
          }
        }, 50);
      }

      if (onPlayClear) onPlayClear();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlayClueId, clues]);

  // --- VIBRACIÓN AL DESBLOQUEAR NUEVA PISTA DE AUDIO ---
  useEffect(() => {
    const prevFallos = prevFallosRef.current;
    const currentFallos = guesses.length;
    
    if (currentFallos > prevFallos) {
      const newlyUnlockedClue = clues[currentFallos];
      if (newlyUnlockedClue && newlyUnlockedClue.type === 'audio') {
        setIsVibrating(true);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
        setTimeout(() => setIsVibrating(false), 800);
      }
    }
    prevFallosRef.current = currentFallos;
  }, [guesses.length, clues]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewAudio(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [defaultMaxDuration, defaultIsReverseTurn]);

  // Lógica del audio invertido
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isReverseTurn) {
      const startTime = Date.now() - (currentTime * 1000);
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= maxDuration) {
          setIsPlaying(false);
          setOverrideClue(null);
          setCurrentTime(maxDuration);
          setProgress(100);
          clearInterval(interval);
        } else {
          setCurrentTime(elapsed);
          setProgress((elapsed / maxDuration) * 100);
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isReverseTurn, maxDuration, currentTime]);

  const togglePlay = () => {
    if (!audioRef.current || !targetSong?.previewUrl || defaultMaxDuration === 0) return;
    if (hasNewAudio) setHasNewAudio(false);
    
    if (isPlaying) {
      if (isReverseTurn) { stopReversed(); } 
      else { audioRef.current.pause(); }
      setIsPlaying(false);
      setOverrideClue(null);
    } else {
      setOverrideClue(null);
      const playMax = defaultMaxDuration;
      const playRev = defaultIsReverseTurn;

      if (playRev) {
        if (isReversedReady) {
          if (currentTime >= playMax) { setCurrentTime(0); setProgress(0); }
          playReversed(playMax);
          setIsPlaying(true);
        }
      } else {
        if (audioRef.current.currentTime >= playMax) { audioRef.current.currentTime = 0; }
        audioRef.current.volume = 1;
        isFadingOut.current = false;
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeeking || isReverseTurn) return;
    const current = audioRef.current.currentTime;
    setCurrentTime(current);
    setProgress((current / maxDuration) * 100);
    
    const fadeStartTime = maxDuration - 1.2;
    if (current >= fadeStartTime && !isFadingOut.current && isPlaying) {
      isFadingOut.current = true;
      const fadeInterval = setInterval(() => {
        if (audioRef.current && audioRef.current.volume > 0.1) {
          audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.15);
        } else {
          clearInterval(fadeInterval);
          if (audioRef.current) {
            audioRef.current.volume = 0; 
          }
        }
      }, 80); 
    }
    
    
    if (current >= maxDuration) {
      audioRef.current.pause(); 
      audioRef.current.currentTime = maxDuration; 
      setIsPlaying(false); 
      setOverrideClue(null);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || maxDuration === 0) return;
    setIsSeeking(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = percentage * maxDuration;
    setCurrentTime(newTime);
    setProgress(percentage * 100);
    if (isReverseTurn) { if (isPlaying) { stopReversed(); playReversed(maxDuration); } } 
    else { audioRef.current.volume = 1; isFadingOut.current = false; audioRef.current.currentTime = newTime; }
    setTimeout(() => setIsSeeking(false), 50);
  };

  useEffect(() => {
    if (!audioRef.current) return;
    setOverrideClue(null);
    
    if (gameState === 'won' || gameState === 'lost') {
      stopReversed();
      audioRef.current.currentTime = 15; audioRef.current.volume = 0; isFadingOut.current = false;
      const autoPlayTimer = setTimeout(() => {
        setCurrentTime(15); setProgress(50);
        audioRef.current?.play().then(() => {
          setIsPlaying(true); setHasNewAudio(false);
          let vol = 0;
          const fadeInterval = setInterval(() => {
            if (vol < 0.95 && audioRef.current) { vol += 0.05; audioRef.current.volume = vol; } 
            else { if (audioRef.current) audioRef.current.volume = 1; clearInterval(fadeInterval); }
          }, 75);
        }).catch(err => console.error("Autoplay blocked:", err));
      }, 0);
      return () => clearTimeout(autoPlayTimer);
    } else {
      audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current.volume = 1; isFadingOut.current = false; stopReversed();
      const resetTimer = setTimeout(() => { setIsPlaying(false); setProgress(0); setCurrentTime(0); setOverrideClue(null); }, 0);
      return () => clearTimeout(resetTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses.length, gameState]);

  if (!targetSong?.previewUrl) return null;

  return (
    <div className={cn("flex flex-col items-center w-full my-8 gap-8 relative", className)}>
      
      <FriendlyUnlockAnimationCSS />

      <audio 
        ref={audioRef} 
        src={targetSong.previewUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setIsPlaying(false); setOverrideClue(null); }}
      />

      <div className="flex items-center justify-center w-full gap-2 md:gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
          {leftBars.map((multiplier, i) => (
            <div 
              key={`l-${i}`} 
              className={cn(
                "w-1.5 md:w-2 rounded-full origin-center transition-transform duration-300 bg-spotydle/50 shadow-[0_0_10px_rgba(233,64,150,0.6)]",
                isPlaying && "animate-sound",
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
          disabled={defaultMaxDuration === 0}
          className={cn(
            "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center z-10 mx-2 transition-all shrink-0 bg-spotydle shadow-[0_0_35px_rgba(233,64,150,0.5)]",
            defaultMaxDuration === 0 ? "cursor-not-allowed" : "cursor-pointer",
            !isPlaying && hasNewAudio && defaultMaxDuration > 0 && "animate-pulse scale-105", 
            defaultMaxDuration > 0 && "hover:scale-105 active:scale-95",
            isVibrating && "animate-unlock-soft"
          )}
        >
          {defaultMaxDuration === 0 ? (
            <Lock size={36} className="text-[#2A2A2A]" />
          ) : isPlaying ? (
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
                "w-1.5 md:w-2 rounded-full origin-center transition-transform duration-300 bg-spotydle/50 shadow-[0_0_10px_rgba(233,64,150,0.6)]",
                isPlaying && "animate-sound",
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

      <div className="w-full flex flex-col gap-2 relative max-w-sm px-4">
        <div className="flex justify-end items-center px-1">
          <span className="text-[10px] md:text-xs font-mono font-bold text-spotydle">
            0:{Math.floor(currentTime) < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)} / 0:{maxDuration < 10 ? `0${maxDuration}` : maxDuration}
          </span>
        </div>

        <div 
          className={cn(
            "w-full h-2 bg-[#2A2A2A] rounded-full overflow-hidden relative shadow-inner border border-white/5 transition-colors",
            maxDuration === 0 ? "cursor-not-allowed" : "cursor-pointer group hover:bg-[#333]"
          )}
          onClick={maxDuration > 0 ? handleSeek : undefined}
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