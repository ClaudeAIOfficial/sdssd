'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Star } from 'lucide-react';

export default function WantedStars() {
  const wantedLevel = useGameStore((s) => s.wantedLevel);

  if (wantedLevel === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-black/80 backdrop-blur-md border border-red-500/50 rounded-xl px-3 py-2 mb-2"
    >
      <div className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1 text-center">
        WANTED
      </div>
      <div className="flex gap-1 justify-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={i < wantedLevel ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
          >
            <Star
              className={`w-5 h-5 ${i < wantedLevel ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
