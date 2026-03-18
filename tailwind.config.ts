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
    },
  },
  plugins: [],
};

export default config;