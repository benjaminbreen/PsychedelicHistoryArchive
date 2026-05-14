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
          ink: "rgb(var(--archive-ink) / <alpha-value>)",
          muted: "rgb(var(--archive-muted) / <alpha-value>)",
          faint: "rgb(var(--archive-faint) / <alpha-value>)",
          paper: "rgb(var(--archive-paper) / <alpha-value>)",
          surface: "rgb(var(--archive-surface) / <alpha-value>)",
          line: "rgb(var(--archive-line) / <alpha-value>)",
          lavender: "rgb(var(--archive-lavender) / <alpha-value>)",
          lavender2: "rgb(var(--archive-lavender2) / <alpha-value>)",
          violet: "rgb(var(--archive-violet) / <alpha-value>)",
          violetDark: "rgb(var(--archive-violet-dark) / <alpha-value>)",
          olive: "rgb(var(--archive-olive) / <alpha-value>)",
          sand: "rgb(var(--archive-sand) / <alpha-value>)",
          success: "rgb(var(--archive-success) / <alpha-value>)",
          warning: "rgb(var(--archive-warning) / <alpha-value>)",
          draft: "rgb(var(--archive-draft) / <alpha-value>)"
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
