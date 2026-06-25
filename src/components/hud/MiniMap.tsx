"use client";

import { useEffect, useRef } from "react";
import { getWorld } from "@/game/world";
import { useGame } from "@/lib/store";
import { LANDMARKS } from "@/lib/cityData";
import { WORLD } from "@/lib/constants";

interface Props {
  size?: number;
  /** World units shown across the map radius. */
  range?: number;
  full?: boolean;
}

// Canvas-based live minimap. Reads the world simulation directly each frame so
// it stays smooth without triggering React re-renders.
export function MiniMap({ size = 190, range = 80, full = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      const world = getWorld();
      const p = world.player;
      const active = useGame.getState().active;
      const cx = size / 2;
      const cy = size / 2;
      const scale = size / (range * 2);
      const toScreen = (wx: number, wz: number) => {
        if (full) {
          // Whole-city fixed view.
          const s = size / (WORLD.half * 2.2);
          return [cx + wx * s, cy + wz * s] as const;
        }
        return [cx + (wx - p.x) * scale, cy + (wz - p.z) * scale] as const;
      };

      ctx.clearRect(0, 0, size, size);
      // Background
      ctx.fillStyle = "rgba(8,4,18,0.92)";
      ctx.fillRect(0, 0, size, size);

      // Road grid
      ctx.strokeStyle = "rgba(34,227,255,0.25)";
      ctx.lineWidth = 1.5;
      const step = WORLD.blockSize;
      const count = Math.floor(WORLD.half / step);
      for (let i = -count; i <= count; i++) {
        const v = i * step;
        const [, sy] = toScreen(0, v);
        const [sx] = toScreen(v, 0);
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(size, sy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, size);
        ctx.stroke();
      }

      // Landmarks
      for (const lm of LANDMARKS) {
        const [x, y] = toScreen(lm.pos.x, lm.pos.z);
        if (x < -10 || x > size + 10 || y < -10 || y > size + 10) continue;
        ctx.fillStyle = lm.color;
        ctx.beginPath();
        ctx.arc(x, y, full ? 4 : 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vehicles (drivable highlighted)
      for (const v of world.vehicles) {
        const [x, y] = toScreen(v.x, v.z);
        ctx.fillStyle = v.drivable ? "#ffd23f" : "rgba(180,180,200,0.6)";
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
      }

      // Police
      for (const pol of world.police) {
        const [x, y] = toScreen(pol.x, pol.z);
        ctx.fillStyle = "#ff2d3a";
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mission target
      if (active) {
        const t = active.phase === "to_origin" ? active.mission.origin : active.mission.target;
        const [x, y] = toScreen(t.x, t.z);
        const pulse = 4 + Math.sin(Date.now() / 200) * 2;
        ctx.strokeStyle = active.phase === "to_origin" ? "#ffd23f" : "#22e3ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player arrow
      const [px, py] = toScreen(p.x, p.z);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.heading);
      ctx.fillStyle = "#ff2d95";
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(4, 5);
      ctx.lineTo(-4, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [size, range, full]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="rounded-xl border border-white/15"
    />
  );
}
