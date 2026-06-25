import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        night: "#090b1f",
        asphalt: "#14182f",
        neon: {
          pink: "#ff4fd8",
          cyan: "#2de2e6",
          lime: "#a3ff12",
          amber: "#ffb000"
        },
        solana: {
          green: "#14f195",
          purple: "#9945ff",
          blue: "#00c2ff"
        }
      },
      boxShadow: {
        neon: "0 0 28px rgba(45, 226, 230, 0.45)",
        panel: "0 18px 80px rgba(0, 0, 0, 0.42)"
      },
      fontFamily: {
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
