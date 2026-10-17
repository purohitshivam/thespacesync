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
        ivory: "#FAF7F1",
        sand: {
          DEFAULT: "#EEE5D8",
          dark: "#E2D5C3",
        },
        sage: {
          DEFAULT: "#879783",
          light: "#A3B19F",
          dark: "#6B7B67",
        },
        forest: {
          DEFAULT: "#30483A",
          light: "#3F5E4C",
          dark: "#22342A",
        },
        terracotta: {
          DEFAULT: "#C77D61",
          light: "#D6947B",
          dark: "#AD654A",
        },
        charcoal: "#302F2B",
        muted: "#77756D",
        border: "#E7E0D5",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        warm: "0 4px 20px -2px rgba(48, 47, 43, 0.06), 0 2px 8px -2px rgba(48, 47, 43, 0.04)",
        "warm-lg": "0 12px 32px -4px rgba(48, 47, 43, 0.09), 0 4px 12px -2px rgba(48, 47, 43, 0.05)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
