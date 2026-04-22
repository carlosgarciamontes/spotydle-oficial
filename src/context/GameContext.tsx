'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GuessResult } from '@/components/game/GuessGrid'; 


export interface TargetSong {
  artist: string;
  title: string;
  coverUrl: string;
  previewUrl?: string; 
}


interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  currentAttempt: number;
  gameState: 'playing' | 'won' | 'lost';
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
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
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

  const currentAttempt = guesses.length + 1;


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

    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);


    if (newGuesses.length >= 6 && result !== 'correct') {
      setGameState('lost');
    }
  };


  const skipTurn = () => {
    if (gameState !== 'playing') return;

    const newGuesses = [...guesses, 'wrong' as GuessResult];
    setGuesses(newGuesses);

    if (newGuesses.length >= 6) {
      setGameState('lost');
    }
  };


  return (
    <GameContext.Provider value={{ targetSong, guesses, currentAttempt, gameState, submitGuess, skipTurn }}>
      {children}
    </GameContext.Provider>
  );
};


export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de un GameProvider');
  }
  return context;
};