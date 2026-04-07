import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full transition-all focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 border border-transparent font-semibold",
  {
    variants: {
      variant: {
        default:
          "bg-[#525252] text-[#D9D9D9] placeholder:text-[#D9D9D9]/70 focus:ring-spotydle",
        dark: "bg-[#2A2A2A] text-white placeholder:text-gray-500 focus:ring-spotydle",
        light:
          "bg-white text-spotydle placeholder:text-spotydle/50 focus:ring-spotydle/30 shadow-lg",
      },

      shape: {
        default: "rounded-xl",
        pill: "rounded-full",
      },

      inputSize: {
        default: "h-10 px-5 text-sm md:h-12 md:text-base md:px-6",
        lg: "h-12 px-5 text-sm md:h-14 md:text-base md:px-6",
        xl: "py-4 px-8 text-base md:py-5 md:px-10 md:text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "default",
      inputSize: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, shape, inputSize, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, shape, inputSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input, inputVariants };
