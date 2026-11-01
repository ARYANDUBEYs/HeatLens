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
        canvas: "#F8FAFC", // Slate 50
        surface: {
          white: "#FFFFFF", // Pure White
          muted: "#F1F5F9", // Slate 100
        },
        border: "#E2E8F0", // Slate 200
        text: {
          primary: "#0F172A", // Slate 900
          secondary: "#475569", // Slate 600
        },
        azure: {
          primary: "#0284C7", // Sky 600
          soft: "#E0F2FE", // Sky 100
        },
        heat: {
          low: "#34D399", // Emerald Green
          moderate: "#FBBF24", // Amber
          high: "#FB923C", // Orange
          critical: "#F43F5E", // Crimson/Rose
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
