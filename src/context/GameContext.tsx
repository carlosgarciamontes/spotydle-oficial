'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GuessResult } from '@/components/game/GuessGrid'; 
import { Clue } from '@/components/game/Clues'; // <-- IMPORTAMOS LA INTERFAZ

export interface TargetSong {
  artist: string;
  title: string;
  coverUrl: string;
  previewUrl?: string; 
}

export interface GuessDetail {
  artist: string;
  song: string;
  artistCorrect: boolean;
  songCorrect: boolean;
}

// ACTUALIZAMOS EL CONTRATO QUE SE EXPORTA A LA APP
interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  guessDetails: GuessDetail[];
  clues: Clue[]; // <-- EL CEREBRO AHORA PROVEE LAS PISTAS LISTAS PARA PINTAR
  currentAttempt: number;
  gameState: 'playing' | 'won' | 'lost';
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
  checkAlreadyGuessed: (artist: string, title: string) => boolean; // <-- NUEVA HERRAMIENTA
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const MOCK_TARGET_SONG: TargetSong = {
  artist: "Linkin Park",
  title: "In The End",
  coverUrl: "https://i.scdn.co/image/ab67616d0000b273e8b066f70c206551210d902b"
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [targetSong, setTargetSong] = useState<TargetSong | null>(MOCK_TARGET_SONG);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [guessDetails, setGuessDetails] = useState<GuessDetail[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const currentAttempt = guesses.length + 1;

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
    { id: 2, type: "info", label: "Ficha Técnica", infoData: [{ label: "Año", value: 2000 }, { label: "Género", value: "Nu Metal" }], status: "locked" },
    { id: 3, type: "audio", label: "0:00 - 0:10", duration: 10, status: "locked" },
    { id: 4, type: "info", label: "Vibe Check", infoData: [{ label: "Popularidad", value: "Top 100" }], status: "locked" },
    { id: 5, type: "visual", label: "Portada", imageUrl: targetSong?.coverUrl || "", blurLevel: 15, status: "locked" },
    { id: 6, type: "audio", label: "0:00 - 0:30", duration: 30, status: "locked" },
  ].map((clue, index) => {
    const baseClue = { ...clue };

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
    if (clue.id === 5) {
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