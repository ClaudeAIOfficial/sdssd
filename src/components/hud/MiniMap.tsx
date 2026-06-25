'use client';

import { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const MAP_SIZE = 160;
const WORLD_SIZE = 300;
const SCALE = MAP_SIZE / WORLD_SIZE;

export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const player = useGameStore((s) => s.player);
  const missions = useGameStore((s) => s.missions);
  const activeMission = useGameStore((s) => s.activeMission);
  const vehicles = useGameStore((s) => s.vehicles);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0a1628';
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    const toMapX = (worldX: number) => (worldX + WORLD_SIZE / 2) * SCALE;
    const toMapZ = (worldZ: number) => (worldZ + WORLD_SIZE / 2) * SCALE;

    // Draw roads
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    const roads = [
      { start: [-150, 0], end: [150, 0] },
      { start: [0, -150], end: [0, 150] },
      { start: [-150, 40], end: [150, 40] },
      { start: [-150, -40], end: [150, -40] },
      { start: [40, -150], end: [40, 150] },
      { start: [-40, -150], end: [-40, 150] },
      { start: [80, -100], end: [80, 100] },
      { start: [-80, -100], end: [-80, 100] },
    ];
    roads.forEach(({ start, end }) => {
      ctx.beginPath();
      ctx.moveTo(toMapX(start[0]), toMapZ(start[1]));
      ctx.lineTo(toMapX(end[0]), toMapZ(end[1]));
      ctx.stroke();
    });

    // Draw buildings (simplified)
    ctx.fillStyle = '#1e3a5f';
    const buildings = [
      [15, 20, 10, 10], [-15, 20, 8, 8], [15, -20, 12, 10], [-15, -20, 10, 10],
      [55, 20, 8, 8], [-55, -20, 10, 10], [55, -20, 10, 8], [-55, 20, 8, 10],
    ];
    buildings.forEach(([x, z, w, d]) => {
      ctx.fillRect(toMapX(x - w / 2), toMapZ(z - d / 2), w * SCALE, d * SCALE);
    });

    // Beach
    ctx.fillStyle = '#f5d485';
    ctx.fillRect(toMapX(-30), toMapZ(130), 60 * SCALE, 20 * SCALE);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(toMapX(-30), toMapZ(138), 60 * SCALE, 15 * SCALE);

    // Park
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(toMapX(-105), toMapZ(-15), 30 * SCALE, 30 * SCALE);

    // Mission markers
    const displayMissions = activeMission ? [activeMission] : missions.slice(0, 3);
    displayMissions.forEach((m) => {
      const mx = toMapX(m.location.x);
      const mz = toMapZ(m.location.z);
      ctx.fillStyle = activeMission?.id === m.id ? '#f59e0b' : '#a855f7';
      ctx.beginPath();
      ctx.arc(mx, mz, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Player dot
    const px = toMapX(player.position[0]);
    const pz = toMapZ(player.position[2]);

    // Player direction arrow
    ctx.save();
    ctx.translate(px, pz);
    ctx.rotate(-player.rotation);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-4, 4);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Border
    ctx.strokeStyle = '#ffffff20';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, MAP_SIZE, MAP_SIZE);
  }, [player, missions, activeMission, vehicles]);

  return (
    <div className="mt-2">
      <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-2xl" style={{ width: MAP_SIZE, height: MAP_SIZE }}>
        <canvas ref={canvasRef} width={MAP_SIZE} height={MAP_SIZE} />
        {/* Compass */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-white/80 text-xs font-bold">N</div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/40 text-xs">S</div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-white/40 text-xs">W</div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 text-xs">E</div>
        {/* Vignette */}
        <div className="absolute inset-0 rounded-xl" style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none',
        }} />
      </div>
    </div>
  );
}
