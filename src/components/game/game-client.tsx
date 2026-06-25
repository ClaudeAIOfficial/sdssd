"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { AnimatePresence, motion } from "framer-motion";
import { Hud } from "@/components/game/hud";
import { LandingPage } from "@/components/game/landing-page";
import { PhonePanel } from "@/components/game/phone-panel";
import { AudioEngine } from "@/components/game/audio-engine";
import { CharacterCustomizer } from "@/components/game/character-customizer";
import { LeaderboardEntry, MissionReward } from "@/lib/types";
import { useGameStore } from "@/store/game-store";
import { formatWallet } from "@/lib/utils";

const GameExperience = dynamic(
  () => import("@/components/game/game-experience").then((module) => module.GameExperience),
  { ssr: false, loading: () => <div className="h-screen w-screen bg-slate-950" /> },
);

type VerifyResponse = {
  verified: boolean;
  reward?: MissionReward;
  error?: string;
};

export function GameClient() {
  const wallet = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [moving, setMoving] = useState(false);
  const [rewardHistory, setRewardHistory] = useState<
    Array<{
      reward_id: string;
      status: string;
      sol: number;
      cash: number;
      created_at: string;
      transaction_signature?: string | null;
    }>
  >([]);

  const {
    started,
    startGame,
    stats,
    playerPosition,
    activeMission,
    availableMissions,
    npcs,
    vehicles,
    notifications,
    dayTime,
    activeInterior,
    playerVehicleId,
    phoneOpen,
    togglePhone,
    acceptMission,
    lastReward,
    dismissNotification,
    setWalletAddress,
    pendingMissionReport,
    clearPendingReport,
    applyMissionReward,
    addRandomMission,
    walletOpen,
    toggleWalletPanel,
    customization,
    setCustomization,
    inventory,
  } = useGameStore((state) => ({
    started: state.started,
    startGame: state.startGame,
    stats: state.stats,
    playerPosition: state.playerPosition,
    activeMission: state.activeMission,
    availableMissions: state.availableMissions,
    npcs: state.npcs,
    vehicles: state.vehicles,
    notifications: state.notifications,
    dayTime: state.dayTime,
    activeInterior: state.activeInterior,
    playerVehicleId: state.playerVehicleId,
    phoneOpen: state.phoneOpen,
    togglePhone: state.togglePhone,
    acceptMission: state.acceptMission,
    lastReward: state.lastReward,
    dismissNotification: state.dismissNotification,
    setWalletAddress: state.setWalletAddress,
    pendingMissionReport: state.pendingMissionReport,
    clearPendingReport: state.clearPendingReport,
    applyMissionReward: state.applyMissionReward,
    addRandomMission: state.addRandomMission,
    walletOpen: state.walletOpen,
    toggleWalletPanel: state.toggleWalletPanel,
    customization: state.customization,
    setCustomization: state.setCustomization,
    inventory: state.inventory,
  }));

  const walletAddress = wallet.publicKey?.toBase58();
  const missionTarget = activeMission?.dropoff;
  const driving = Boolean(playerVehicleId);

  const syncLeaderboard = useCallback(async () => {
    const res = await fetch("/api/leaderboard", { cache: "no-store" });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as { entries?: LeaderboardEntry[] };
    setLeaderboard(data.entries ?? []);
  }, []);

  const syncRewardHistory = useCallback(async () => {
    if (!walletAddress) {
      setRewardHistory([]);
      return;
    }
    const res = await fetch(`/api/rewards/history?wallet=${walletAddress}`, { cache: "no-store" });
    if (!res.ok) {
      return;
    }
    const data = (await res.json()) as {
      rewards?: Array<{
        reward_id: string;
        status: string;
        sol: number;
        cash: number;
        created_at: string;
        transaction_signature?: string | null;
      }>;
    };
    setRewardHistory(data.rewards ?? []);
  }, [walletAddress]);

  useEffect(() => {
    const startup = window.setTimeout(() => {
      void syncLeaderboard();
    }, 0);
    const interval = window.setInterval(syncLeaderboard, 12000);
    return () => {
      window.clearTimeout(startup);
      window.clearInterval(interval);
    };
  }, [syncLeaderboard]);

  useEffect(() => {
    if (!walletAddress) {
      setWalletAddress(undefined);
      return;
    }
    setWalletAddress(walletAddress);
    void fetch("/api/player/init", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    const task = window.setTimeout(() => {
      void syncRewardHistory();
    }, 0);
    return () => window.clearTimeout(task);
  }, [walletAddress, setWalletAddress, syncRewardHistory]);

  useEffect(() => {
    let previous = useGameStore.getState().playerPosition;
    const interval = window.setInterval(() => {
      const current = useGameStore.getState().playerPosition;
      const delta = Math.hypot(current.x - previous.x, current.z - previous.z);
      setMoving(delta > 0.2);
      previous = current;
    }, 150);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!pendingMissionReport) {
      return;
    }

    let cancelled = false;
    const verify = async () => {
      const res = await fetch("/api/missions/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(pendingMissionReport),
      });
      const data = (await res.json()) as VerifyResponse;
      if (cancelled) {
        return;
      }
      if (!res.ok || !data.reward || !data.verified) {
        clearPendingReport();
        useGameStore.setState({
          notifications: [data.error ?? "Mission verification failed."],
        });
        return;
      }
      applyMissionReward(data.reward);
      await syncLeaderboard();
      await syncRewardHistory();
    };

    void verify();
    return () => {
      cancelled = true;
    };
  }, [pendingMissionReport, clearPendingReport, applyMissionReward, syncLeaderboard, syncRewardHistory]);

  const claimReward = useCallback(async () => {
    if (!walletAddress || !lastReward?.rewardId || lastReward.sol <= 0) {
      useGameStore.setState({
        notifications: ["No pending SOL reward to claim."],
      });
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch("/api/rewards/claim", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rewardId: lastReward.rewardId,
          walletAddress,
        }),
      });
      const data = (await res.json()) as { claimed?: boolean; sol?: number; error?: string };
      if (!res.ok || !data.claimed || !data.sol) {
        useGameStore.setState({ notifications: [data.error ?? "Claim failed."] });
        return;
      }
      useGameStore.getState().claimSolReward(data.sol);
      await syncLeaderboard();
      await syncRewardHistory();
    } finally {
      setClaiming(false);
    }
  }, [lastReward, walletAddress, syncLeaderboard, syncRewardHistory]);

  const statsSummary = useMemo(
    () => [
      { label: "Cash", value: `$${stats.cash.toLocaleString()}` },
      { label: "SOL", value: stats.sol.toFixed(4) },
      { label: "XP", value: stats.xp.toLocaleString() },
      { label: "Rep", value: stats.reputation.toLocaleString() },
    ],
    [stats.cash, stats.reputation, stats.sol, stats.xp],
  );

  if (!started) {
    return (
      <>
        <LandingPage onPlay={startGame} onOpenLeaderboard={() => setLeaderboardOpen(true)} />
        <LeaderboardModal
          open={leaderboardOpen}
          entries={leaderboard}
          onClose={() => setLeaderboardOpen(false)}
        />
      </>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      <GameExperience onMissionTrigger={addRandomMission} />
      <AudioEngine
        enabled={audioEnabled}
        moving={moving}
        driving={driving}
        missionCompleteKey={lastReward?.rewardId ?? null}
      />

      <div className="pointer-events-auto absolute left-4 top-4 z-30 flex gap-2">
        <WalletMultiButton className="!rounded-xl !bg-cyan-500 !text-slate-950 hover:!bg-cyan-300" />
        <button
          type="button"
          onClick={() => setLeaderboardOpen((prev) => !prev)}
          className="rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-sm text-white hover:bg-black/60"
        >
          Leaderboard
        </button>
        <button
          type="button"
          onClick={togglePhone}
          className="rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-sm text-white hover:bg-black/60"
        >
          Phone (P)
        </button>
        <button
          type="button"
          onClick={toggleWalletPanel}
          className="rounded-xl border border-white/20 bg-black/45 px-3 py-2 text-sm text-white hover:bg-black/60"
        >
          Wallet
        </button>
        <button
          type="button"
          onClick={() => setAdminOpen(true)}
          className="rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/20 px-3 py-2 text-sm text-fuchsia-100 hover:bg-fuchsia-500/40"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => setAudioEnabled((prev) => !prev)}
          className="rounded-xl border border-emerald-300/40 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-100 hover:bg-emerald-500/40"
        >
          {audioEnabled ? "Audio On" : "Enable Audio"}
        </button>
      </div>

      <Hud
        stats={stats}
        playerPosition={playerPosition}
        mission={activeMission}
        npcs={npcs}
        vehicles={vehicles}
        notifications={notifications}
        dayTime={dayTime}
        interior={activeInterior}
        lastReward={lastReward}
        onClearNotifications={dismissNotification}
      />

      <AnimatePresence>
        {phoneOpen && (
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }}>
            <PhonePanel
              walletAddress={walletAddress}
              missions={availableMissions}
              activeMissionId={activeMission?.id}
              missionTarget={missionTarget}
              leaderboard={leaderboard}
              lastReward={lastReward}
              rewardHistory={rewardHistory}
              onAcceptMission={acceptMission}
              onClaimReward={claimReward}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {walletOpen && (
        <section className="pointer-events-auto absolute bottom-4 left-4 z-30 w-[min(92vw,420px)] rounded-2xl border border-white/15 bg-slate-900/80 p-4 text-white backdrop-blur-xl">
          <header className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Wallet Overview</h3>
            <button onClick={toggleWalletPanel} type="button" className="text-sm text-slate-300">
              Close
            </button>
          </header>
          <p className="text-xs text-slate-300">Address: {formatWallet(walletAddress)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {statsSummary.map((entry) => (
              <div key={entry.label} className="rounded-lg bg-white/10 p-2">
                <p className="text-xs text-slate-400">{entry.label}</p>
                <p>{entry.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg bg-white/10 p-2 text-xs text-slate-200">
            <p className="mb-1 text-slate-400">Inventory</p>
            <p>{inventory.join(" • ")}</p>
          </div>
          <button
            type="button"
            onClick={claimReward}
            disabled={claiming}
            className="mt-3 w-full rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-900 disabled:opacity-60"
          >
            {claiming ? "Claiming..." : "Claim SOL Rewards"}
          </button>
        </section>
      )}

      <CharacterCustomizer customization={customization} onChange={setCustomization} />

      {activeInterior && (
        <section className="pointer-events-auto absolute inset-x-0 bottom-0 z-30 mx-auto mb-4 w-[min(92vw,680px)] rounded-2xl border border-cyan-300/30 bg-slate-900/90 p-4 text-white backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-cyan-300">
            {activeInterior.replace("_", " ").toUpperCase()} INTERIOR
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            You can interact with NPCs, manage inventory, and prepare for the next mission here.
          </p>
          <button
            type="button"
            onClick={() => useGameStore.getState().exitBuilding()}
            className="mt-3 rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-900"
          >
            Exit Building (E)
          </button>
        </section>
      )}

      <LeaderboardModal open={leaderboardOpen} entries={leaderboard} onClose={() => setLeaderboardOpen(false)} />
      <AdminShortcutModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </main>
  );
}

function LeaderboardModal({
  open,
  entries,
  onClose,
}: {
  open: boolean;
  entries: LeaderboardEntry[];
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900/90 p-6 text-white backdrop-blur-xl">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Global Leaderboard</h2>
          <button type="button" onClick={onClose} className="rounded-lg bg-white/10 px-3 py-1">
            Close
          </button>
        </header>
        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-slate-400">Loading leaderboard...</p>
          ) : (
            entries.map((entry, index) => (
              <div key={entry.walletAddress} className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs text-slate-400">#{index + 1}</p>
                <p className="font-semibold">{formatWallet(entry.walletAddress)}</p>
                <p className="text-sm text-slate-200">
                  REP {entry.reputation} • CASH ${entry.cash} • SOL {entry.solEarned.toFixed(4)} • MISSIONS{" "}
                  {entry.missionsCompleted}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function AdminShortcutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-fuchsia-300/30 bg-slate-900/95 p-6 text-white">
        <h3 className="text-xl font-semibold text-fuchsia-200">Admin Panel</h3>
        <p className="mt-2 text-sm text-slate-300">
          Open <code className="rounded bg-white/10 px-1 py-0.5">/admin</code> to create missions, ban players,
          spawn events, approve rewards, and tune the economy.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-lg bg-fuchsia-500 px-4 py-2 font-semibold text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}

