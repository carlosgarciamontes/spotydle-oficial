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

const GameSkeleton = () => {
  const leftBars = [1, 3, 5, 2, 1, 2, 4, 3, 1];
  const rightBars = [1, 3, 4, 2, 1, 2, 5, 3, 1];

  const cluesSkeleton = [
    { width: "w-24", isUnlocked: true },  
    { width: "w-32", isUnlocked: false }, 
    { width: "w-24", isUnlocked: false }, 
    { width: "w-28", isUnlocked: false }, 
    { width: "w-20", isUnlocked: false }, 
    { width: "w-24", isUnlocked: false }, 
  ];

  return (
    <div className="flex-1 w-full max-w-md flex flex-col justify-center gap-6 my-4 animate-pulse">
      <div className="flex justify-center w-full">
        <div className="flex gap-1.5 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i} 
              className="h-2.5 flex-1 rounded-sm bg-[#2A2A2A]"
            ></div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center w-full my-8 gap-8">
        <div className="flex items-center justify-center w-full gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
            {leftBars.map((multiplier, i) => (
              <div 
                key={`l-${i}`} 
                className="w-1.5 md:w-2 rounded-full bg-[#2A2A2A]"
                style={{ height: `${multiplier * 10 * 0.4}px` }}
              />
            ))}
          </div>
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#2A2A2A] shrink-0"></div>
          <div className="flex items-center gap-1.5 md:gap-2 h-[50px]">
            {rightBars.map((multiplier, i) => (
              <div 
                key={`r-${i}`} 
                className="w-1.5 md:w-2 rounded-full bg-[#2A2A2A]"
                style={{ height: `${multiplier * 10 * 0.4}px` }}
              />
            ))}
          </div>
        </div>
        <div className="w-full flex flex-col gap-2 relative max-w-sm px-4">
          <div className="flex justify-end items-center px-1">
            <div className="h-3 w-16 bg-[#2A2A2A] rounded-sm"></div>
          </div>
          <div className="w-full h-2 bg-[#2A2A2A] rounded-full"></div>
        </div>
      </div>

      <div className="flex justify-center w-full">
        <div className="flex flex-col gap-3 w-full">
          {cluesSkeleton.map((clue, index) => (
            <div 
              key={index} 
              className={`h-[52px] w-full rounded-2xl flex items-center justify-between px-4 transition-colors ${
                clue.isUnlocked 
                  ? "bg-[#2A2A2A] border border-spotydle shadow-[0_0_10px_rgba(233,64,150,0.15)]" 
                  : "bg-[#2A2A2A]"
              }`}
            >
              <div className={`h-4 bg-white/10 rounded-md ${clue.width}`}></div>
              <div className="h-5 w-5 bg-white/10 rounded-md shrink-0"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      setIsInitializing(true);
      await initMode(mode.slug);
      setTimeout(() => setIsInitializing(false), 300);
    };
    
    initialize();
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
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchValue]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setSelectedSong(null);

    if (value.trim().length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
      setSuggestions([]);
    }
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

  const isLoadingGame = isInitializing || !targetSong;

  return (
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

      {isLoadingGame ? (
        <GameSkeleton />
      ) : (
        <div className="flex-1 w-full max-w-md flex flex-col justify-center gap-6 my-4">
          <div className="flex justify-center w-full">
            <GuessGrid guesses={guesses} />
          </div>
          
          <AudioPlayer />
          
          <div className="w-full">
            <Clues clues={clues} />
          </div>
        </div>
      )}

      <div className="w-full max-w-md flex items-center gap-3 h-14 mb-2 md:mb-8">
        <Button
          onClick={skipTurn}
          intent="outline"
          size="default"
          disabled={isLoadingGame}
        >
          SKIP
        </Button>

        <div className="flex-1 h-full">
          <GameInput
            value={searchValue}
            onChange={handleSearchChange}
            suggestions={suggestions}
            isSearching={isSearching}
            onSelect={(song) => {
              setSearchValue(`${song.artist} - ${song.title}`);
              setSelectedSong(song);
              setSuggestions([]);
            }}
          />
        </div>

        <Button
          onClick={handleGuessSubmit}
          disabled={!selectedSong || isAlreadyGuessed || isLoadingGame}
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