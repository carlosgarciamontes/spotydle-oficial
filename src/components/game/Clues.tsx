import React from "react";
import { Lock, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type ClueStatus = "locked" | "active" | "completed" | "failed";

// 1. ACTUALIZAMOS EL CONTRATO
interface BaseClue {
  id: number;
  label: string;
  status: ClueStatus;
  userGuess?: {
    artist: string;
    artistCorrect: boolean; // NUEVO: ¿Acertó el artista?
    song: string;
    songCorrect: boolean;   // NUEVO: ¿Acertó la canción?
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
          {/* --- ZONA IZQUIERDA Y CENTRAL --- */}
          <div className={cn(
            "flex items-center gap-3 overflow-hidden min-w-0 flex-1",
            ((clue.type === "info" && clue.status !== "locked") || clue.status === "completed") && "justify-center"
          )}>
            
            {/* ESTADO COMPLETADO (VICTORIA) */}
            {clue.status === "completed" && clue.userGuess ? (
              <div className="flex items-center justify-center gap-2 w-full min-w-0">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] shrink-0"></span>
                <span className="text-gray-100 font-bold truncate text-sm md:text-base">
                  {clue.userGuess.artist}
                </span>
                <span className="text-gray-400 font-medium truncate text-sm md:text-base">
                  — {clue.userGuess.song}
                </span>
              </div>
            ) : (
              /* ESTADOS NORMALES */
              <>
                <div className="flex items-center gap-2 shrink-0">
                  {!(clue.type === "info" && clue.status !== "locked") && (
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
              </>
            )}
          </div>

          {/* --- ZONA DERECHA --- */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            
            {/* INTENTOS FALLIDOS (Con lógica de colores) */}
            {clue.status === "failed" && clue.userGuess && (
              <div className="flex flex-col md:flex-row items-end md:items-center gap-0.5 md:gap-2 text-[10px] md:text-xs max-w-[120px] md:max-w-[220px]">
                
                {/* Artista: Verde si es correcto, Rojo si es incorrecto */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    clue.userGuess.artistCorrect ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  )}></span>
                  <span className={cn(
                    "truncate font-bold",
                    clue.userGuess.artistCorrect ? "text-gray-200" : "text-gray-400"
                  )}>
                    {clue.userGuess.artist}
                  </span>
                </div>

                {/* Canción: Verde si es correcto, Rojo si es incorrecto */}
                <div className="flex items-center gap-1 min-w-0">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    clue.userGuess.songCorrect ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                  )}></span>
                  <span className={cn(
                    "truncate italic",
                    clue.userGuess.songCorrect ? "text-gray-300 font-semibold" : "text-gray-500"
                  )}>
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