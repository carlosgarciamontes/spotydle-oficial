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

interface GameContextType {
  targetSong: TargetSong | null;
  guesses: GuessResult[];
  guessDetails: GuessDetail[];
  clues: Clue[];
  currentAttempt: number;
  gameState: "playing" | "won" | "lost";
  submitGuess: (userArtist: string, userTitle: string) => void;
  skipTurn: () => void;
  checkAlreadyGuessed: (artist: string, title: string) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = "spotydle_daily_save";

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

  const currentAttempt = guesses.length + 1;

  // ==========================================
  // CARGA INICIAL: CANCIÓN Y PARTIDA GUARDADA
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
          // Si la partida guardada es de hoy, restauramos el progreso
          if (parsedData.date === getTodayDateString()) {
            setGuesses(parsedData.guesses);
            setGuessDetails(parsedData.guessDetails);
            setGameState(parsedData.gameState);
          } else {
            // Si es de un día anterior, limpiamos la basura
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (error) {
          console.error("Error leyendo el LocalStorage", error);
        }
      }
    }
    initGame();
  }, []);

  // ==========================================
  // AUTOGUARDADO EN LOCALSTORAGE
  // ==========================================
  useEffect(() => {
    // Solo guardamos si ya se ha cargado la canción (para evitar sobreescribir con arrays vacíos por error)
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
    {
      id: 1,
      type: "audio",
      label: "0:00 - 0:05",
      duration: 5,
      status: "locked",
    },
    {
      id: 2,
      type: "info",
      label: "Ficha Técnica",
      // Inyectamos el Año y Género reales de la canción
      infoData: [
        { label: "Año", value: targetSong?.releaseYear || "---" },
        { label: "Género", value: targetSong?.genre || "---" },
      ],
      status: "locked",
    },
    {
      id: 3,
      type: "audio",
      label: "0:00 - 0:10",
      duration: 10,
      status: "locked",
    },
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
    {
      id: 6,
      type: "audio",
      label: "0:00 - 0:30",
      duration: 30,
      status: "locked",
    },
  ].map((clue, index) => {
    const baseClue = { ...clue } as Clue;

    // 1. Inyectamos texto del usuario
    if (guessDetails[index]) baseClue.userGuess = guessDetails[index];

    // 2. Estado base según el turno
    if (guesses.length === index) baseClue.status = "active";
    else if (guesses.length > index) baseClue.status = "failed";
    else baseClue.status = "locked";

    // 3. Sobrescribir victorias y parciales
    if (gameState === "won" && index === guesses.length - 1) {
      baseClue.status = "completed";
    } else if (guesses[index] === "partial") {
      baseClue.status = "partial";
    }

    // 4. Gestión específica del blur de la portada
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
    if (artistMatch && titleMatch) {
      result = "correct";
      setGameState("won");
    } else if (artistMatch && !titleMatch) {
      result = "partial";
    } else {
      result = "wrong";
    }

    setGuesses([...guesses, result]);
    setGuessDetails([
      ...guessDetails,
      {
        artist: userArtist,
        song: userTitle,
        artistCorrect: artistMatch,
        songCorrect: titleMatch,
      },
    ]);

    if (guesses.length + 1 >= 6 && result !== "correct") {
      setGameState("lost");
    }
  };

  const skipTurn = () => {
    if (gameState !== "playing") return;

    setGuesses([...guesses, "wrong"]);
    setGuessDetails([
      ...guessDetails,
      {
        artist: "Skipped",
        song: "",
        artistCorrect: false,
        songCorrect: false,
      },
    ]);

    if (guesses.length + 1 >= 6) {
      setGameState("lost");
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
  // 1. Si son exactamente iguales, victoria rápida
  if (userArtist.toLowerCase().trim() === targetArtist.toLowerCase().trim())
    return true;

  // 2. Función para normalizar y trocear a los artistas
  const normalizeAndSplit = (str: string) => {
    return (
      str
        .toLowerCase()
        // Reemplazamos todos los separadores comunes por una simple coma
        .replace(/ feat\.? | ft\.? | & | y | x | \+ /gi, ",")
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0)
    );
  };

  const userParts = normalizeAndSplit(userArtist);
  const targetParts = normalizeAndSplit(targetArtist);

  // 3. Comprobamos si AL MENOS uno de los artistas del usuario está en la canción objetivo
  return userParts.some((userPart) => targetParts.includes(userPart));
};