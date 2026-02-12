import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // WYTH Official Color System [cite: 542]
        brand: {
          blue: "#1E3A8A",    // Primary Brand (Trust Blue)
          gold: "#D4AF37",    // Secondary (Warm Gold)
          bg: "#F8FAFC",      // Background (Soft Off-White)
          surface: "#FFFFFF", // Card Surface
          accent: "#6D28D9",  // Touchwood Purple
        },
        // Mapping to standard Tailwind utility names
        primary: {
          DEFAULT: "#1E3A8A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#D4AF37",
          foreground: "#FFFFFF",
        },
        background: "#F8FAFC",
        foreground: "#0F172A",
      },
      fontFamily: {
        // This connects to app/layout.tsx
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      animation: {
        "curtain-raise": "curtain 0.8s ease-in-out forwards",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "scale-tap": "scaleTap 0.1s ease-out forwards",
      },
      keyframes: {
        curtain: {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleTap: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(0.97)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;