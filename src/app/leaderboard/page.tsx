'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy, Star, DollarSign, Activity, Zap } from 'lucide-react';
import { formatCash, formatSOL, truncateAddress } from '@/lib/utils';

interface LeaderEntry {
  rank: number;
  username: string;
  wallet: string;
  reputation: number;
  cash: number;
  sol: number;
  missions: number;
  level: number;
}

const MOCK_LEADERS: LeaderEntry[] = [
  { rank: 1, username: 'CryptoKing_Sol', wallet: '9xKj...4mNp', reputation: 98500, cash: 250000, sol: 2.45, missions: 312, level: 42 },
  { rank: 2, username: 'NeonRider_X', wallet: '3aQr...9sWt', reputation: 87200, cash: 188000, sol: 1.87, missions: 278, level: 38 },
  { rank: 3, username: 'BlockBuster99', wallet: '7mHy...2kLz', reputation: 76500, cash: 145000, sol: 1.23, missions: 234, level: 35 },
  { rank: 4, username: 'SolStreetRacer', wallet: '1pBn...8vCq', reputation: 68900, cash: 122000, sol: 0.95, missions: 198, level: 31 },
  { rank: 5, username: 'ChainGang_Elite', wallet: '5dEr...6fMu', reputation: 54400, cash: 98500, sol: 0.78, missions: 167, level: 28 },
  { rank: 6, username: 'WalletHunter', wallet: '2cFt...1gNv', reputation: 48200, cash: 87300, sol: 0.62, missions: 145, level: 25 },
  { rank: 7, username: 'MiamiBoss', wallet: '8jKs...5hOw', reputation: 41500, cash: 72000, sol: 0.48, missions: 122, level: 22 },
  { rank: 8, username: 'SolanaGhost', wallet: '4lMt...3iPx', reputation: 35700, cash: 65000, sol: 0.35, missions: 98, level: 19 },
  { rank: 9, username: 'PixelThug', wallet: '6nNu...7jQy', reputation: 28900, cash: 54200, sol: 0.22, missions: 82, level: 17 },
  { rank: 10, username: 'CryptoSniper', wallet: '0oOv...9kRz', reputation: 22100, cash: 43800, sol: 0.15, missions: 65, level: 14 },
];

type SortKey = 'reputation' | 'cash' | 'sol' | 'missions';

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState<SortKey>('reputation');
  const [leaders, setLeaders] = useState<LeaderEntry[]>(MOCK_LEADERS);

  useEffect(() => {
    const sorted = [...MOCK_LEADERS].sort((a, b) => b[sortBy] - a[sortBy]);
    sorted.forEach((l, i) => { l.rank = i + 1; });
    setLeaders(sorted);
  }, [sortBy]);

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/40';
    if (rank === 3) return 'bg-gradient-to-r from-orange-700/10 to-orange-800/10 border-orange-600/40';
    return 'bg-white/3 border-white/5';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-black';
    if (rank === 2) return 'bg-gray-400 text-black';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-white/10 text-white/60';
  };

  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Background */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(168,85,247,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          </div>
          <Link
            href="/game"
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            Play Now
          </Link>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl">
          {[
            { key: 'reputation' as SortKey, label: 'Reputation', icon: Activity },
            { key: 'cash' as SortKey, label: 'Cash', icon: DollarSign },
            { key: 'sol' as SortKey, label: 'SOL Earned', icon: Star },
            { key: 'missions' as SortKey, label: 'Missions', icon: Zap },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${
                sortBy === key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Podium for top 3 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[leaders[1], leaders[0], leaders[2]].map((leader, i) => {
            const heights = ['h-24', 'h-32', 'h-20'];
            const positions = ['2nd', '1st', '3rd'];
            const colors = ['bg-gray-400/20', 'bg-yellow-500/20', 'bg-orange-600/20'];
            const borderColors = ['border-gray-400/40', 'border-yellow-500/60', 'border-orange-600/40'];

            return leader ? (
              <motion.div
                key={leader.rank}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`${colors[i]} border ${borderColors[i]} rounded-2xl p-4 text-center flex flex-col justify-between`}
              >
                <div>
                  <div className="text-2xl mb-1">
                    {i === 1 ? '👑' : i === 0 ? '🥈' : '🥉'}
                  </div>
                  <div className="text-white font-black text-sm truncate">{leader.username}</div>
                  <div className="text-white/40 text-xs">Level {leader.level}</div>
                </div>
                <div className="mt-2">
                  <div className="text-white/50 text-xs">{positions[i]}</div>
                  <div className={`text-sm font-bold mt-1 ${i === 1 ? 'text-yellow-400' : 'text-white'}`}>
                    {sortBy === 'reputation' ? `${leader.reputation.toLocaleString()} REP` :
                     sortBy === 'cash' ? formatCash(leader.cash) :
                     sortBy === 'sol' ? formatSOL(leader.sol) :
                     `${leader.missions} missions`}
                  </div>
                </div>
              </motion.div>
            ) : null;
          })}
        </div>

        {/* Full leaderboard */}
        <div className="space-y-2">
          {leaders.map((leader, i) => (
            <motion.div
              key={leader.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`border rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-purple-500/30 ${getRankStyle(leader.rank)}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${getRankBadge(leader.rank)}`}
              >
                {leader.rank}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold truncate">{leader.username}</span>
                  <span className="text-white/30 text-xs shrink-0">{leader.wallet}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">Lv.{leader.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right shrink-0">
                <div>
                  <div className="text-cyan-400 font-bold text-sm">{leader.reputation.toLocaleString()}</div>
                  <div className="text-white/30 text-xs">REP</div>
                </div>
                <div>
                  <div className="text-purple-400 font-bold text-sm">{formatSOL(leader.sol)}</div>
                  <div className="text-white/30 text-xs">SOL</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold text-sm">{formatCash(leader.cash)}</div>
                  <div className="text-white/30 text-xs">Cash</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold text-sm">{leader.missions}</div>
                  <div className="text-white/30 text-xs">Missions</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-8 text-white/30 text-sm">
          Updated live · {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
