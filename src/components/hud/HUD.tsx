'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatXP, formatSOL, getLevelFromXP, getXPForNextLevel } from '@/lib/utils';
import MiniMap from './MiniMap';
import WantedStars from './WantedStars';
import MissionPanel from './MissionPanel';
import MissionComplete from './MissionComplete';
import { Activity, Zap, DollarSign, Star, Heart } from 'lucide-react';

export default function HUD() {
  const player = useGameStore((s) => s.player);
  const activeMission = useGameStore((s) => s.activeMission);
  const missionStartTime = useGameStore((s) => s.missionStartTime);
  const showMissionComplete = useGameStore((s) => s.showMissionComplete);
  const missionCompleteData = useGameStore((s) => s.missionCompleteData);
  const setMissionComplete = useGameStore((s) => s.setMissionComplete);
  const isPhoneOpen = useGameStore((s) => s.isPhoneOpen);

  const [missionTimer, setMissionTimer] = useState<number | null>(null);

  const xpForNext = getXPForNextLevel(player.level);
  const xpProgress = Math.min((player.xp / xpForNext) * 100, 100);

  useEffect(() => {
    if (!activeMission || !missionStartTime) {
      setMissionTimer(null);
      return;
    }
    const interval = setInterval(() => {
      const elapsed = (Date.now() - missionStartTime) / 1000;
      const remaining = activeMission.time_limit - elapsed;
      setMissionTimer(Math.max(0, remaining));
    }, 100);
    return () => clearInterval(interval);
  }, [activeMission, missionStartTime]);

  if (isPhoneOpen) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top-left player stats */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md border border-white/10 rounded-2xl p-3 min-w-[200px]">
          {/* Health */}
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-red-400" />
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full transition-all"
                style={{ width: `${player.health}%` }}
              />
            </div>
            <span className="text-xs text-white/60">{player.health}</span>
          </div>

          {/* Cash */}
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-bold font-mono">{formatCash(player.cash)}</span>
          </div>

          {/* SOL */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">◎</span>
            </div>
            <span className="text-purple-400 font-bold font-mono">{formatSOL(player.sol_earned)}</span>
          </div>

          {/* Level & XP */}
          <div className="mt-2 border-t border-white/10 pt-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold">LVL {player.level}</span>
              </div>
              <span className="text-white/40 text-xs">{formatXP(player.xp)}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full"
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Reputation */}
          <div className="flex items-center gap-2 mt-2">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-400 text-xs">REP: {player.reputation.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Top-right: minimap + wanted */}
      <div className="absolute top-4 right-4">
        <WantedStars />
        <MiniMap />
      </div>

      {/* Mission timer - top center */}
      <AnimatePresence>
        {activeMission && missionTimer !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2"
          >
            <div
              className={`bg-black/80 backdrop-blur-md border rounded-xl px-6 py-3 text-center ${
                missionTimer < 30 ? 'border-red-500 animate-pulse' : 'border-yellow-500/50'
              }`}
            >
              <div className="text-white/60 text-xs uppercase tracking-widest mb-1">Mission Timer</div>
              <div
                className={`text-3xl font-black font-mono ${
                  missionTimer < 30 ? 'text-red-400' : 'text-yellow-400'
                }`}
              >
                {Math.floor(missionTimer / 60).toString().padStart(2, '0')}:
                {Math.floor(missionTimer % 60).toString().padStart(2, '0')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom-right: mission panel */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
        <MissionPanel />
      </div>

      {/* Controls hint - bottom left */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <div className="text-white/50 text-xs space-y-1">
            <div><span className="text-white/80 font-mono bg-white/10 px-1 rounded">WASD</span> Move</div>
            <div><span className="text-white/80 font-mono bg-white/10 px-1 rounded">SHIFT</span> Run</div>
            <div><span className="text-white/80 font-mono bg-white/10 px-1 rounded">E</span> Interact</div>
            <div><span className="text-white/80 font-mono bg-white/10 px-1 rounded">P</span> Phone</div>
            <div><span className="text-white/80 font-mono bg-white/10 px-1 rounded">F</span> Enter vehicle</div>
          </div>
        </div>
      </div>

      {/* Mission complete overlay */}
      <AnimatePresence>
        {showMissionComplete && missionCompleteData && (
          <MissionComplete
            data={missionCompleteData}
            onClose={() => setMissionComplete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
