'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatXP, formatSOL } from '@/lib/utils';
import { getDifficultyColor, getMissionIcon } from '@/lib/missions';
import { Mission } from '@/types';
import { ChevronRight, X, Check, Clock, Zap } from 'lucide-react';

function MissionCard({ mission, onAccept }: { mission: Mission; onAccept: (m: Mission) => void }) {
  const diffColor = getDifficultyColor(mission.difficulty);
  const icon = getMissionIcon(mission.type);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 mb-2 hover:border-white/30 transition-colors cursor-pointer group"
      onClick={() => onAccept(mission)}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold text-sm truncate">{mission.title}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
              style={{ color: diffColor, backgroundColor: `${diffColor}22` }}
            >
              {mission.difficulty.toUpperCase()}
            </span>
          </div>
          <p className="text-white/50 text-xs mb-2 line-clamp-2">{mission.description}</p>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-green-400 font-mono">{formatCash(mission.cash_reward)}</span>
            <span className="text-yellow-400">{formatXP(mission.xp_reward)}</span>
            {mission.sol_reward > 0 && (
              <span className="text-purple-400 font-bold">{formatSOL(mission.sol_reward)}</span>
            )}
            <span className="text-white/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(mission.time_limit / 60)}:{(mission.time_limit % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}

export default function MissionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const missions = useGameStore((s) => s.missions);
  const activeMission = useGameStore((s) => s.activeMission);
  const setActiveMission = useGameStore((s) => s.setActiveMission);
  const completeMission = useGameStore((s) => s.completeMission);
  const missionStartTime = useGameStore((s) => s.missionStartTime);
  const missionDistance = useGameStore((s) => s.missionDistance);

  const handleAcceptMission = (mission: Mission) => {
    setActiveMission(mission);
    setIsOpen(false);
  };

  const handleAbandonMission = () => {
    setActiveMission(null);
  };

  const handleCompleteMission = () => {
    if (activeMission) {
      completeMission(activeMission.id);
    }
  };

  if (activeMission) {
    const icon = getMissionIcon(activeMission.type);
    return (
      <div className="w-72">
        <div className="bg-black/85 backdrop-blur-md border border-yellow-500/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <div>
                <div className="text-yellow-400 font-bold text-sm">{activeMission.title}</div>
                <div className="text-white/50 text-xs">ACTIVE MISSION</div>
              </div>
            </div>
            <button
              onClick={handleAbandonMission}
              className="text-white/30 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/70 text-xs mb-3">{activeMission.description}</p>
          <div className="bg-white/5 rounded-lg p-2 mb-3">
            <div className="text-white/40 text-xs mb-1">Rewards on completion</div>
            <div className="flex gap-3 text-xs">
              <span className="text-green-400 font-mono">{formatCash(activeMission.cash_reward)}</span>
              <span className="text-yellow-400">{formatXP(activeMission.xp_reward)}</span>
              {activeMission.sol_reward > 0 && (
                <span className="text-purple-400 font-bold">{formatSOL(activeMission.sol_reward)}</span>
              )}
            </div>
          </div>
          <div className="text-white/40 text-xs mb-3">
            Distance traveled: {missionDistance.toFixed(0)}m
          </div>
          {/* For demo - complete mission button */}
          <button
            onClick={handleCompleteMission}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Complete Mission (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 max-h-96 overflow-y-auto scrollbar-hide"
          >
            <div className="text-white/50 text-xs uppercase tracking-widest mb-2 text-center">
              Available Missions
            </div>
            {missions.map((m) => (
              <MissionCard key={m.id} mission={m} onAccept={handleAcceptMission} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/80 backdrop-blur-md border border-purple-500/50 hover:border-purple-400 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 text-purple-400" />
        {isOpen ? 'Close Missions' : 'View Missions'}
        <span className="bg-purple-500/30 text-purple-400 text-xs px-2 py-0.5 rounded-full">
          {missions.length}
        </span>
      </button>
    </div>
  );
}
