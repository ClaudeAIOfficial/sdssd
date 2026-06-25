"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useMemo } from "react";
import { useGameStore } from "@/store/game-store";
import "@solana/wallet-adapter-react-ui/styles.css";

function WalletAccountBridge() {
  const { publicKey, connected } = useWallet();
  const createPlayer = useGameStore((state) => state.createPlayer);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      createPlayer(walletAddress);
      fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress })
      }).catch(() => {
        createPlayer(walletAddress);
      });
    }
  }, [connected, createPlayer, publicKey]);

  return null;
}

export function GtsWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl(network);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new BackpackWalletAdapter(), new SolflareWalletAdapter({ network })],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletAccountBridge />
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "scale-90 origin-right" : undefined}>
      <WalletMultiButton />
    </div>
  );
}
