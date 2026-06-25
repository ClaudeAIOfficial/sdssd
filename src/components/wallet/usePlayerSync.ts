"use client";

import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useGame } from "@/lib/store";
import type { PlayerProfile } from "@/lib/types";

/**
 * Keeps the backend player record in sync with the connected wallet. The first
 * time a wallet connects it auto-creates a player account (sign-up on connect).
 */
export function usePlayerSync() {
  const { publicKey, connected } = useWallet();
  const setWallet = useGame((s) => s.setWallet);
  const bindServerPlayer = useGame((s) => s.bindServerPlayer);
  const notify = useGame((s) => s.notify);
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const address = connected && publicKey ? publicKey.toBase58() : null;
    setWallet(address);
    if (!address || lastKey.current === address) return;
    lastKey.current = address;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/player", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: address }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (!cancelled) notify({ title: "Login failed", body: err.error ?? "Try again", kind: "warn" });
          return;
        }
        const data = (await res.json()) as { player: PlayerProfile };
        if (!cancelled) {
          bindServerPlayer(data.player);
          notify({ title: "Wallet connected", body: data.player.handle, kind: "success" });
        }
      } catch {
        if (!cancelled) notify({ title: "Network error", body: "Could not reach server.", kind: "warn" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, publicKey, setWallet, bindServerPlayer, notify]);
}
