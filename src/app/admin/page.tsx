'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Briefcase, DollarSign, Activity, Ban, Plus,
  Eye, CheckCircle, XCircle, LogOut, AlertTriangle, BarChart3,
} from 'lucide-react';
import { formatCash, formatSOL } from '@/lib/utils';

const ADMIN_STATS = {
  totalPlayers: 1_247,
  activeMissions: 38,
  totalSOLDistributed: 142.8,
  pendingRewards: 12,
  bannedPlayers: 5,
  revenueToday: 8_500,
};

const MOCK_PLAYERS = [
  { id: '1', username: 'CryptoKing_Sol', wallet: '9xKj...4mNp', reputation: 98500, cash: 250000, sol: 2.45, status: 'active', level: 42 },
  { id: '2', username: 'SuspiciousAcc', wallet: '3aQr...9sWt', reputation: 12000, cash: 999999, sol: 0.5, status: 'flagged', level: 5 },
  { id: '3', username: 'BlockBuster99', wallet: '7mHy...2kLz', reputation: 76500, cash: 145000, sol: 1.23, status: 'active', level: 35 },
];

const MOCK_REWARDS = [
  { id: 'r1', player: 'CryptoKing_Sol', mission: 'Neon Street Race', amount: 0.05, status: 'pending', wallet: '9xKj...4mNp' },
  { id: 'r2', player: 'NeonRider_X', mission: 'Bodyguard Duty', amount: 0.02, status: 'pending', wallet: '3aQr...9sWt' },
  { id: 'r3', player: 'MiamiBoss', mission: 'Corporate Espionage', amount: 0.04, status: 'pending', wallet: '7mHy...2kLz' },
];

const MOCK_LOGS = [
  { id: 1, action: 'Player joined', user: 'SolanaGhost', time: '2 min ago', type: 'info' },
  { id: 2, action: 'Mission completed: Territory Takeover', user: 'CryptoKing_Sol', time: '5 min ago', type: 'success' },
  { id: 3, action: 'Suspicious speed detected', user: 'SuspiciousAcc', time: '8 min ago', type: 'warning' },
  { id: 4, action: 'Reward claimed: 0.05 SOL', user: 'NeonRider_X', time: '12 min ago', type: 'success' },
  { id: 5, action: 'Player banned', user: 'CheatBot_9', time: '25 min ago', type: 'error' },
];

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Shield; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-white/50 text-xs uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === 'admin123' || password === process.env.NEXT_PUBLIC_ADMIN_DEMO_PASS) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-80 text-center">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-white mb-2">Admin Panel</h1>
          <p className="text-white/40 text-sm mb-6">Grand Theft Solana</p>
          <input
            type="password"
            placeholder="Admin password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 mb-3"
          />
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <button
            onClick={handleLogin}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-colors"
          >
            Login
          </button>
          <p className="text-white/20 text-xs mt-4">Demo: admin123</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'rewards', label: 'Rewards', icon: DollarSign },
    { id: 'missions', label: 'Missions', icon: Briefcase },
    { id: 'logs', label: 'Logs', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-[#020817] flex">
      {/* Sidebar */}
      <div className="w-56 bg-black/40 border-r border-white/10 p-4 flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-white font-black">GTS Admin</span>
        </div>
        <nav className="space-y-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === id
                  ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setAuthenticated(false)}
          className="flex items-center gap-2 text-white/30 hover:text-red-400 transition-colors px-3 py-2 text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <StatCard icon={Users} label="Total Players" value={ADMIN_STATS.totalPlayers.toLocaleString()} color="#a855f7" />
              <StatCard icon={Briefcase} label="Active Missions" value={ADMIN_STATS.activeMissions} color="#22c55e" />
              <StatCard icon={DollarSign} label="SOL Distributed" value={formatSOL(ADMIN_STATS.totalSOLDistributed)} color="#f59e0b" />
              <StatCard icon={Activity} label="Pending Rewards" value={ADMIN_STATS.pendingRewards} color="#3b82f6" />
              <StatCard icon={Ban} label="Banned Players" value={ADMIN_STATS.bannedPlayers} color="#ef4444" />
              <StatCard icon={BarChart3} label="Revenue Today" value={formatCash(ADMIN_STATS.revenueToday)} color="#06b6d4" />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {MOCK_LOGS.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-green-400' :
                      log.type === 'warning' ? 'bg-yellow-400' :
                      log.type === 'error' ? 'bg-red-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-white/70 text-sm flex-1">{log.action}</span>
                    <span className="text-white/40 text-xs">{log.user}</span>
                    <span className="text-white/30 text-xs">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Players</h2>
              <div className="flex gap-2">
                <input
                  type="search"
                  placeholder="Search players..."
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <div className="space-y-3">
              {MOCK_PLAYERS.map((player) => (
                <div key={player.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{player.username}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          player.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {player.status}
                      </span>
                      <span className="text-white/30 text-xs">{player.wallet}</span>
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="text-cyan-400">REP: {player.reputation.toLocaleString()}</span>
                      <span className="text-green-400">{formatCash(player.cash)}</span>
                      <span className="text-purple-400">{formatSOL(player.sol)}</span>
                      <span className="text-yellow-400">Lv.{player.level}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors" title="View">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors" title="Ban">
                      <Ban className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Pending Rewards</h2>
            <div className="space-y-3">
              {MOCK_REWARDS.map((reward) => (
                <div key={reward.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-white font-bold">{reward.player}</div>
                    <div className="text-white/50 text-sm">{reward.mission}</div>
                    <div className="text-white/30 text-xs">{reward.wallet}</div>
                  </div>
                  <div className="text-purple-400 font-black text-lg">{formatSOL(reward.amount)}</div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors" title="Approve">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </button>
                    <button className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors" title="Reject">
                      <XCircle className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'missions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-white">Missions</h2>
              <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                <Plus className="w-4 h-4" />
                Create Mission
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <Briefcase className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <div className="text-white/50">Mission management coming soon</div>
              <div className="text-white/30 text-sm mt-1">Missions are currently auto-generated by the game engine</div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">Activity Logs</h2>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 font-mono text-xs space-y-1 max-h-[600px] overflow-auto">
              {[...MOCK_LOGS, ...MOCK_LOGS, ...MOCK_LOGS].map((log, i) => (
                <div key={i} className="flex gap-3 py-1 border-b border-white/5">
                  <span className="text-white/30 shrink-0">
                    {new Date(Date.now() - i * 180000).toLocaleTimeString()}
                  </span>
                  <span className={
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'warning' ? 'text-yellow-400' :
                    log.type === 'error' ? 'text-red-400' : 'text-blue-400'
                  }>
                    [{log.type.toUpperCase()}]
                  </span>
                  <span className="text-white/70">{log.action}</span>
                  <span className="text-white/30 ml-auto">{log.user}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
