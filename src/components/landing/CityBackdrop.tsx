"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

// A fully original animated Miami-style skyline rendered with SVG + framer-motion.
// Includes moving cars, a patrolling helicopter, twinkling city lights and a
// neon sunset gradient — no external assets.
export function CityBackdrop() {
  const buildings = useMemo(() => {
    const arr: { x: number; w: number; h: number; hue: number }[] = [];
    let x = 0;
    let seed = 1337;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    while (x < 1440) {
      const w = 40 + rng() * 70;
      const h = 90 + rng() * 260;
      arr.push({ x, w, h, hue: 250 + rng() * 80 });
      x += w + 6;
    }
    return arr;
  }, []);

  const windows = useMemo(() => {
    const arr: { x: number; y: number; on: boolean; delay: number }[] = [];
    let seed = 99;
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };
    for (const b of buildings) {
      const cols = Math.floor(b.w / 14);
      const rows = Math.floor(b.h / 18);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          if (rng() > 0.55) {
            arr.push({
              x: b.x + 8 + c * 14,
              y: 600 - b.h + 10 + r * 18,
              on: rng() > 0.4,
              delay: rng() * 6,
            });
          }
        }
      }
    }
    return arr;
  }, [buildings]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Sky gradient (neon Miami sunset) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #2a0a3d 0%, #5b1066 28%, #b3206e 55%, #ff5e3a 78%, #ffb35c 100%)",
        }}
      />

      {/* Sun */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{ top: "42%" }}
        animate={{ filter: ["brightness(1)", "brightness(1.15)", "brightness(1)"] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <div
          className="h-56 w-56 rounded-full"
          style={{
            background: "radial-gradient(circle, #fff2b0 0%, #ff7a00 55%, rgba(255,122,0,0) 72%)",
          }}
        />
      </motion.div>

      {/* Reflection grid water */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 cyber-grid opacity-40"
        style={{ transform: "perspective(300px) rotateX(60deg)", transformOrigin: "bottom" }}
      />

      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-0 h-full w-full"
      >
        {/* Skyline */}
        {buildings.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={600 - b.h}
            width={b.w}
            height={b.h}
            fill={`hsl(${b.hue}, 60%, ${8 + (i % 5) * 2}%)`}
            stroke="rgba(34,227,255,0.18)"
            strokeWidth="1"
          />
        ))}

        {/* Lit windows */}
        {windows.map((w, i) => (
          <motion.rect
            key={i}
            x={w.x}
            y={w.y}
            width={5}
            height={7}
            rx={1}
            fill={w.on ? "#ffd27a" : "#22e3ff"}
            initial={{ opacity: w.on ? 0.9 : 0.2 }}
            animate={{ opacity: [0.2, 0.95, 0.2] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: w.delay }}
          />
        ))}

        {/* Palm trees in the foreground */}
        {[60, 240, 1180, 1360].map((px, i) => (
          <Palm key={i} x={px} />
        ))}

        {/* Road */}
        <rect x="0" y="600" width="1440" height="40" fill="#0a0612" />
        <rect x="0" y="618" width="1440" height="3" fill="rgba(255,210,63,0.5)" />
      </svg>

      {/* Moving cars (neon streaks) */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ bottom: 14 + (i % 2) * 8, left: -120 }}
          initial={{ x: -120 }}
          animate={{ x: 1600 }}
          transition={{ duration: 6 + i * 2, repeat: Infinity, delay: i * 1.6, ease: "linear" }}
        >
          <div
            className="h-3 w-16 rounded-full"
            style={{
              background: ["#ff2d95", "#22e3ff", "#ffd23f", "#1be7b6"][i],
              boxShadow: `0 0 18px ${["#ff2d95", "#22e3ff", "#ffd23f", "#1be7b6"][i]}`,
            }}
          />
        </motion.div>
      ))}

      {/* Helicopter */}
      <motion.div
        className="absolute text-3xl"
        style={{ top: "16%" }}
        initial={{ x: -100 }}
        animate={{ x: ["-5%", "105%"], y: ["0%", "-3%", "0%"] }}
        transition={{ x: { duration: 18, repeat: Infinity, ease: "linear" }, y: { duration: 3, repeat: Infinity } }}
      >
        <motion.span
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="inline-block"
        >
          🚁
        </motion.span>
      </motion.div>

      {/* Vignette + scanlines */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(5,2,12,0.85) 100%)" }}
      />
    </div>
  );
}

function Palm({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},600)`}>
      <rect x="-4" y="-90" width="8" height="90" fill="#1a0f2a" />
      {[-1, -0.5, 0, 0.5, 1].map((d, i) => (
        <path
          key={i}
          d={`M0,-90 q ${d * 60},-20 ${d * 95},10`}
          stroke="#1be7b6"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}
    </g>
  );
}
