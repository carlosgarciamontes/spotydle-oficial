import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface LevelCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string;
  imageUrl?: string;
  isLocked?: boolean;
}

const LevelCard = React.forwardRef<HTMLButtonElement, LevelCardProps>(
  ({ title, imageUrl, isLocked, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLocked}
        className={cn(
          "relative w-full aspect-square flex flex-col justify-end p-5 rounded-[2rem]",
          "transition-transform duration-300 active:scale-95 group overflow-hidden",
          "bg-black border border-spotydle",

          isLocked && "cursor-not-allowed opacity-80 grayscale",
          className,
        )}
        {...props}
      >
        <div className="absolute inset-0 z-0">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={title || "Imagen del nivel"}
              fill
              className={cn(
                "object-cover opacity-80 transition-transform duration-500",
                !isLocked && "group-hover:scale-110",
              )}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          {isLocked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-12 h-12 text-white/50"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <h3
          className={cn(
            "relative z-20 text-left font-bold text-2xl leading-tight whitespace-pre-line drop-shadow-lg",
            isLocked ? "text-gray-400" : "text-white",
          )}
        >
          {title}
        </h3>
      </button>
    );
  },
);

LevelCard.displayName = "LevelCard";

export default LevelCard;
