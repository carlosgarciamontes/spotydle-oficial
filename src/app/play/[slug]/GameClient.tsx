"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import WinModal from "@/components/game/WinModal";
import GuessGrid from "@/components/game/GuessGrid";
import AudioPlayer from "@/components/game/Audioplayer";
import Clues from "@/components/game/Clues";
import GameInput, { SongSuggestion } from "@/components/game/GameInput";
import { useGame } from "@/context/GameContext";
import { useDebounce } from "@/hooks/useDebounce";

interface GameClientProps {
  mode: {
    title: string;
    slug: string;
  };
}

export default function GameClient({ mode }: GameClientProps) {
  const {
    guesses,
    clues,
    submitGuess,
    skipTurn,
    gameState,
    targetSong,
    checkAlreadyGuessed,
    initMode,
  } = useGame();

  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<SongSuggestion[]>([]);
  const [selectedSong, setSelectedSong] = useState<SongSuggestion | null>(null);
  const debouncedSearchValue = useDebounce(searchValue, 500);

  useEffect(() => {
    initMode(mode.slug);
  }, [mode.slug, initMode]);

  useEffect(() => {
    async function performSearch() {
      if (debouncedSearchValue.length > 2) {
        try {
          const response = await fetch(
            `/api/search?q=${encodeURIComponent(debouncedSearchValue)}`
          );

          if (!response.ok) {
            throw new Error("Error en la búsqueda");
          }

          const results = await response.json();
          setSuggestions(results);
        } catch (error) {
          console.error("Error buscando canciones:", error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    }

    performSearch();
  }, [debouncedSearchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSelectedSong(null);
  };

  const handleGuessSubmit = () => {
    if (
      !selectedSong ||
      checkAlreadyGuessed(selectedSong.artist, selectedSong.title)
    )
      return;
    submitGuess(selectedSong.artist, selectedSong.title);
    setSearchValue("");
    setSelectedSong(null);
  };

  const isAlreadyGuessed = selectedSong
    ? checkAlreadyGuessed(selectedSong.artist, selectedSong.title)
    : false;

  return (
    // 1. Contenedor a altura completa sin padding bottom exagerado
    <div className="h-[calc(100vh-80px)] md:h-screen w-full bg-black text-white flex flex-col items-center justify-between py-6 px-4 overflow-hidden">
      
      {targetSong && (
        <WinModal
          isOpen={gameState === "won" || gameState === "lost"}
          hasWon={gameState === "won"}
          songData={targetSong}
          guesses={guesses}
          onBackToMenu={() => (window.location.href = "/play")}
        />
      )}

      {/* 2. Header centrado inspirado en tu imagen */}
      <div className="w-full max-w-md relative flex justify-center items-center mt-2 md:mt-8">
        <Link
          href="/play"
          className="absolute left-0 text-gray-500 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
          {mode.title}
        </h1>
      </div>

      {/* 3. Área central principal (Grid, Player, Clues) que se expande para empujar los botones abajo */}
      <div className="flex-1 w-full max-w-md flex flex-col justify-center gap-6 my-4">
        <div className="flex justify-center w-full">
           <GuessGrid guesses={guesses} />
        </div>
        
        <AudioPlayer />
        
        {/* En tu imagen original no hay línea divisoria, pero si la quieres muy sutil: */}
        {/* <div className="w-full h-px bg-white/5 my-1"></div> */}
        
        <div className="w-full">
            <Clues clues={clues} />
        </div>
      </div>

      {/* 4. Barra inferior de controles (fijada al fondo por el flex-1 de arriba) */}
      <div className="w-full max-w-md flex items-center gap-3 h-14 mb-2 md:mb-8">
        <Button
          onClick={skipTurn}
          intent="outline"
          size="default"
        >
          SKIP
        </Button>

        <div className="flex-1 h-full">
            <GameInput
            value={searchValue}
            onChange={handleSearchChange}
            suggestions={suggestions}
            onSelect={(song) => {
                setSearchValue(`${song.artist} - ${song.title}`);
                setSelectedSong(song);
                setSuggestions([]);
            }}
            />
        </div>

        <Button
          onClick={handleGuessSubmit}
          disabled={!selectedSong || isAlreadyGuessed}
          intent="primary"
          className={`${
            !selectedSong
              ? "opacity-30 cursor-not-allowed bg-gray-800 text-gray-500"
              : isAlreadyGuessed
              ? "opacity-60 cursor-not-allowed bg-yellow-600 text-white"
              : "text-black opacity-100"
          }`}
        >
          {isAlreadyGuessed ? "REPEATED" : "GUESS"}
        </Button>
      </div>

    </div>
  );
}