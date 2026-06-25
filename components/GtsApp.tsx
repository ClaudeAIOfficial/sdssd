"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { GameShell } from "@/components/game/GameShell";
import { useGameStore } from "@/lib/store";

export default function GtsApp() {
  const [mode, setMode] = useState<"home" | "play" | "admin">("home");
  const { publicKey, connected } = useWallet();
  const syncPlayer = useGameStore((state) => state.syncPlayer);
  const setWalletAddress = useGameStore((state) => state.setWalletAddress);
  const loadMissions = useGameStore((state) => state.loadMissions);
  const loadLeaderboard = useGameStore((state) => state.loadLeaderboard);

  useEffect(() => {
    void loadMissions();
    void loadLeaderboard();
  }, [loadLeaderboard, loadMissions]);

  useEffect(() => {
    if (connected && publicKey) {
      const walletAddress = publicKey.toBase58();
      setWalletAddress(walletAddress);
      void syncPlayer(walletAddress);
    } else {
      setWalletAddress(null);
    }
  }, [connected, publicKey, setWalletAddress, syncPlayer]);

  if (mode === "play") {
    return <GameShell onExit={() => setMode("home")} />;
  }

  if (mode === "admin") {
    return <AdminPanel onExit={() => setMode("home")} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <AnimatedBackdrop />
      <section className="relative z-10 flex min-h-screen items-center px-5 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="glass rounded-[2rem] p-6 sm:p-10"
          >
            <div className="mb-5 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.32em] text-cyan-100">
              Original low-poly Web3 city sandbox
            </div>
            <h1 className="neon-text text-6xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Grand
              <span className="block text-cyan-200">Theft</span>
              <span className="block text-pink-300">Solana</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-slate-200 sm:text-2xl">
              Complete missions. Build your empire. Earn SOL.
            </p>
            <p className="mt-4 max-w-2xl text-slate-300">
              Cruise a neon coastal city, customize your driver, accept verified missions, and queue SOL rewards through a backend-controlled payout flow.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setMode("play")}
                className="rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-pink-500/30 transition hover:scale-105"
              >
                Play Now
              </button>
              <WalletMultiButton />
              <button
                onClick={() => {
                  setMode("play");
                  useGameStore.getState().togglePhone("leaderboard");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white/20"
              >
                <Trophy className="h-4 w-4" /> Leaderboard
              </button>
              <button
                onClick={() => setMode("admin")}
                className="rounded-full border border-amber-300/30 bg-amber-300/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-300/20"
              >
                Admin Panel
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="glass relative min-h-[560px] overflow-hidden rounded-[2rem] p-6"
          >
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-cyan-400/20 to-transparent" />
            <div className="grid h-full grid-cols-3 gap-3">
              {Array.from({ length: 18 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-t-xl border border-white/10 bg-gradient-to-t from-slate-950 to-slate-700 shadow-lg"
                  style={{
                    height: `${130 + ((index * 43) % 220)}px`,
                    alignSelf: "end",
                    boxShadow: `0 0 38px ${index % 2 ? "rgba(236,72,153,.25)" : "rgba(34,211,238,.22)"}`,
                  }}
                >
                  <div className="grid grid-cols-3 gap-2 p-3">
                    {Array.from({ length: 9 }).map((__, light) => (
                      <span
                        key={light}
                        className={`h-2 rounded-full ${light % 3 === index % 3 ? "bg-yellow-200" : "bg-cyan-300/25"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function AnimatedBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="absolute h-4 w-12 rounded-full bg-gradient-to-r from-pink-400 to-cyan-300 shadow-lg shadow-cyan-300/40"
          style={{
            top: `${15 + index * 9}%`,
            animation: `float-car ${8 + index * 1.2}s linear ${index * -1.4}s infinite`,
          }}
        />
      ))}
      <div
        className="absolute right-[18%] top-[14%] h-8 w-24 rounded-full border border-cyan-200/40 bg-cyan-200/20"
        style={{ animation: "hover-chopper 4.8s ease-in-out infinite" }}
      >
        <span className="absolute left-1/2 top-[-10px] h-1 w-32 -translate-x-1/2 rounded-full bg-white/50" />
        <span className="absolute bottom-[-8px] left-6 h-3 w-14 rounded-full bg-pink-300/60" />
      </div>
      <div className="absolute bottom-[-18rem] left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
    </div>
  );
}
