"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback } from "react";

function shorten(addr: string): string {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

/**
 * Styled wallet connect/disconnect button matching the GTS neon theme. Wraps the
 * wallet-adapter modal (which lists Phantom, Backpack, Solflare and any
 * standard-wallet apps installed in the browser).
 */
export function WalletButton({
  className = "",
  variant = "primary",
}: {
  className?: string;
  variant?: "primary" | "ghost" | "cyan";
}) {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  const base =
    variant === "ghost" ? "btn-ghost" : variant === "cyan" ? "btn-cyan" : "btn-primary";

  const onClick = useCallback(() => {
    if (connected) {
      void disconnect();
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible]);

  return (
    <button onClick={onClick} className={`${base} ${className}`}>
      <span className="text-lg">{connected ? "🟢" : "👛"}</span>
      {connecting
        ? "Connecting…"
        : connected && publicKey
          ? shorten(publicKey.toBase58())
          : "Connect Wallet"}
    </button>
  );
}
