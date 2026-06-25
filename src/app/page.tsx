"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CityBackdrop } from "@/components/landing/CityBackdrop";
import { WalletButton } from "@/components/wallet/WalletButton";

const features = [
  { icon: "🎯", title: "Sandbox Missions", body: "Deliveries, races, heists and escorts — randomly generated every session." },
  { icon: "🏙️", title: "Living Neon City", body: "Drive, walk and explore a low-poly Miami with day/night and traffic." },
  { icon: "◎", title: "Earn Real SOL", body: "Verified missions pay micro SOL rewards — backend-verified, never client-side." },
  { icon: "🏆", title: "Climb the Ranks", body: "Reputation, cash and SOL leaderboards across the whole city." },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <CityBackdrop />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌴</span>
          <span className="display-font text-2xl tracking-widest text-white">GTS</span>
        </div>
        <div className="hidden gap-3 md:flex">
          <Link href="/leaderboard" className="btn-ghost text-sm">Leaderboard</Link>
          <Link href="/admin" className="btn-ghost text-sm">Admin</Link>
          <WalletButton variant="ghost" className="text-sm" />
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-3 inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-gts-cyan"
        >
          Original Web3 Open-World • Solana
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, type: "spring", bounce: 0.35 }}
          className="display-font select-none text-6xl leading-[0.9] text-white drop-shadow-[0_4px_30px_rgba(255,45,149,0.5)] sm:text-7xl md:text-[9rem]"
        >
          <span className="block neon-text">GRAND THEFT</span>
          <span className="block bg-gradient-to-r from-gts-cyan via-gts-teal to-gts-gold bg-clip-text text-transparent">
            SOLANA
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 max-w-xl text-lg text-white/85 md:text-xl"
        >
          Complete missions. Build your empire. <span className="text-gts-gold font-semibold">Earn SOL.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Link href="/play" className="btn-primary text-lg shadow-neon">
            ▶ Play Now
          </Link>
          <WalletButton variant="cyan" className="text-lg" />
          <Link href="/leaderboard" className="btn-ghost text-lg">🏆 Leaderboard</Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-6 text-xs text-white/60"
        >
          No install required • Runs in your browser • Connect Phantom, Backpack or Solflare
        </motion.p>
      </section>

      {/* Feature strip */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass rounded-2xl p-5 text-left hover:bg-white/10 transition"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="display-font text-xl tracking-wide text-white">{f.title}</h3>
              <p className="mt-1 text-sm text-white/70">{f.body}</p>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-white/50">
          GTS is an original game. It is not affiliated with, endorsed by, or derived from any
          existing game franchise. All assets, branding, and code are original.
        </p>
      </section>
    </main>
  );
}
