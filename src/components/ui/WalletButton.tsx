'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { truncateAddress } from '@/lib/utils';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';

interface WalletButtonProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export default function WalletButton({ className = '', variant = 'default' }: WalletButtonProps) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const setWalletAddress = useGameStore((s) => s.setWalletAddress);

  useEffect(() => {
    if (publicKey) {
      setWalletAddress(publicKey.toBase58());
    } else {
      setWalletAddress('');
    }
  }, [publicKey, setWalletAddress]);

  if (connected && publicKey) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 font-mono text-sm font-bold">
            {truncateAddress(publicKey.toBase58())}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/50 hover:text-red-400 rounded-xl px-3 py-2 transition-all"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={() => setVisible(true)}
        className={`flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors ${className}`}
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-bold">Connect Wallet</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setVisible(true)}
      className={`flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25 ${className}`}
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
      <ChevronDown className="w-4 h-4" />
    </button>
  );
}
