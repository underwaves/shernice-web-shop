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
        shernice: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        theme: {
          primary: "var(--theme-primary, #fb7185)",
          secondary: "var(--theme-secondary, #fda4af)",
          accent: "var(--theme-accent, #c084fc)",
          bg: "var(--theme-bg, #fff5f7)",
          card: "var(--theme-card, #ffffff)",
          text: "var(--theme-text, #4a2835)",
        },
      },
      fontFamily: {
        thai: ["Prompt", "Sarabun", "Kanit", "system-ui", "sans-serif"],
      },
      animation: {
        "float": "float 4s ease-in-out infinite",
        "float-delayed": "float 5s ease-in-out 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
