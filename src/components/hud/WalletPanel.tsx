"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useGame } from "@/lib/store";
import { WalletButton } from "@/components/wallet/WalletButton";
import { formatSol } from "@/lib/economy";
import type { RewardRecord } from "@/lib/types";

// Wallet tab for the in-game phone. Shows on-chain balance, in-game earned SOL,
// the claim flow (server-queued, never client-signed) and transaction history.
export function WalletPanel() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const profile = useGame((s) => s.profile);
  const notify = useGame((s) => s.notify);

  const [chainBalance, setChainBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<RewardRecord[]>([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    let active = true;
    if (connected && publicKey) {
      connection
        .getBalance(publicKey)
        .then((lamports) => active && setChainBalance(lamports / LAMPORTS_PER_SOL))
        .catch(() => active && setChainBalance(null));
    } else {
      setChainBalance(null);
    }
    return () => {
      active = false;
    };
  }, [connected, publicKey, connection]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`/api/rewards/claim?playerId=${encodeURIComponent(profile.id)}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.rewards ?? []);
      }
    } catch {
      /* offline: ignore */
    }
  }, [profile.id]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const claim = useCallback(async () => {
    if (!connected) {
      notify({ title: "Connect a wallet first", kind: "warn" });
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: profile.id }),
      });
      const data = await res.json();
      notify({
        title: data.queued > 0 ? "Rewards queued" : "Nothing to claim",
        body: data.message,
        kind: data.queued > 0 ? "reward" : "info",
      });
      void loadHistory();
    } catch {
      notify({ title: "Claim failed", body: "Could not reach the treasury service.", kind: "warn" });
    } finally {
      setClaiming(false);
    }
  }, [connected, profile.id, notify, loadHistory]);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-2xl bg-gradient-to-br from-gts-purple/40 to-gts-pink/30 p-4">
        <div className="text-[10px] uppercase tracking-widest text-white/60">In-Game SOL Earned</div>
        <div className="display-font text-4xl text-gts-teal">{formatSol(profile.sol)}</div>
        <div className="mt-1 text-xs text-white/60">
          On-chain wallet: {connected ? (chainBalance !== null ? `${chainBalance.toFixed(4)} SOL` : "…") : "not connected"}
        </div>
      </div>

      {!connected ? (
        <WalletButton variant="cyan" className="w-full" />
      ) : (
        <button onClick={claim} disabled={claiming} className="btn-cyan w-full disabled:opacity-60">
          {claiming ? "Processing…" : "◎ Claim Verified Rewards"}
        </button>
      )}

      <p className="rounded-lg bg-white/5 p-2 text-[10px] leading-relaxed text-white/50">
        Rewards are verified and approved by the backend. The client never signs payouts —
        approved SOL is queued for treasury settlement to your connected wallet.
      </p>

      <div className="text-[10px] uppercase tracking-widest text-white/50">Transaction History</div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {history.length === 0 && (
          <div className="rounded-lg bg-white/5 p-3 text-center text-xs text-white/40">
            No transactions yet. Complete verified missions to earn SOL.
          </div>
        )}
        {history.map((r) => (
          <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
            <div>
              <div className="font-semibold text-white/90">Mission reward</div>
              <div className="text-white/40">{new Date(r.createdAt).toLocaleTimeString()}</div>
            </div>
            <div className="text-right">
              {r.sol > 0 && <div className="text-gts-teal">+{r.sol} SOL</div>}
              <div className="text-gts-gold">+${r.cash}</div>
              <StatusPill status={r.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: RewardRecord["status"] }) {
  const map: Record<RewardRecord["status"], string> = {
    pending: "bg-gts-gold/20 text-gts-gold",
    approved: "bg-gts-cyan/20 text-gts-cyan",
    paid: "bg-gts-teal/20 text-gts-teal",
    rejected: "bg-gts-pink/20 text-gts-pink",
  };
  return <span className={`rounded px-1.5 py-0.5 text-[9px] uppercase ${map[status]}`}>{status}</span>;
}
