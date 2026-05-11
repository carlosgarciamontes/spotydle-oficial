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
import { searchSongsGlobal } from "@/services/itunesService";
import { PLAYLISTS } from "@/constants/playlists"; // Asegúrate de tener este archivo creado

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

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  distribution: number[]; 
  lastCompletedDate: string | null;
}

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
  initMode: (slug: string) => Promise<void>; // <-- Nueva función expuesta
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STATS_STORAGE_KEY = "spotydle_stats";

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: [0, 0, 0, 0, 0, 0],
  lastCompletedDate: null,
};

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [targetSong, setTargetSong] = useState<TargetSong | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [guessDetails, setGuessDetails] = useState<GuessDetail[]>([]);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [stats, setStats] = useState<GameStats>(DEFAULT_STATS);
  
  // Guardamos el slug actual para saber bajo qué nombre guardar en LocalStorage
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  const currentAttempt = guesses.length + 1;

  // ==========================================
  // INICIALIZACIÓN DEL MODO (Llamado desde GameClient)
  // ==========================================
  const initMode = async (slug: string) => {
    setCurrentSlug(slug);
    const storageKey = `spotydle_save_${slug}`;
    const savedData = localStorage.getItem(storageKey);
    let loadedFromSave = false;

    // 1. Intentamos cargar la partida guardada
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Validamos que sea de hoy y que tenga la canción guardada (para no cambiarla si el usuario recarga la página)
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
        console.error("Error leyendo el LocalStorage", error);
      }
    }

    // 2. Si no hay partida guardada de hoy, generamos una nueva
    if (!loadedFromSave) {
      setGuesses([]);
      setGuessDetails([]);
      setGameState("playing");

      if (slug === "daily") {
        // Lógica exclusiva del reto diario
        const song = await getDailyTrack(); 
        if (song) setTargetSong(song as TargetSong);
      } else {
        // Lógica para los demás modos: Elegimos un artista aleatorio de la playlist
        const artists = PLAYLISTS[slug as keyof typeof PLAYLISTS];
        if (artists && artists.length > 0) {
          const randomQuery = artists[Math.floor(Math.random() * artists.length)];
          const results = await searchSongsGlobal(randomQuery);
          
          if (results.length > 0) {
            // Cogemos una canción aleatoria de los resultados
            const randomSong = results[Math.floor(Math.random() * results.length)];
            setTargetSong({
              artist: randomSong.artist,
              title: randomSong.title,
              coverUrl: randomSong.coverUrl,
              previewUrl: randomSong.previewUrl,
              releaseYear: 2024, // iTunes API simple a veces no devuelve año, puedes mockearlo o extraerlo
              genre: "Pop",      // Igual que el año
              isExplicit: false
            });
          }
        }
      }
    }
  };

  // ==========================================
  // CARGA DE ESTADÍSTICAS GLOBALES
  // ==========================================
  useEffect(() => {
    // Usar un micro-retraso (timeout de 0ms) saca la ejecución de la fase síncrona.
    // Esto elimina el warning del linter y optimiza el renderizado inicial de React.
    const timer = setTimeout(() => {
      const savedStats = localStorage.getItem(STATS_STORAGE_KEY);
      if (savedStats) {
        try {
          setStats(JSON.parse(savedStats));
        } catch (error) {
          console.error("Error leyendo estadísticas", error);
        }
      }
    }, 0);

    return () => clearTimeout(timer); // Limpieza por seguridad
  }, []);

  // ==========================================
  // AUTOGUARDADO DINÁMICO
  // ==========================================
  useEffect(() => {
    if (targetSong && currentSlug) {
      const storageKey = `spotydle_save_${currentSlug}`;
      const saveData = {
        date: getTodayDateString(),
        targetSong, // Guardamos la canción para que la aleatoriedad no moleste al recargar
        guesses,
        guessDetails,
        gameState,
      };
      localStorage.setItem(storageKey, JSON.stringify(saveData));
    }
  }, [guesses, guessDetails, gameState, targetSong, currentSlug]);

  // ==========================================
  // MOTOR DE ESTADÍSTICAS
  // ==========================================
  const handleGameEnd = (finalState: "won" | "lost", totalAttempts: number) => {
    const today = getTodayDateString();

    setStats((prevStats) => {
      // Evitamos registrar la victoria dos veces si recarga la página
      if (prevStats.lastCompletedDate === today && currentSlug === "daily") return prevStats;

      const newStats = { ...prevStats };
      newStats.gamesPlayed += 1;
      
      // Consideraremos el modo daily como el único que afecta a las rachas oficiales
      if (currentSlug === "daily") {
        newStats.lastCompletedDate = today;
      }

      if (finalState === "won") {
        newStats.gamesWon += 1;
        if (currentSlug === "daily") {
          newStats.currentStreak += 1;
          if (newStats.currentStreak > newStats.maxStreak) {
            newStats.maxStreak = newStats.currentStreak;
          }
        }
        
        const winIndex = Math.max(0, totalAttempts - 1);
        newStats.distribution[winIndex] += 1;
      } 
      
      if (finalState === "lost" && currentSlug === "daily") {
        newStats.currentStreak = 0; 
      }

      localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  };

  // --- LÓGICA DE NEGOCIO ---
  const checkAlreadyGuessed = (artist: string, title: string) => {
    return guessDetails.some(
      (guess) =>
        guess.artist.toLowerCase() === artist.toLowerCase() &&
        guess.song.toLowerCase() === title.toLowerCase(),
    );
  };

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
        initMode,
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