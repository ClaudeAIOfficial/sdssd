'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/store/gameStore';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletButton from '@/components/ui/WalletButton';
import { Play, ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';

// Dynamic import to avoid SSR issues with Three.js
const GameScene = dynamic(() => import('@/components/game/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#020817] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
        <div className="text-white font-black text-2xl mb-2">Loading GTS</div>
        <div className="text-white/50">Preparing the city...</div>
      </div>
    </div>
  ),
});

function GameIntro({ onStart }: { onStart: () => void }) {
  const { connected } = useWallet();
  const updatePlayerStats = useGameStore((s) => s.updatePlayerStats);
  const [name, setName] = useState('');

  const handleStart = () => {
    if (name.trim()) {
      updatePlayerStats({ id: name.toLowerCase().replace(/\s+/g, '_') });
    }
    onStart();
  };

  return (
    <div className="fixed inset-0 bg-[#020817] flex items-center justify-center z-50">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.3) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 text-center"
        style={{ boxShadow: '0 0 80px rgba(124, 58, 237, 0.3)' }}
      >
        <Link
          href="/"
          className="absolute top-4 left-4 text-white/40 hover:text-white flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div
          className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)',
          }}
        >
          <span className="text-white text-2xl font-black">GTS</span>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Enter the City</h1>
        <p className="text-white/50 text-sm mb-6">
          An open world awaits. Complete missions, earn cash, build your rep.
        </p>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Your street name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-colors text-center font-bold"
          />
        </div>

        {!connected && (
          <div className="mb-4">
            <div className="text-white/40 text-xs mb-2">Connect wallet to earn real SOL</div>
            <WalletButton className="w-full justify-center" />
          </div>
        )}

        {connected && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm">Wallet connected — SOL rewards enabled</span>
          </div>
        )}

        <motion.button
          onClick={handleStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xl py-4 rounded-2xl transition-all shadow-2xl shadow-purple-500/30"
        >
          <Play className="w-6 h-6 fill-current" />
          START GAME
        </motion.button>

        <div className="mt-4 text-white/30 text-xs">
          WASD to move · SHIFT to run · P for phone · E to interact
        </div>
      </motion.div>
    </div>
  );
}

export default function GamePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const storeGameStarted = useGameStore((s) => s.gameStarted);
  const setStoreGameStarted = useGameStore((s) => s.setGameStarted);

  const handleStart = () => {
    setGameStarted(true);
    setStoreGameStarted(true);
  };

  return (
    <>
      <AnimatePresence>
        {!gameStarted && <GameIntro onStart={handleStart} />}
      </AnimatePresence>
      {gameStarted && <GameScene />}
    </>
  );
}
