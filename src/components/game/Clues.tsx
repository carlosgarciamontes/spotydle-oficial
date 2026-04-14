import React from "react";
import { Lock, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClueStatus = "locked" | "active" | "completed" | "failed";

interface BaseClue {
  id: number;
  label: string;
  status: ClueStatus;
  userGuess?: {
    artist: string;
    song: string;
  };
}

export interface AudioClue extends BaseClue {
  type: "audio";
  duration: number;
}

export interface InfoClue extends BaseClue {
  type: "info";
  infoData: {
    label: string;
    value: string | number;
  }[];
}

export interface VisualClue extends BaseClue {
  type: "visual";
  imageUrl: string;
  blurLevel?: number;
}

export type Clue = AudioClue | InfoClue | VisualClue;

interface CluesProps {
  clues: Clue[];
  onClueClick?: (clue: Clue) => void;
  className?: string;
}

const Clues: React.FC<CluesProps> = ({ clues, onClueClick, className }) => {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {clues.map((clue) => (
        <button
          key={clue.id}
          onClick={() => onClueClick?.(clue)}
          disabled={clue.status === "locked"}
          className={cn(
            "w-full min-h-[48px] px-3 md:px-4 py-2 rounded-xl bg-[#353535] flex items-center justify-between transition-all duration-300 border text-white text-left relative overflow-hidden group",
            clue.status === "locked" && "border-transparent opacity-80 cursor-not-allowed",
            clue.status === "active" && [
              "border-spotydle/50 text-white shadow-[0_0_15px_rgba(233,64,150,0.25)]",
            ],
            clue.status === "failed" && ["border-red-500/50", "shadow-[0_0_15px_rgba(239,68,68,0.25)]"],
            clue.status === "completed" && "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)] text-white",
          )}
        >
          <div className={cn(
            "flex items-center gap-3 overflow-hidden min-w-0 flex-1",
            clue.status !== "locked" && "justify-center"
          )}>
            <div className="flex items-center gap-2 shrink-0">
              {clue.status === "locked" && (
                <span className="font-bold text-sm md:text-base whitespace-nowrap">
                  {clue.label}
                </span>
              )}
            </div>

            {clue.status !== "locked" && clue.type === "info" && (
              <div className="flex flex-wrap justify-center gap-1.5 overflow-hidden">
                {clue.infoData.map((info, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] md:text-xs font-medium bg-black/40 px-2 py-0.5 rounded border border-white/5 whitespace-nowrap"
                  >
                    <span className="text-gray-400 mr-1">{info.label}:</span>
                    <span className="text-gray-100">{info.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {clue.status === "failed" && clue.userGuess && (
              <div className="flex items-center gap-2 text-[10px] md:text-xs max-w-[100px] md:max-w-[200px]">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                  <span className="text-gray-300 truncate font-bold">
                    {clue.userGuess.artist}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0"></span>
                  <span className="text-gray-500 truncate italic">
                    {clue.userGuess.song}
                  </span>
                </div>
              </div>
            )}

            {clue.status === "locked" && <Lock size={16} className="text-[#666666]" />}

            {clue.status === "active" && clue.type === "audio" && (
              <div className="flex items-end gap-[2px] h-3">
                <span className="w-0.5 bg-spotydle h-3 animate-pulse rounded-full"></span>
                <span className="w-0.5 bg-spotydle h-2 animate-pulse delay-75 rounded-full"></span>
                <span className="w-0.5 bg-spotydle h-1 animate-pulse delay-150 rounded-full"></span>
              </div>
            )}

            {(clue.status === "active" || clue.status === "completed") && clue.type === "visual" && (
              <div className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 px-2 py-1 rounded-lg border border-white/10">
                <Eye size={14} className="text-gray-300" />
                <span className="text-[10px] md:text-xs font-bold text-gray-200 uppercase tracking-tighter">
                  View
                </span>
              </div>
            )}
          </div>

          {clue.status === "active" && (
            <div className="absolute inset-0 bg-spotydle/5 pointer-events-none group-hover:opacity-100 transition-opacity"></div>
          )}
        </button>
      ))}
    </div>
  );
};

export default Clues;