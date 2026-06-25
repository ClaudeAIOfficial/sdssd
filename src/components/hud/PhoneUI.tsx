'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { formatCash, formatSOL, formatXP, truncateAddress } from '@/lib/utils';
import {
  Map, Users, Trophy, Wallet, Briefcase, Settings, X,
  Phone, ChevronRight, Star, DollarSign, Activity
} from 'lucide-react';

const TABS = [
  { id: 'map', label: 'Map', icon: Map },
  { id: 'missions', label: 'Missions', icon: Briefcase },
  { id: 'leaderboard', label: 'Leaders', icon: Trophy },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function MapTab() {
  return (
    <div className="p-4 text-center">
      <div className="text-white/60 text-sm mb-4">City Overview</div>
      <div className="bg-[#0a1628] rounded-xl overflow-hidden" style={{ height: 280 }}>
        <div className="relative w-full h-full">
          {/* Simple city map visualization */}
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <rect width="200" height="200" fill="#0a1628" />
            {/* Roads */}
            <line x1="0" y1="100" x2="200" y2="100" stroke="#374151" strokeWidth="4" />
            <line x1="100" y1="0" x2="100" y2="200" stroke="#374151" strokeWidth="4" />
            <line x1="0" y1="70" x2="200" y2="70" stroke="#374151" strokeWidth="3" />
            <line x1="0" y1="130" x2="200" y2="130" stroke="#374151" strokeWidth="3" />
            <line x1="70" y1="0" x2="70" y2="200" stroke="#374151" strokeWidth="3" />
            <line x1="130" y1="0" x2="130" y2="200" stroke="#374151" strokeWidth="3" />
            {/* Buildings */}
            <rect x="105" y="75" width="20" height="20" fill="#1e3a5f" rx="2" />
            <rect x="75" y="75" width="20" height="20" fill="#334155" rx="2" />
            <rect x="105" y="105" width="20" height="20" fill="#1e293b" rx="2" />
            <rect x="75" y="105" width="20" height="20" fill="#312e81" rx="2" />
            {/* Beach */}
            <rect x="75" y="155" width="50" height="20" fill="#f5d485" rx="2" />
            <rect x="75" y="168" width="50" height="20" fill="#38bdf8" rx="2" />
            {/* Park */}
            <rect x="20" y="80" width="25" height="25" fill="#16a34a" rx="2" />
            {/* Labels */}
            <text x="100" y="170" textAnchor="middle" fill="#94a3b8" fontSize="6">Beach</text>
            <text x="33" y="96" textAnchor="middle" fill="#94a3b8" fontSize="5">Park</text>
            <text x="100" y="96" textAnchor="middle" fill="#f59e0b" fontSize="5">Downtown</text>
            {/* Player dot */}
            <circle cx="103" cy="103" r="4" fill="#22c55e" />
            <circle cx="103" cy="103" r="6" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 justify-center text-xs">
        {[
          { label: 'Bank', color: '#9333ea' },
          { label: 'Casino', color: '#f59e0b' },
          { label: 'Harbor', color: '#38bdf8' },
          { label: 'Police', color: '#3b82f6' },
          { label: 'Park', color: '#22c55e' },
        ].map((l) => (
          <span key={l.label} className="flex items-center gap-1 text-white/60">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function MissionsTab() {
  const missions = useGameStore((s) => s.missions);
  const activeMission = useGameStore((s) => s.activeMission);

  return (
    <div className="p-4">
      {activeMission && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-xl p-3 mb-4">
          <div className="text-yellow-400 font-bold text-sm mb-1">Active Mission</div>
          <div className="text-white text-sm">{activeMission.title}</div>
          <div className="text-white/50 text-xs">{activeMission.description}</div>
        </div>
      )}
      <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Available</div>
      <div className="space-y-2">
        {missions.map((m) => (
          <div key={m.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div className="text-xl">{m.type === 'delivery' ? '📦' : m.type === 'race' ? '🏁' : '🎯'}</div>
            <div className="flex-1">
              <div className="text-white text-sm font-bold">{m.title}</div>
              <div className="text-white/40 text-xs">{formatCash(m.cash_reward)} cash</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardTab() {
  const mockLeaders = [
    { rank: 1, name: 'CryptoKing', rep: 9850, sol: 2.45 },
    { rank: 2, name: 'NeonRider', rep: 8720, sol: 1.87 },
    { rank: 3, name: 'BlockBuster', rep: 7650, sol: 1.23 },
    { rank: 4, name: 'SolStreet', rep: 6890, sol: 0.95 },
    { rank: 5, name: 'ChainGang', rep: 5440, sol: 0.78 },
  ];

  return (
    <div className="p-4">
      <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Top Players</div>
      <div className="space-y-2">
        {mockLeaders.map((p) => (
          <div key={p.rank} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-sm ${
                p.rank === 1 ? 'bg-yellow-500 text-black' :
                p.rank === 2 ? 'bg-gray-400 text-black' :
                p.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-white/10 text-white/50'
              }`}
            >
              {p.rank}
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-bold">{p.name}</div>
              <div className="text-white/40 text-xs">{p.rep.toLocaleString()} REP</div>
            </div>
            <div className="text-purple-400 text-sm font-bold">{formatSOL(p.sol)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletTab() {
  const player = useGameStore((s) => s.player);

  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-4 mb-4">
        <div className="text-white/50 text-xs mb-1">Connected Wallet</div>
        <div className="text-white font-mono text-sm font-bold mb-3">
          {player.wallet_address ? truncateAddress(player.wallet_address, 6) : 'Not connected'}
        </div>
        <div className="border-t border-white/10 pt-3">
          <div className="text-white/50 text-xs mb-1">SOL Earned in Game</div>
          <div className="text-3xl font-black text-purple-400">{formatSOL(player.sol_earned)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-3">
          <DollarSign className="w-4 h-4 text-green-400 mb-1" />
          <div className="text-green-400 font-bold">{formatCash(player.cash)}</div>
          <div className="text-white/40 text-xs">In-game Cash</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <Activity className="w-4 h-4 text-cyan-400 mb-1" />
          <div className="text-cyan-400 font-bold">{player.reputation.toLocaleString()}</div>
          <div className="text-white/40 text-xs">Reputation</div>
        </div>
      </div>

      <div className="bg-white/5 rounded-xl p-3 mb-3">
        <div className="text-white/50 text-xs uppercase tracking-widest mb-2">Recent Transactions</div>
        <div className="text-white/30 text-sm text-center py-2">No transactions yet</div>
      </div>

      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
        Claim SOL Rewards
      </button>
    </div>
  );
}

function SettingsTab() {
  const { showCharacterCustomizer, setShowCharacterCustomizer, togglePhone } = useGameStore();

  return (
    <div className="p-4 space-y-3">
      <button
        onClick={() => {
          setShowCharacterCustomizer(true);
          togglePhone();
        }}
        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-3 rounded-xl transition-colors text-left px-4 flex items-center justify-between"
      >
        <span>Character Customization</span>
        <ChevronRight className="w-4 h-4 text-white/40" />
      </button>
      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Audio</div>
        {['Music', 'SFX', 'Ambient'].map((s) => (
          <div key={s} className="flex items-center justify-between mb-2">
            <span className="text-white/70 text-sm">{s}</span>
            <div className="w-24 h-2 bg-white/10 rounded-full">
              <div className="w-16 h-full bg-purple-500 rounded-full" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-4">
        <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Graphics</div>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-sm">Quality</span>
          <div className="flex gap-1">
            {['Low', 'Med', 'High'].map((q, i) => (
              <button
                key={q}
                className={`px-2 py-1 rounded text-xs font-bold ${i === 2 ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/40'}`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhoneUI() {
  const { isPhoneOpen, togglePhone, phoneTab, setPhoneTab } = useGameStore();

  return (
    <AnimatePresence>
      {isPhoneOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-80 bg-[#0d1117] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
            style={{
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.3), 0 25px 50px rgba(0,0,0,0.8)',
              maxHeight: '85vh',
            }}
          >
            {/* Status bar */}
            <div className="bg-black/50 px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-white/60" />
                <span className="text-white/60 text-xs font-bold">CRYPTO PHONE</span>
              </div>
              <button onClick={togglePhone} className="text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App header */}
            <div className="px-6 py-4 bg-gradient-to-b from-purple-900/30 to-transparent border-b border-white/5">
              <div className="text-white font-black text-lg">
                {TABS.find((t) => t.id === phoneTab)?.label || 'Menu'}
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {phoneTab === 'map' && <MapTab />}
              {phoneTab === 'missions' && <MissionsTab />}
              {phoneTab === 'leaderboard' && <LeaderboardTab />}
              {phoneTab === 'wallet' && <WalletTab />}
              {phoneTab === 'settings' && <SettingsTab />}
            </div>

            {/* Navigation */}
            <div className="border-t border-white/10 bg-black/40 px-2 py-3">
              <div className="flex justify-around">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setPhoneTab(id)}
                    className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all ${
                      phoneTab === id
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-white/30 hover:text-white/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-bold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center py-2 bg-black/40">
              <div className="w-24 h-1 bg-white/20 rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
