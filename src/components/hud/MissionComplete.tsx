'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCash, formatXP, formatSOL } from '@/lib/utils';
import { Trophy, DollarSign, Zap, Star } from 'lucide-react';

interface Props {
  data: { cash: number; xp: number; reputation: number; sol: number };
  onClose: () => void;
}

export default function MissionComplete({ data, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto"
      onClick={onClose}
    >
      <div className="bg-black/90 backdrop-blur-xl border border-yellow-500/60 rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl shadow-yellow-500/20">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black text-yellow-400 mb-1">MISSION COMPLETE</h2>
        <p className="text-white/50 text-sm mb-6">Outstanding work, agent!</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
            <DollarSign className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <div className="text-green-400 font-black text-lg font-mono">
              +{formatCash(data.cash)}
            </div>
            <div className="text-white/40 text-xs">Cash</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <div className="text-yellow-400 font-black text-lg">+{formatXP(data.xp)}</div>
            <div className="text-white/40 text-xs">Experience</div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
            <Star className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-cyan-400 font-black text-lg">+{data.reputation}</div>
            <div className="text-white/40 text-xs">Reputation</div>
          </div>
          {data.sol > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
              <div className="text-2xl mb-1">◎</div>
              <div className="text-purple-400 font-black text-lg">{formatSOL(data.sol)}</div>
              <div className="text-white/40 text-xs">SOL Earned</div>
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-black py-3 px-8 rounded-xl transition-colors"
        >
          CONTINUE
        </motion.button>
        <p className="text-white/30 text-xs mt-3">Closes automatically in 5s</p>
      </div>
    </motion.div>
  );
}
