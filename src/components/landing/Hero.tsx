'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import WalletButton from '../ui/WalletButton';
import { Play, Trophy, Zap } from 'lucide-react';

// Animated city background using canvas
function AnimatedCityBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // Buildings
    const buildings: { x: number; w: number; h: number; color: string; windows: { x: number; y: number; lit: boolean }[] }[] = [];
    for (let i = 0; i < 30; i++) {
      const w = 30 + Math.random() * 60;
      const h = 80 + Math.random() * 300;
      const x = (i / 30) * window.innerWidth + Math.random() * 50 - 25;
      const colors = ['#0f172a', '#1e293b', '#1e3a5f', '#0f172a', '#1a0533'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const windows: { x: number; y: number; lit: boolean }[] = [];
      for (let wx = 5; wx < w - 5; wx += 12) {
        for (let wy = 10; wy < h - 10; wy += 16) {
          windows.push({ x: wx, y: wy, lit: Math.random() > 0.4 });
        }
      }
      buildings.push({ x, w, h, color, windows });
    }

    // Cars
    const cars: { x: number; y: number; speed: number; color: string; lane: number }[] = [];
    const laneY = [window.innerHeight * 0.7, window.innerHeight * 0.75, window.innerHeight * 0.8];
    for (let i = 0; i < 8; i++) {
      cars.push({
        x: Math.random() * window.innerWidth,
        y: laneY[i % 3],
        speed: 1 + Math.random() * 3,
        color: ['#ff6b6b', '#6bc5ff', '#a8ff6b', '#fbbf24', '#c06bff'][Math.floor(Math.random() * 5)],
        lane: i % 3,
      });
    }

    // Stars
    const stars: { x: number; y: number; r: number; opacity: number }[] = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 0.5,
        r: Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.7,
      });
    }

    let frame = 0;
    let animId: number;

    function draw() {
      if (!ctx || !canvas) return;
      frame++;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Night sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#020817');
      skyGrad.addColorStop(0.6, '#0a1628');
      skyGrad.addColorStop(1, '#1a0533');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      stars.forEach((s) => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity * (0.7 + Math.sin(frame * 0.03 + s.x) * 0.3)})`;
        ctx.fill();
      });

      // Moon
      ctx.beginPath();
      ctx.arc(canvas.width * 0.8, 80, 30, 0, Math.PI * 2);
      ctx.fillStyle = '#fef9c3';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(canvas.width * 0.8 + 15, 75, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#020817';
      ctx.fill();

      // Buildings
      buildings.forEach((b) => {
        const by = canvas.height * 0.7 - b.h;
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, by, b.w, b.h);

        // Windows
        b.windows.forEach((w) => {
          if (frame % 180 < 2 && Math.random() > 0.9) w.lit = !w.lit;
          if (w.lit) {
            ctx.fillStyle = `rgba(255, 235, 100, ${0.6 + Math.sin(frame * 0.05) * 0.1})`;
            ctx.fillRect(b.x + w.x, by + w.y, 7, 10);
          }
        });

        // Neon roof
        const neonColors = ['#f43f5e', '#a855f7', '#06b6d4', '#22c55e', '#f59e0b'];
        const nc = neonColors[Math.floor(Math.random() * neonColors.length)];
        ctx.shadowColor = nc;
        ctx.shadowBlur = 15;
        ctx.fillStyle = nc;
        ctx.fillRect(b.x, by - 3, b.w, 3);
        ctx.shadowBlur = 0;
      });

      // Ground / road
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      // Road markings
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      [0.7, 0.75, 0.8].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * y);
        ctx.lineTo(canvas.width, canvas.height * y);
        ctx.stroke();
      });

      // Lane dashes
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1;
      ctx.setLineDash([30, 20]);
      [0.725, 0.775].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * y);
        ctx.lineTo(canvas.width, canvas.height * y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Cars
      cars.forEach((car) => {
        car.x = (car.x + car.speed) % (canvas.width + 80);
        const cx = car.x;
        const cy = car.y;

        // Car body
        ctx.fillStyle = car.color;
        ctx.beginPath();
        ctx.roundRect(cx - 25, cy - 8, 50, 14, 3);
        ctx.fill();

        // Cabin
        ctx.beginPath();
        ctx.roundRect(cx - 15, cy - 18, 30, 11, 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Headlights
        ctx.shadowColor = '#fffef0';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#fffef0';
        ctx.fillRect(cx + 23, cy - 5, 4, 6);
        ctx.fillRect(cx - 27, cy - 5, 4, 6);
        ctx.shadowBlur = 0;

        // Tail lights
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(cx + 23, cy + 1, 3, 4);
        ctx.shadowBlur = 0;
      });

      // Palm trees
      [100, 250, 400, 600, 800, 1000, 1200].forEach((x) => {
        const groundY = canvas.height * 0.7;
        // Trunk
        ctx.fillStyle = '#7c5e3c';
        ctx.beginPath();
        ctx.moveTo(x - 5, groundY);
        ctx.lineTo(x + 5, groundY);
        ctx.lineTo(x + 3, groundY - 60);
        ctx.lineTo(x - 3, groundY - 60);
        ctx.fill();
        // Leaves
        ctx.fillStyle = '#16a34a';
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2 + frame * 0.01;
          ctx.beginPath();
          ctx.ellipse(
            x + Math.cos(angle) * 18,
            groundY - 60 + Math.sin(angle) * 8,
            18, 5, angle, 0, Math.PI * 2
          );
          ctx.fill();
        }
      });

      // Reflection effect on ground
      const reflGrad = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      reflGrad.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      reflGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = reflGrad;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}

export default function Hero() {
  const router = useRouter();
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTitleVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020817]">
      <AnimatedCityBg />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: titleVisible ? 1 : 0, y: titleVisible ? 0 : -30 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="text-center mb-6"
        >
          {/* GTS emblem */}
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          >
            <div
              className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-4xl font-black shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #2563eb, #7c3aed)',
                boxShadow: '0 0 40px rgba(124, 58, 237, 0.6), 0 0 80px rgba(124, 58, 237, 0.3)',
              }}
            >
              <span className="text-white text-3xl font-black tracking-tighter">GTS</span>
            </div>
          </motion.div>

          <h1
            className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-3"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #a855f7 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(168, 85, 247, 0.5))',
            }}
          >
            GRAND THEFT
            <br />
            SOLANA
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/70 text-lg md:text-xl font-medium tracking-wide"
            style={{ textShadow: '0 0 20px rgba(0,0,0,0.8)' }}
          >
            Complete missions. Build your empire. Earn SOL.
          </motion.p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <motion.button
            onClick={() => router.push('/game')}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168, 85, 247, 0.6)' }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xl px-10 py-4 rounded-2xl shadow-2xl shadow-purple-500/30 transition-all"
          >
            <Play className="w-6 h-6 fill-current" />
            PLAY NOW
          </motion.button>

          <WalletButton className="" />

          <motion.button
            onClick={() => router.push('/leaderboard')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl hover:border-white/40 transition-all"
          >
            <Trophy className="w-5 h-5 text-yellow-400" />
            Leaderboard
          </motion.button>
        </motion.div>

        {/* Feature tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="flex flex-wrap gap-3 justify-center mt-10"
        >
          {[
            { label: 'Open World', icon: '🌆' },
            { label: 'SOL Rewards', icon: '◎' },
            { label: 'Missions', icon: '🎯' },
            { label: 'Vehicles', icon: '🚗' },
            { label: 'NFT Ready', icon: '🖼️' },
            { label: 'Anti-Cheat', icon: '🛡️' },
          ].map((f) => (
            <span
              key={f.label}
              className="bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm px-4 py-2 rounded-full flex items-center gap-2"
            >
              {f.icon} {f.label}
            </span>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex gap-8 mt-12"
        >
          {[
            { value: '10K+', label: 'Players' },
            { value: '◎50+', label: 'SOL Distributed' },
            { value: '500K+', label: 'Missions Complete' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-white/40 text-xs">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30"
      >
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs">Scroll</span>
          <div className="w-0.5 h-6 bg-white/20 rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
