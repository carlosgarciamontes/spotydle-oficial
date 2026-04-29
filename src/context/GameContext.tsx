'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GuessResult } from '@/components/game/GuessGrid'; 
import { Clue } from '@/components/game/Clues';
// Importamos la función de nuestro nuevo motor de música
import { getRandomTrackGlobal } from '@/services/itunesService'; 

// Ampliamos la interfaz para incluir el año y género que nos da iTunes
export interface TargetSong {
  artist: string;
  title: string;
  coverUrl: string;
  previewUrl?: string; 
  releaseYear?: number;
  genre?: string;
}

export interface GuessDetail {
  artist: string;
  song: string;
  artistCorrect: boolean;
  songCorrect: boolean;
}

interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  guessDetails: GuessDetail[];
  clues: Clue[]; 
  currentAttempt: number;
  gameState: 'playing' | 'won' | 'lost';
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
  checkAlreadyGuessed: (artist: string, title: string) => boolean; 
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Empezamos en null, sin mock
  const [targetSong, setTargetSong] = useState<TargetSong | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [guessDetails, setGuessDetails] = useState<GuessDetail[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const currentAttempt = guesses.length + 1;

  // ==========================================
  // CARGA INICIAL DE LA CANCIÓN DESDE ITUNES
  // ==========================================
  useEffect(() => {
    async function initGame() {
      const song = await getRandomTrackGlobal();
      if (song) {
        setTargetSong({
          artist: song.artist,
          title: song.title,
          coverUrl: song.coverUrl,
          previewUrl: song.previewUrl,
          releaseYear: song.releaseYear,
          genre: song.genre
        });
      }
    }
    initGame();
  }, []);

  // --- LÓGICA DE NEGOCIO: VALIDACIÓN DE REPETIDOS ---
  const checkAlreadyGuessed = (artist: string, title: string) => {
    return guessDetails.some(
      guess => guess.artist.toLowerCase() === artist.toLowerCase() && 
               guess.song.toLowerCase() === title.toLowerCase()
    );
  };

  // --- LÓGICA DE NEGOCIO: MOTOR DE PISTAS DINÁMICAS ---
  const clues: Clue[] = [
    { id: 1, type: "audio", label: "0:00 - 0:05", duration: 5, status: "locked" },
    { 
      id: 2, 
      type: "info", 
      label: "Ficha Técnica", 
      // Inyectamos el Año y Género reales de la canción
      infoData: [
        { label: "Año", value: targetSong?.releaseYear || "---" }, 
        { label: "Género", value: targetSong?.genre || "---" }
      ], 
      status: "locked" 
    },
    { id: 3, type: "audio", label: "0:00 - 0:10", duration: 10, status: "locked" },
    { id: 4, type: "info", label: "Vibe Check", infoData: [{ label: "Popularidad", value: "Top 100" }], status: "locked" },
    { id: 5, type: "visual", label: "Portada", imageUrl: targetSong?.coverUrl || "", blurLevel: 15, status: "locked" },
    { id: 6, type: "audio", label: "0:00 - 0:30", duration: 30, status: "locked" },
  ].map((clue, index) => {
    const baseClue = { ...clue } as Clue;

    // 1. Inyectamos texto del usuario
    if (guessDetails[index]) baseClue.userGuess = guessDetails[index];

    // 2. Estado base según el turno
    if (guesses.length === index) baseClue.status = "active";
    else if (guesses.length > index) baseClue.status = "failed";
    else baseClue.status = "locked";

    // 3. Sobrescribir victorias y parciales
    if (gameState === 'won' && index === guesses.length - 1) {
      baseClue.status = 'completed';
    } else if (guesses[index] === 'partial') {
      baseClue.status = 'partial';
    }

    // 4. Gestión específica del blur de la portada
    if (baseClue.type === 'visual') {
      baseClue.blurLevel = gameState === 'won' ? 0 : 15;
    }

    return baseClue as Clue;
  });

  const submitGuess = (userArtist: string, userTitle: string) => {
    if (gameState !== 'playing' || !targetSong) return;

    const artistMatch = userArtist.toLowerCase().trim() === targetSong.artist.toLowerCase().trim();
    const titleMatch = userTitle.toLowerCase().trim() === targetSong.title.toLowerCase().trim();

    let result: GuessResult;
    if (artistMatch && titleMatch) {
      result = 'correct';
      setGameState('won');
    } else if (artistMatch && !titleMatch) {
      result = 'partial';
    } else {
      result = 'wrong';
    }

    setGuesses([...guesses, result]);
    setGuessDetails([...guessDetails, {
      artist: userArtist,
      song: userTitle,
      artistCorrect: artistMatch,
      songCorrect: titleMatch
    }]);

    if (guesses.length + 1 >= 6 && result !== 'correct') {
      setGameState('lost');
    }
  };

  const skipTurn = () => {
    if (gameState !== 'playing') return;

    setGuesses([...guesses, 'wrong']);
    setGuessDetails([...guessDetails, {
      artist: "Skipped",
      song: "",
      artistCorrect: false,
      songCorrect: false
    }]);

    if (guesses.length + 1 >= 6) {
      setGameState('lost');
    }
  };

  return (
    <GameContext.Provider value={{ 
      targetSong, guesses, guessDetails, clues, currentAttempt, gameState, submitGuess, skipTurn, checkAlreadyGuessed 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de un GameProvider');
  return context;
};