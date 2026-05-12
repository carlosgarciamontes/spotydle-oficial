'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGame } from '@/context/GameContext';
import { useReverseAudio } from '@/hooks/useReverseAudio';

// --- 1. DEFINICIÓN DE LA NUEVA ANIMACIÓN AMIGABLE (PULSO DE BRILLO SUAVE) ---
const FriendlyUnlockAnimationCSS = () => (
  <style>{`
    @keyframes spotydle-unlock-soft {
      0% {
        transform: scale(1);
        box-shadow: 0 0 35px rgba(233, 64, 150, 0.5);
      }
      50% {
        transform: scale(1.1); /* Ligera expansión amigable */
        box-shadow: 0 0 60px rgba(233, 64, 150, 0.9); /* Brillo intenso suave */
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 35px rgba(233, 64, 150, 0.5);
      }
    }
    .animate-unlock-soft {
      animation: spotydle-unlock-soft 0.8s ease-in-out; /* Más lenta y suave */
      animation-iteration-count: 1;
    }
  `}</style>
);

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
  
  // --- 2. ESTADOS Y REFS PARA LA VIBRACIÓN/ANIMACIÓN AMIGABLE ---
  const [isVibrating, setIsVibrating] = useState(false); // Mantengo el nombre del estado por compatibilidad, pero es la animación suave
  const prevMaxDurationRef = useRef<number>(0); // Guardamos la duración anterior
  const prevIsReverseRef = useRef<boolean>(false); // Nuevo: Vigilamos el estado del invertido

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFadingOut = useRef(false);
  
  const leftBars = [1, 3, 5, 2, 1, 2, 4, 3, 1];
  const rightBars = [1, 3, 4, 2, 1, 2, 5, 3, 1];

  const { processReverseAudio, playReversed, stopReversed, isReversedReady } = useReverseAudio();

  useEffect(() => {
    if (targetSong?.previewUrl) {
      processReverseAudio(targetSong.previewUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetSong?.previewUrl]);

  // Lógica de turnos invariable
  let maxDuration = 0; 
  let isReverseTurn = false;

  if (gameState === 'won' || gameState === 'lost') {
    maxDuration = 30; 
    isReverseTurn = false;
  } else {
    const fallos = guesses.length;
    if (fallos === 0) { maxDuration = 0; } 
    else if (fallos === 1 || fallos === 2) { maxDuration = 5; isReverseTurn = true; } 
    else if (fallos === 3 || fallos === 4) { maxDuration = 5; isReverseTurn = false; } 
    else if (fallos >= 5) { maxDuration = 15; isReverseTurn = false; }
  }

  // --- 3. LÓGICA DE DETECCION DE DESBLOQUEO MULTI-PISTA (Mecanismo amigable) ---
  useEffect(() => {
    // Definimos los 3 momentos clave de desbloqueo:
    const hasUnlockedInverted = prevMaxDurationRef.current === 0 && maxDuration === 5;
    const hasUnlockedNormal5s = prevIsReverseRef.current === true && isReverseTurn === false;
    const hasUnlockedNormal15s = prevMaxDurationRef.current === 5 && maxDuration === 15;

    // Si ocurre cualquiera de los tres desbloqueos
    if (hasUnlockedInverted || hasUnlockedNormal5s || hasUnlockedNormal15s) {
      setIsVibrating(true); // Encendemos la animación suave

      // Feedback sensorial: una vibración haptic súper corta si el móvil lo permite
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // 50ms es casi imperceptible, solo un "toque" suave
      }

      // Apagamos la animación después de 800ms (lo que dura la animación amigable)
      setTimeout(() => setIsVibrating(false), 800); 
    }

    // Actualizamos las referencias para el próximo render
    prevMaxDurationRef.current = maxDuration;
    prevIsReverseRef.current = isReverseTurn;
  }, [maxDuration, isReverseTurn]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setHasNewAudio(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [maxDuration]);

  // Simulador barra invariable
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isReverseTurn) {
      const startTime = Date.now() - (currentTime * 1000);
      interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= maxDuration) {
          setIsPlaying(false);
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
    if (!audioRef.current || !targetSong?.previewUrl || maxDuration === 0) return;
    if (hasNewAudio) setHasNewAudio(false);
    
    if (isPlaying) {
      if (isReverseTurn) { stopReversed(); } 
      else { audioRef.current.pause(); }
      setIsPlaying(false);
    } else {
      if (isReverseTurn) {
        if (isReversedReady) {
          if (currentTime >= maxDuration) { setCurrentTime(0); setProgress(0); }
          playReversed(maxDuration);
          setIsPlaying(true);
        } else { console.log("Audio procesándose..."); }
      } else {
        if (audioRef.current.currentTime >= maxDuration) { audioRef.current.currentTime = 0; }
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
            audioRef.current.pause();
            audioRef.current.volume = 0;
            audioRef.current.currentTime = maxDuration;
          }
          setIsPlaying(false);
        }
      }, 80); 
    }
    if (current >= maxDuration && !isFadingOut.current) {
      audioRef.current.pause(); audioRef.current.currentTime = maxDuration; setIsPlaying(false);
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
      const resetTimer = setTimeout(() => { setIsPlaying(false); setProgress(0); setCurrentTime(0); }, 0);
      return () => clearTimeout(resetTimer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses.length, gameState]);

  if (!targetSong?.previewUrl) return null;

  return (
    <div className={cn("flex flex-col items-center w-full my-8 gap-8 relative", className)}>
      
      {/* 4. INYECTAMOS LA NUEVA ANIMACIÓN AMIGABLE */}
      <FriendlyUnlockAnimationCSS />

      <audio 
        ref={audioRef} 
        src={targetSong.previewUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
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
          disabled={maxDuration === 0}
          className={cn(
            // Fondo rosa y sombra vibrante invariables
            "w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center z-10 mx-2 transition-all shrink-0 bg-spotydle shadow-[0_0_35px_rgba(233,64,150,0.5)]",
            
            // Cursores
            maxDuration === 0 ? "cursor-not-allowed" : "cursor-pointer",
            
            // --- 5. MODIFICACIÓN DE LA LÓGICA DE ANIMACIÓN DEL BOTÓN ---
            // A. Mantenemos: No parpadea si está bloqueado.
            // B. Mantenemos: Parpadea (pulse) SOLO si hay audio (maxDuration > 0).
            !isPlaying && hasNewAudio && maxDuration > 0 && "animate-pulse scale-105", 
            
            // C. Mantenemos: Solo permitimos hover si está desbloqueado.
            maxDuration > 0 && "hover:scale-105 active:scale-95",

            // D. NUEVO: Añadimos la NUEVA clase de animación suave (animate-unlock-soft) si el estado es true.
            isVibrating && "animate-unlock-soft"
          )}
        >
          {maxDuration === 0 ? (
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