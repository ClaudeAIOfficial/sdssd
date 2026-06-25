"use client";

import { motion } from "framer-motion";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

type LandingPageProps = {
  onPlay: () => void;
  onOpenLeaderboard: () => void;
};

export function LandingPage({ onPlay, onOpenLeaderboard }: LandingPageProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040712] px-6 py-16">
      <AnimatedCityBackdrop />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl shadow-cyan-600/10 backdrop-blur-xl md:p-14"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.45em] text-cyan-300/90">Indie Web3 Sandbox</p>
        <h1 className="text-balance bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-emerald-300 bg-clip-text text-4xl font-black uppercase tracking-wide text-transparent md:text-7xl">
          Grand Theft Solana
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-200 md:text-xl">
          Complete missions. Build your empire. Earn SOL.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <button
            onClick={onPlay}
            className="rounded-xl bg-cyan-400 px-5 py-3 text-lg font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-cyan-300"
            type="button"
          >
            Play Now
          </button>

          <WalletMultiButton className="!h-auto !rounded-xl !bg-fuchsia-500 !px-5 !py-3 !text-lg !font-semibold !text-white hover:!bg-fuchsia-400" />

          <button
            onClick={onOpenLeaderboard}
            className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            type="button"
          >
            Leaderboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedCityBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.28),transparent_35%),radial-gradient(circle_at_80%_65%,rgba(236,72,153,0.26),transparent_32%),radial-gradient(circle_at_40%_80%,rgba(59,130,246,0.22),transparent_36%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute left-[-20%] top-20 h-4 w-44 animate-[drive_18s_linear_infinite] rounded-full bg-cyan-300/80 blur-[1px]" />
      <div className="absolute left-[-35%] top-36 h-4 w-36 animate-[drive_13s_linear_infinite] rounded-full bg-fuchsia-300/70 blur-[1px]" />
      <div className="absolute left-[-25%] top-52 h-4 w-40 animate-[drive_20s_linear_infinite] rounded-full bg-emerald-300/70 blur-[1px]" />

      <div className="absolute left-[-10%] top-14 h-2 w-16 animate-[fly_10s_linear_infinite] rounded-full bg-white/80 blur-[1px]" />
      <div className="absolute inset-x-0 bottom-0 grid h-56 grid-cols-12 gap-2 px-4">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="rounded-t-md bg-gradient-to-t from-slate-900 via-slate-700/70 to-slate-500/40 opacity-80"
            style={{
              height: `${24 + (index % 6) * 14}px`,
              transform: `translateY(${index % 2 === 0 ? 12 : 0}px)`,
            }}
          />
        ))}
      </div>
    </>
  );
}

