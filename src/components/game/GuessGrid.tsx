import React from "react";
import { cn } from "@/lib/utils";


export type GuessResult = "correct" | "partial" | "wrong" | "empty";

interface GuessGridProps {

  guesses: GuessResult[];
  maxAttempts?: number;
  className?: string;
}

const GuessGrid: React.FC<GuessGridProps> = ({
  guesses,
  maxAttempts = 6,
  className,
}) => {

  const grid = Array.from({ length: maxAttempts }).map((_, i) => {
    return guesses[i] || "empty";
  });

  return (
    <div className={cn("flex gap-1.5 w-full max-w-[280px]", className)}>
      {grid.map((status, index) => (
        <div
          key={index}
          className={cn(
            "h-2.5 flex-1 rounded-sm transition-all duration-300",
            status === "empty" && "bg-sp-darkest",
            status === "correct" && "bg-guess-correct shadow-[0_0_10px_#4FE24F99]",
            status === "partial" && "bg-guess-partial shadow-[0_0_10px_#E2D64F99]",
            status === "wrong" && "bg-guess-wrong shadow-[0_0_10px_#CF000099]"
          )}
        />
      ))}
    </div>
  );
};

export default GuessGrid;