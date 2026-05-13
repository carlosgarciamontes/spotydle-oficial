"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { GuessResult } from "@/components/game/GuessGrid";
import { Clue } from "@/components/game/Clues";
import { getDailyModeTrack } from "@/lib/dailySelector";

export interface TargetSong {
  artist: string;
  title: string;
  coverUrl: string;
  previewUrl?: string;
  appleMusicUrl?: string;
  releaseYear?: number;
  genre?: string;
  isExplicit?: boolean;
}

export interface GuessDetail {
  artist: string;
  song: string;
  artistCorrect: boolean;
  songCorrect: boolean;
}

export interface ModeStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[];
  lastCompletedDate: string | null;
}

export type GameStats = Record<string, ModeStats>;

interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  guessDetails: GuessDetail[];
  clues: Clue[];
  currentAttempt: number;
  gameState: "playing" | "won" | "lost";
  stats: GameStats;
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
  checkAlreadyGuessed: (artist: string, title: string) => boolean;
  initMode: (slug: string) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const createEmptyStats = (): ModeStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastCompletedDate: null,
});

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

const getInitials = (text: string) => {
  if (!text) return "---";
  const cleanText = text
    .replace(/\s*[([].*?[)\]]/g, "")
    .replace(/\s+(feat\.?|ft\.?|featuring)\s+.*/i, "")
    .replace(/\s+-\s+.*/, "")
    .trim();

  return cleanText
    .split(" ")
    .map((word) => {
      const match = word.match(/[a-zA-Z0-9]/);
      return match ? match[0].toUpperCase() : "";
    })
    .filter((char) => char !== "")
    .join(".");
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  
  const [targetSong, setTargetSong] = useState<TargetSong | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [guessDetails, setGuessDetails] = useState<GuessDetail[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [stats, setStats] = useState<GameStats>({});
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  const currentAttempt = guesses.length + 1;

  const getStorageKey = (type: "save", slug: string) => {
    const userId = session?.user?.email || "guest";
    return `spotydle_${type}_${userId}_${slug}`;
  };

  const initMode = async (slug: string) => {
    if (currentSlug === slug) return;
    setCurrentSlug(slug);
    
    const storageKey = getStorageKey("save", slug);
    const savedData = localStorage.getItem(storageKey);
    let loadedFromSave = false;

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.date === getTodayDateString() && parsedData.targetSong) {
          setTargetSong(parsedData.targetSong);
          setGuesses(parsedData.guesses);
          setGuessDetails(parsedData.guessDetails);
          setGameState(parsedData.gameState);
          loadedFromSave = true;
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error(error);
      }
    }

    if (!loadedFromSave) {
      setGuesses([]);
      setGuessDetails([]);
      setGameState("playing");
      setTargetSong(null);

      const dailyTrack = await getDailyModeTrack(slug);
      
      if (dailyTrack) {
        const trackData = dailyTrack as unknown as Record<string, unknown>;
        const appleUrl = (trackData.trackViewUrl || trackData.appleMusicUrl) as string | undefined;
        setTargetSong({
          artist: dailyTrack.artist,
          title: dailyTrack.title,
          coverUrl: dailyTrack.coverUrl,
          previewUrl: dailyTrack.previewUrl,
          appleMusicUrl: appleUrl,
          releaseYear: dailyTrack.releaseYear,
          genre: dailyTrack.genre,
          isExplicit: dailyTrack.isExplicit,
        });
      }
    }
  };

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, [session?.user?.email]);

  useEffect(() => {
    if (targetSong && currentSlug && session?.user?.email) {
      const storageKey = getStorageKey("save", currentSlug);
      const saveData = {
        date: getTodayDateString(),
        targetSong,
        guesses,
        guessDetails,
        gameState,
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
    }
  }, [guesses, guessDetails, gameState, targetSong, currentSlug, session?.user?.email]);

  const handleGameEnd = async (finalState: "won" | "lost", totalAttempts: number) => {
    if (!currentSlug) return;
    const today = getTodayDateString();

    setStats((prevStats) => {
      const modeKey = currentSlug;
      const currentModeStats = prevStats[modeKey] || createEmptyStats();

      if (modeKey === "daily" && currentModeStats.lastCompletedDate === today) {
        return prevStats;
      }

      const updatedModeStats = { ...currentModeStats };
      updatedModeStats.gamesPlayed += 1;

      if (modeKey === "daily") {
        updatedModeStats.lastCompletedDate = today;
      }

      if (finalState === "won") {
        updatedModeStats.gamesWon += 1;
        updatedModeStats.currentStreak += 1;
        if (updatedModeStats.currentStreak > updatedModeStats.maxStreak) {
          updatedModeStats.maxStreak = updatedModeStats.currentStreak;
        }
        const winIndex = Math.max(0, totalAttempts - 1);
        updatedModeStats.distribution[winIndex] += 1;
      } else {
        updatedModeStats.currentStreak = 0;
      }

      return { ...prevStats, [modeKey]: updatedModeStats };
    });

    try {
      await fetch("/api/stats/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modeSlug: currentSlug,
          finalState,
          totalAttempts,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const checkAlreadyGuessed = (artist: string, title: string) => {
    return guessDetails.some(
      (guess) =>
        guess.artist.toLowerCase() === artist.toLowerCase() &&
        guess.song.toLowerCase() === title.toLowerCase(),
    );
  };

  const clues: Clue[] = [
    { id: 1, type: "audio", label: "Audio Invertido (5s)", duration: 5, status: "locked" },
    { id: 2, type: "info", label: "Ficha Técnica", infoData: [{ label: "Año", value: targetSong?.releaseYear || "---" }, { label: "Género", value: targetSong?.genre || "---" }], status: "locked" },
    { id: 3, type: "visual", label: "Portada", imageUrl: targetSong?.coverUrl || "", blurLevel: 15, status: "locked" },
    { id: 4, type: "audio", label: "0:00 - 0:05", duration: 5, status: "locked" },
    { id: 5, type: "info", label: "Iniciales", infoData: [{ label: "Artista", value: targetSong ? getInitials(targetSong.artist) : "---" }, { label: "Canción", value: targetSong ? getInitials(targetSong.title) : "---" }], status: "locked" },
    { id: 6, type: "audio", label: "0:00 - 0:15", duration: 15, status: "locked" },
  ].map((clue, index) => {
    const baseClue = { ...clue } as Clue;
    if (guessDetails[index]) baseClue.userGuess = guessDetails[index];
    if (guesses.length === index) baseClue.status = "active";
    else if (guesses.length > index) baseClue.status = "failed";
    else baseClue.status = "locked";
    if (gameState === "won" && index === guesses.length - 1) baseClue.status = "completed";
    else if (guesses[index] === "partial") baseClue.status = "partial";
    if (baseClue.type === "visual") baseClue.blurLevel = gameState === "won" ? 0 : 15;
    return baseClue as Clue;
  });

  const submitGuess = (userArtist: string, userTitle: string) => {
    if (gameState !== "playing" || !targetSong) return;
    const artistMatch = checkArtistMatch(userArtist, targetSong.artist);
    const titleMatch = userTitle.toLowerCase().trim() === targetSong.title.toLowerCase().trim();
    let result: GuessResult;
    let newGameState: "playing" | "won" | "lost" = gameState;

    if (artistMatch && titleMatch) {
      result = "correct";
      newGameState = "won";
    } else if (artistMatch && !titleMatch) {
      result = "partial";
    } else {
      result = "wrong";
    }

    const newGuesses = [...guesses, result];
    setGuesses(newGuesses);
    setGuessDetails([...guessDetails, { artist: userArtist, song: userTitle, artistCorrect: artistMatch, songCorrect: titleMatch }]);

    if (newGuesses.length >= 6 && result !== "correct") {
      newGameState = "lost";
    }
    if (newGameState !== "playing") {
      setGameState(newGameState);
      handleGameEnd(newGameState, newGuesses.length);
    }
  };

  const skipTurn = () => {
    if (gameState !== "playing") return;
    const newGuesses: GuessResult[] = [...guesses, "wrong"];
    setGuesses(newGuesses);
    setGuessDetails([...guessDetails, { artist: "Skipped", song: "", artistCorrect: false, songCorrect: false }]);
    if (newGuesses.length >= 6) {
      setGameState("lost");
      handleGameEnd("lost", newGuesses.length);
    }
  };

  return (
    <GameContext.Provider value={{ targetSong, guesses, guessDetails, clues, currentAttempt, gameState, stats, submitGuess, skipTurn, checkAlreadyGuessed, initMode }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame debe usarse dentro de un GameProvider");
  return context;
};

const checkArtistMatch = (userArtist: string, targetArtist: string): boolean => {
  if (userArtist.toLowerCase().trim() === targetArtist.toLowerCase().trim()) return true;
  const normalizeAndSplit = (str: string) => {
    return str
      .toLowerCase()
      .replace(/ feat\.? | ft\.? | & | y | x | \+ /gi, ",")
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);
  };
  const userParts = normalizeAndSplit(userArtist);
  const targetParts = normalizeAndSplit(targetArtist);
  return userParts.some((userPart) => targetParts.includes(userPart));
};