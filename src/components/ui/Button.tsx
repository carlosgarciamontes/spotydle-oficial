import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      intent: {
        primary: "bg-spotydle text-white shadow-[0_0_15px_rgba(233,64,150,0.4)] hover:shadow-[0_0_20px_rgba(233,64,150,0.6)]",
        outline: "bg-transparent border border-spotydle text-primary shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-spotydle hover:bg-black/80 hover:text-white",
        secondary: "bg-[#525252] text-white hover:bg-[#666666]",
        ghost: "bg-transparent text-spotydle",
      },
      size: {
        default: "h-10 px-6 text-sm rounded-full",
        sm: "h-8 px-4 text-xs rounded-[10px]",
        lgRounded: "py-4 px-8 text-lg rounded-full w-full",
        lgSquare: "py-4 px-8 text-lg rounded-2xl w-full",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ intent, size, className }))}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };