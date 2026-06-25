"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGame, type PhoneTab } from "@/lib/store";
import { WalletPanel } from "./WalletPanel";
import { MiniMap } from "./MiniMap";
import { formatCash, formatSol } from "@/lib/economy";
import type { LeaderboardRow, Mission } from "@/lib/types";

const TABS: { id: PhoneTab; label: string; icon: string }[] = [
  { id: "missions", label: "Jobs", icon: "🎯" },
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "contacts", label: "Contacts", icon: "👥" },
  { id: "leaderboard", label: "Ranks", icon: "🏆" },
  { id: "wallet", label: "Wallet", icon: "👛" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function Phone() {
  const open = useGame((s) => s.phoneOpen);
  const tab = useGame((s) => s.phoneTab);
  const setTab = useGame((s) => s.setPhoneTab);
  const close = useGame((s) => s.togglePhone);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => close(false)}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[640px] max-h-[92vh] w-[380px] max-w-[94vw] flex-col overflow-hidden rounded-[36px] border-4 border-black/60 bg-gts-panel shadow-neon"
          >
            {/* Notch */}
            <div className="absolute left-1/2 top-1.5 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-black/70" />
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-2 pt-5">
              <span className="display-font text-xl tracking-widest text-gts-cyan">GTS OS</span>
              <button onClick={() => close(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden px-4">
              <div className="h-full overflow-y-auto pb-2">
                {tab === "missions" && <MissionsTab />}
                {tab === "map" && <MapTab />}
                {tab === "contacts" && <ContactsTab />}
                {tab === "leaderboard" && <LeaderboardTab />}
                {tab === "wallet" && <WalletPanel />}
                {tab === "settings" && <SettingsTab />}
              </div>
            </div>

            {/* Tab bar */}
            <div className="grid grid-cols-6 gap-1 border-t border-white/10 bg-black/30 px-2 py-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex flex-col items-center rounded-lg py-1 text-[9px] ${
                    tab === t.id ? "bg-white/10 text-gts-cyan" : "text-white/50"
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MissionCard({ m }: { m: Mission }) {
  const accept = useGame((s) => s.acceptMission);
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-white">{m.title}</div>
          <div className="text-[10px] uppercase tracking-wide text-gts-cyan">{m.giver}</div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < m.difficulty ? "text-gts-pink" : "text-white/15"}>◆</span>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-white/60">{m.description}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        <span className="rounded bg-gts-gold/15 px-1.5 py-0.5 text-gts-gold">{formatCash(m.reward.cash)}</span>
        <span className="rounded bg-gts-cyan/15 px-1.5 py-0.5 text-gts-cyan">{m.reward.xp} XP</span>
        <span className="rounded bg-gts-pink/15 px-1.5 py-0.5 text-gts-pink">{m.reward.reputation} REP</span>
        {m.reward.sol > 0 && (
          <span className="rounded bg-gts-teal/15 px-1.5 py-0.5 text-gts-teal">◎ {m.reward.sol} SOL</span>
        )}
      </div>
      <button onClick={() => accept(m.id)} className="btn-primary mt-3 w-full py-2 text-sm">
        Accept Job
      </button>
    </div>
  );
}

function MissionsTab() {
  const available = useGame((s) => s.available);
  const active = useGame((s) => s.active);
  const refresh = useGame((s) => s.refreshMissions);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="display-font text-2xl tracking-wide">Job Board</h3>
        <button onClick={refresh} className="btn-ghost px-3 py-1.5 text-xs">↻ Refresh</button>
      </div>
      {active && (
        <div className="rounded-xl border border-gts-cyan/40 bg-gts-cyan/10 p-3 text-xs text-gts-cyan">
          Active: <b>{active.mission.title}</b>. Finish or abandon it before taking another job.
        </div>
      )}
      {available.map((m) => (
        <MissionCard key={m.id} m={m} />
      ))}
    </div>
  );
}

function MapTab() {
  return (
    <div className="space-y-3">
      <h3 className="display-font text-2xl tracking-wide">City Map</h3>
      <div className="flex justify-center rounded-2xl bg-black/40 p-3">
        <MiniMap size={300} full />
      </div>
      <p className="text-center text-xs text-white/50">
        🟡 vehicles • 🔴 police • dots are landmarks. Your position is the pink arrow.
      </p>
    </div>
  );
}

