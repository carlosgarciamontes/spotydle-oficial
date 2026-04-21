import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        spotydle: "#E24F9C", 
        sp: {
          lightest: "#D9D9D9",
          light: "#B5B5B5",
          base: "#777777",
          dark: "#525252",
          darkest: "#353535",
        },
        guess: {
          correct: "#4FE24F",   
          partial: "#E2D64F",   
          wrong: "#CF0000",     
        }
      },
      keyframes: {
        sound: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        }
      },
      animation: {
        sound: 'sound 1.2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};

export default config;