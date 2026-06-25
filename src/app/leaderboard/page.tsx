"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LeaderboardRow } from "@/lib/types";
import { formatCash, formatSol } from "@/lib/economy";

interface Board {
  topReputation: LeaderboardRow[];
  topCash: LeaderboardRow[];
  topSol: LeaderboardRow[];
  topMissions: LeaderboardRow[];
}

export default function LeaderboardPage() {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((b) => setBoard(b))
      .catch(() => setBoard(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen cyber-grid bg-gts-bg px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="btn-ghost text-sm">← Home</Link>
          <h1 className="display-font text-5xl tracking-wide">
            <span className="neon-text">Leaderboard</span>
          </h1>
          <Link href="/play" className="btn-primary text-sm">Play</Link>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gts-cyan">Loading rankings…</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card title="Top Reputation" accent="#ff2d95" rows={board?.topReputation} fmt={(r) => `${r.reputation} REP`} />
            <Card title="Top SOL Earned" accent="#1be7b6" rows={board?.topSol} fmt={(r) => formatSol(r.solEarned)} />
            <Card title="Top Cash" accent="#ffd23f" rows={board?.topCash} fmt={(r) => formatCash(r.cash)} />
            <Card title="Most Missions" accent="#22e3ff" rows={board?.topMissions} fmt={(r) => `${r.missionsCompleted} jobs`} />
          </div>
        )}
      </div>
    </main>
  );
}

function Card({
  title,
  accent,
  rows,
  fmt,
}: {
  title: string;
  accent: string;
  rows?: LeaderboardRow[];
  fmt: (r: LeaderboardRow) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border p-5"
      style={{ borderColor: `${accent}40` }}
    >
      <h2 className="display-font mb-4 text-2xl tracking-wide" style={{ color: accent }}>{title}</h2>
      {!rows || rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-white/40">
          No ranked players yet. Connect a wallet and complete missions to appear here.
        </div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: i < 3 ? accent : "rgba(255,255,255,0.1)", color: i < 3 ? "#0a0612" : "#fff" }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-white/90">{r.handle}</span>
              </div>
              <span className="font-semibold" style={{ color: accent }}>{fmt(r)}</span>
            </li>
          ))}
        </ol>
      )}
    </motion.div>
  );
}
