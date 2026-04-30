"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { GuessResult } from "@/components/game/GuessGrid";
import { Clue } from "@/components/game/Clues";
import { getDailyTrack } from "@/lib/dailySelector";

export interface TargetSong {
  artist: string;
  title: string;
  coverUrl: string;
  previewUrl?: string;
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

// --- NUEVAS INTERFACES PARA ESTADÍSTICAS ---
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[]; // [Intento 1, Intento 2, ..., Intento 6]
  lastCompletedDate: string | null;
}

interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  guessDetails: GuessDetail[];
  clues: Clue[];
  currentAttempt: number;
  gameState: "playing" | "won" | "lost";
  stats: GameStats; // Añadimos stats al Contexto
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
  checkAlreadyGuessed: (artist: string, title: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = "spotydle_daily_save";
const STATS_STORAGE_KEY = "spotydle_stats";

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastCompletedDate: null,
};

// Función para obtener la fecha de hoy en texto (ej: "2026-4-30")
const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Empezamos en null, sin mock
  const [targetSong, setTargetSong] = useState<TargetSong | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [guessDetails, setGuessDetails] = useState<GuessDetail[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">(
    "playing",
  );
  // Estado para las estadísticas
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);

  const currentAttempt = guesses.length + 1;

  // ==========================================
  // CARGA INICIAL: CANCIÓN, PARTIDA Y ESTADÍSTICAS
  // ==========================================
  useEffect(() => {
    async function initGame() {
      // 1. Cargamos la canción del día
      const song = await getDailyTrack("test_collab");
      if (song) {
        setTargetSong({
          artist: song.artist,
          title: song.title,
          coverUrl: song.coverUrl,
          previewUrl: song.previewUrl,
          releaseYear: song.releaseYear,
          genre: song.genre,
          isExplicit: song.isExplicit,
        });
      }

      // 2. Comprobamos si hay partida guardada en el navegador
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          if (parsedData.date === getTodayDateString()) {
            setGuesses(parsedData.guesses);
            setGuessDetails(parsedData.guessDetails);
            setGameState(parsedData.gameState);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (error) {
          console.error("Error leyendo el LocalStorage", error);
        }
      }

      // 3. Cargamos las estadísticas históricas
      const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (error) {
          console.error("Error leyendo estadísticas", error);
        }
      }
    }
    initGame();
  }, []);

  // ==========================================
  // AUTOGUARDADO DE LA PARTIDA ACTUAL
  // ==========================================
  useEffect(() => {
    if (targetSong) {
      const saveData = {
        date: getTodayDateString(),
        guesses,
        guessDetails,
        gameState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    }
  }, [guesses, guessDetails, gameState, targetSong]);

  // ==========================================
  // MOTOR DE ESTADÍSTICAS
  // ==========================================
  const handleGameEnd = (finalState: "won" | "lost", totalAttempts: number) => {
    const today = getTodayDateString();

    setStats((prevStats) => {
      // Si ya habíamos registrado la partida de hoy, evitamos duplicados
      if (prevStats.lastCompletedDate === today) return prevStats;

      const newStats = { ...prevStats };
      newStats.gamesPlayed += 1;
      newStats.lastCompletedDate = today;

      if (finalState === "won") {
        newStats.gamesWon += 1;
        newStats.currentStreak += 1;
        if (newStats.currentStreak > newStats.maxStreak) {
          newStats.maxStreak = newStats.currentStreak;
        }
        
        // Sumamos 1 al intento en el que ganó
        const winIndex = Math.max(0, totalAttempts - 1);
        newStats.distribution[winIndex] += 1;
      } 
      
      if (finalState === "lost") {
        newStats.currentStreak = 0; 
      }

      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  };

  // --- LÓGICA DE NEGOCIO: VALIDACIÓN DE REPETIDOS ---
  const checkAlreadyGuessed = (artist: string, title: string) => {
    return guessDetails.some(
      (guess) =>
        guess.artist.toLowerCase() === artist.toLowerCase() &&
        guess.song.toLowerCase() === title.toLowerCase(),
    );
  };

  // --- LÓGICA DE NEGOCIO: MOTOR DE PISTAS DINÁMICAS ---
  const clues: Clue[] = [
    { id: 1, type: "audio", label: "0:00 - 0:05", duration: 5, status: "locked" },
    {
      id: 2,
      type: "info",
      label: "Ficha Técnica",
      infoData: [
        { label: "Año", value: targetSong?.releaseYear || "---" },
        { label: "Género", value: targetSong?.genre || "---" },
      ],
      status: "locked",
    },
    { id: 3, type: "audio", label: "0:00 - 0:10", duration: 10, status: "locked" },
    {
      id: 4,
      type: "info",
      label: "Vibe Check",
      infoData: [{ label: "Popularidad", value: "Top 100" }],
      status: "locked",
    },
    {
      id: 5,
      type: "visual",
      label: "Portada",
      imageUrl: targetSong?.coverUrl || "",
      blurLevel: 15,
      status: "locked",
    },
    { id: 6, type: "audio", label: "0:00 - 0:30", duration: 30, status: "locked" },
  ].map((clue, index) => {
    const baseClue = { ...clue } as Clue;
    if (guessDetails[index]) baseClue.userGuess = guessDetails[index];

    if (guesses.length === index) baseClue.status = "active";
    else if (guesses.length > index) baseClue.status = "failed";
    else baseClue.status = "locked";

    if (gameState === "won" && index === guesses.length - 1) {
      baseClue.status = "completed";
    } else if (guesses[index] === "partial") {
      baseClue.status = "partial";
    }

    if (baseClue.type === "visual") {
      baseClue.blurLevel = gameState === "won" ? 0 : 15;
    }

    return baseClue as Clue;
  });

  const submitGuess = (userArtist: string, userTitle: string) => {
    if (gameState !== "playing" || !targetSong) return;

    const artistMatch = checkArtistMatch(userArtist, targetSong.artist);
    const titleMatch =
      userTitle.toLowerCase().trim() === targetSong.title.toLowerCase().trim();

    let result: GuessResult;
    let newGameState = gameState;

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
    setGuessDetails([
      ...guessDetails,
      {
        artist: userArtist,
        song: userTitle,
        artistCorrect: artistMatch,
        songCorrect: titleMatch,
      },
    ]);

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
    setGuessDetails([
      ...guessDetails,
      {
        artist: "Skipped",
        song: "",
        artistCorrect: false,
        songCorrect: false,
      },
    ]);

    if (newGuesses.length >= 6) {
      setGameState("lost");
      handleGameEnd("lost", newGuesses.length);
    }
  };

  return (
    <GameContext.Provider
      value={{
        targetSong,
        guesses,
        guessDetails,
        clues,
        currentAttempt,
        gameState,
        stats,
        submitGuess,
        skipTurn,
        checkAlreadyGuessed,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context)
    throw new Error("useGame debe usarse dentro de un GameProvider");
  return context;
};

// Función inteligente para detectar coincidencias en colaboraciones
const checkArtistMatch = (
  userArtist: string,
  targetArtist: string,
): boolean => {
  if (userArtist.toLowerCase().trim() === targetArtist.toLowerCase().trim())
    return true;

  const normalizeAndSplit = (str: string) => {
    return (
      str
        .toLowerCase()
        .replace(/ feat\.? | ft\.? | & | y | x | \+ /gi, ",")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
    );
  };

  const userParts = normalizeAndSplit(userArtist);
  const targetParts = normalizeAndSplit(targetArtist);

  return userParts.some((userPart) => targetParts.includes(userPart));
};