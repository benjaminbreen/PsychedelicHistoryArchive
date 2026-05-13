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
        archive: {
          ink: "#171417",
          muted: "#6E6872",
          faint: "#9B94A3",
          paper: "#FCFAF7",
          surface: "#FFFFFF",
          line: "#E7E1EA",
          lavender: "#EFE6FF",
          lavender2: "#F7F1FF",
          violet: "#7B4BD8",
          violetDark: "#5D31B5",
          olive: "#8B8F55",
          sand: "#F3EBDD",
          success: "#DDF4E4",
          warning: "#FFF0C2",
          draft: "#FFE3C7"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 20, 23, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
