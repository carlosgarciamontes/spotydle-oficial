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
          const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearchValue)}`);
          
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
    if (!selectedSong || checkAlreadyGuessed(selectedSong.artist, selectedSong.title)) return;
    submitGuess(selectedSong.artist, selectedSong.title);
    setSearchValue("");
    setSelectedSong(null);
  };

  const isAlreadyGuessed = selectedSong 
    ? checkAlreadyGuessed(selectedSong.artist, selectedSong.title) 
    : false;

  return (
    <div className="min-h-screen p-6 md:p-10 bg-black text-white flex flex-col items-center pt-10 pb-40">
      {targetSong && (
        <WinModal
          isOpen={gameState === "won" || gameState === "lost"}
          hasWon={gameState === "won"}
          songData={targetSong}
          guesses={guesses}
          onBackToMenu={() => window.location.href = "/play"}
        />
      )}

      <div className="w-full max-w-md relative mb-10">
        <Link 
          href="/play" 
          className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 9.22a.75.75 0 000 1.06l3 3a.75.75 0 101.06-1.06l-1.72-1.72h5.69a.75.75 0 000-1.5h-5.69l1.72-1.72a.75.75 0 00-1.06-1.06l-3 3z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-spotydle text-center uppercase tracking-tighter">
          {mode.title}
        </h1>
      </div>

      <div className="w-full max-w-md">
        <div className="flex flex-col border border-sp-dark rounded-[2.5rem] bg-[#121212] overflow-hidden shadow-2xl relative">
          <div className="flex items-center justify-between p-6 pb-2">
            <span className="text-spotydle font-black tracking-widest text-lg">SPOTYDLE</span>
            <span className="text-gray-500 text-sm font-bold bg-black/50 px-3 py-1 rounded-full">
              {guesses.length}/6 Tries
            </span>
          </div>

          <div className="p-6 pt-2 flex flex-col gap-6">
            <GuessGrid guesses={guesses} />
            <AudioPlayer />
            <div className="w-full h-px bg-white/5 my-2"></div>
            <Clues clues={clues} />

            <div className="flex items-center gap-3 mt-4 h-12 w-full z-50">
              <Button onClick={skipTurn} intent="outline" className="h-full px-6 font-bold text-gray-400 border-gray-600">
                SKIP
              </Button>

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

              <Button
                onClick={handleGuessSubmit}
                disabled={!selectedSong || isAlreadyGuessed}
                intent="primary"
                className={`h-full px-6 font-bold tracking-widest transition-all ${
                  !selectedSong
                    ? "opacity-30 cursor-not-allowed bg-gray-700 text-gray-500"
                    : isAlreadyGuessed
                      ? "opacity-60 cursor-not-allowed bg-yellow-600 text-white"
                      : "text-black opacity-100"
                }`}
              >
                {isAlreadyGuessed ? "REPEATED" : "GUESS"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}