const CONTACTS = [
  { name: "Tony 'Ledger' Marquez", role: "Fixer", tip: "Always has delivery work." },
  { name: "DJ Solstice", role: "Promoter", tip: "Runs the street races." },
  { name: "Captain Mireles", role: "Harbor Boss", tip: "Pays well, asks little." },
  { name: "Anonymous Whale", role: "???", tip: "Big SOL bounties on lost wallets." },
  { name: "Mama Rosa", role: "Community", tip: "Protect-the-neighbour jobs." },
  { name: "The Validator", role: "Oracle", tip: "Verifies your on-chain rewards." },
];

function ContactsTab() {
  const setTab = useGame((s) => s.setPhoneTab);
  return (
    <div className="space-y-3">
      <h3 className="display-font text-2xl tracking-wide">Contacts</h3>
      {CONTACTS.map((c) => (
        <div key={c.name} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gts-cyan to-gts-purple font-bold">
            {c.name.slice(0, 1)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{c.name}</div>
            <div className="text-[10px] uppercase tracking-wide text-gts-cyan">{c.role}</div>
            <div className="text-xs text-white/50">{c.tip}</div>
          </div>
        </div>
      ))}
      <button onClick={() => setTab("missions")} className="btn-ghost w-full text-sm">View available jobs →</button>
    </div>
  );
}

function LeaderboardTab() {
  const [board, setBoard] = useState<{ topReputation: LeaderboardRow[]; topSol: LeaderboardRow[] } | null>(null);
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setBoard)
      .catch(() => setBoard(null));
  }, []);
  return (
    <div className="space-y-3">
      <h3 className="display-font text-2xl tracking-wide">Leaderboard</h3>
      <BoardList title="Top Reputation" rows={board?.topReputation} value={(r) => `${r.reputation} REP`} />
      <BoardList title="Top SOL Earned" rows={board?.topSol} value={(r) => formatSol(r.solEarned)} />
      <Link href="/leaderboard" className="btn-ghost w-full text-sm">Open full leaderboard →</Link>
    </div>
  );
}

function BoardList({ title, rows, value }: { title: string; rows?: LeaderboardRow[]; value: (r: LeaderboardRow) => string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-gts-cyan">{title}</div>
      {!rows || rows.length === 0 ? (
        <div className="text-xs text-white/40">No players yet — be the first!</div>
      ) : (
        rows.slice(0, 5).map((r, i) => (
          <div key={i} className="flex items-center justify-between py-1 text-xs">
            <span className="text-white/80">#{i + 1} {r.handle}</span>
            <span className="text-gts-gold">{value(r)}</span>
          </div>
        ))
      )}
    </div>
  );
}

function SettingsTab() {
  const profile = useGame((s) => s.profile);
  const setProfile = useGame((s) => s.setProfile);
  const toggleCharacter = useGame((s) => s.toggleCharacterCreator);
  const notify = useGame((s) => s.notify);
  const [name, setName] = useState(profile.handle);

  return (
    <div className="space-y-4">
      <h3 className="display-font text-2xl tracking-wide">Settings</h3>
      <div>
        <label className="text-[10px] uppercase tracking-widest text-white/50">Display name</label>
        <div className="mt-1 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gts-cyan"
          />
          <button
            onClick={() => {
              setProfile({ handle: name.trim() || profile.handle });
              notify({ title: "Name saved", kind: "success" });
            }}
            className="btn-cyan px-3 text-sm"
          >
            Save
          </button>
        </div>
      </div>

      <button onClick={() => toggleCharacter(true)} className="btn-ghost w-full text-sm">🧑‍🎤 Customize Character</button>

      <Link href="/admin" className="btn-ghost block w-full text-center text-sm">🛡️ Admin Panel</Link>

      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.reload();
          }
        }}
        className="w-full rounded-lg border border-gts-pink/40 py-2 text-sm text-gts-pink hover:bg-gts-pink/10"
      >
        Reset Local Progress
      </button>

      <p className="text-center text-[10px] text-white/40">
        Grand Theft Solana — original Web3 sandbox. v0.1.0
      </p>
    </div>
  );
}
