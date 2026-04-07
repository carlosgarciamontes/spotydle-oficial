import React from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const userCardVariants = cva(
  "w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 bg-[#2A2A2A] border",
  {
    variants: {
      variant: {
        default: "border-transparent",
        highlighted: "border-spotydle shadow-[0_0_20px] shadow-spotydle/30",
        request: "border-spotydle shadow-[0_0_20px] shadow-spotydle/30",
        suggestion: "border-spotydle shadow-[0_0_20px] shadow-spotydle/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const avatarVariants = cva(
  "relative w-14 h-14 rounded-full shrink-0 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "grayscale opacity-80",
        highlighted: "ring-2 ring-spotydle shadow-[0_0_15px] shadow-spotydle/50",
        request: "ring-2 ring-spotydle shadow-[0_0_15px] shadow-spotydle/50",
        suggestion: "ring-2 ring-spotydle shadow-[0_0_15px] shadow-spotydle/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface UserCardProps extends VariantProps<typeof userCardVariants> {
  id: string;
  name: string;
  avatarUrl?: string; // Opcional por seguridad
  streak?: number;
  actionText?: string;
  onActionClick?: (id: string) => void;
  onRejectClick?: (id: string) => void;
  onCardClick?: (id: string) => void;
  className?: string;
}

const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(
  ({ id, name, avatarUrl, streak, variant = "default", actionText, onActionClick, onRejectClick, onCardClick, className }, ref) => {
    
    const defaultActionText = variant === "request" || variant === "suggestion" ? "Add" : "Chat";
    const finalActionText = actionText || defaultActionText;
    const isPending = finalActionText === "Pending";

    return (
      <div 
        ref={ref}
        onClick={() => onCardClick?.(id)}
        className={cn(
          userCardVariants({ variant }), 
          onCardClick && "cursor-pointer hover:bg-[#333333]", 
          className
        )}
      >
        {/* --- PARTE IZQUIERDA --- */}
        <div className="flex items-center gap-4">
          
          {variant === "request" && (
            <Button 
              intent="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation(); 
                onRejectClick?.(id);
              }}
              className="text-spotydle hover:text-white hover:bg-transparent"
            >
              <X size={20} strokeWidth={3} />
            </Button>
          )}

          <div className={avatarVariants({ variant })}>
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt={name} 
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-[#353535] rounded-full flex items-center justify-center text-gray-400 font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-white font-bold text-lg">{name}</span>
            {streak !== undefined && (
              <span className="text-gray-400 font-medium text-sm mt-0.5">
                🔥 Daily Streak: {streak}
              </span>
            )}
          </div>
        </div>

        {/* --- PARTE DERECHA --- */}
        <Button 
          intent={isPending ? "secondary" : "spotydle"}
          size="sm"
          disabled={isPending}
          className="rounded-full px-6"
          onClick={(e) => {
            e.stopPropagation(); 
            if (!isPending) onActionClick?.(id);
          }}
        >
          {finalActionText}
        </Button>
        
      </div>
    );
  }
);

UserCard.displayName = "UserCard";

export default UserCard;