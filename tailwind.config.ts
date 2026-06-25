import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GTS neon Miami palette (original branding).
        gts: {
          bg: "#0a0612",
          panel: "#140a24",
          pink: "#ff2d95",
          magenta: "#d916ff",
          purple: "#7b2ff7",
          cyan: "#22e3ff",
          teal: "#1be7b6",
          gold: "#ffd23f",
          sun: "#ff7a00",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 20px rgba(255,45,149,0.55), 0 0 40px rgba(217,22,255,0.35)",
        cyan: "0 0 20px rgba(34,227,255,0.45)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 -200px" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        scan: "scan 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
