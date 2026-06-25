"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import type { AdminLog, LeaderboardRow, RewardRecord } from "@/lib/types";

interface Dashboard {
  pending: RewardRecord[];
  logs: AdminLog[];
  board: { topReputation: LeaderboardRow[] };
  economy: { cashMultiplier: number; solMultiplier: number };
}

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [banId, setBanId] = useState("");
  const [eventName, setEventName] = useState("Neon Surge");

  const call = useCallback(
    async (action: string, extra: Record<string, unknown> = {}) => {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass, action, ...extra }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Request failed");
      }
      return res.json();
    },
    [pass],
  );

  const refresh = useCallback(async () => {
    try {
      const d = await call("dashboard");
      setData(d);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [call]);

  const login = async () => {
    setError(null);
    try {
      await call("login");
      setAuthed(true);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center cyber-grid bg-gts-bg px-6">
        <div className="glass-strong w-[min(94vw,420px)] rounded-3xl border border-white/10 p-8">
          <h1 className="display-font text-4xl tracking-wide text-gts-cyan">Admin Access</h1>
          <p className="mt-2 text-sm text-white/60">Restricted control room. Enter the admin passphrase.</p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Passphrase"
            className="mt-5 w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-gts-cyan"
          />
          {error && <div className="mt-2 text-sm text-gts-pink">{error}</div>}
          <button onClick={login} className="btn-primary mt-4 w-full">Enter</button>
          <p className="mt-3 text-center text-[11px] text-white/40">
            Default dev passphrase: <code className="text-white/70">gts-admin</code> (set <code>ADMIN_PASSWORD</code> to change)
          </p>
          <Link href="/" className="mt-3 block text-center text-xs text-white/40 hover:text-white">← Home</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen cyber-grid bg-gts-bg px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="display-font text-4xl tracking-wide text-gts-cyan">GTS Control Room</h1>
          <div className="flex gap-2">
            <button onClick={refresh} className="btn-ghost text-sm">↻ Refresh</button>
            <Link href="/" className="btn-ghost text-sm">Home</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending rewards */}
          <Panel title="Pending SOL Rewards">
            {!data?.pending.length ? (
              <Empty text="No rewards awaiting approval." />
            ) : (
              <div className="space-y-2">
                {data.pending.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                    <div>
                      <div className="text-gts-teal">◎ {r.sol} SOL</div>
                      <div className="text-[10px] text-white/40">{r.playerId.slice(0, 12)}…</div>
                    </div>
                    <div className="flex gap-1">
                      <Mini onClick={() => call("approve_reward", { rewardId: r.id }).then(refresh)} color="#1be7b6">Approve</Mini>
                      <Mini onClick={() => call("reject_reward", { rewardId: r.id }).then(refresh)} color="#ff2d95">Reject</Mini>
                      <Mini onClick={() => call("mark_paid", { rewardId: r.id, signature: "manual" }).then(refresh)} color="#22e3ff">Paid</Mini>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Economy + tools */}
          <Panel title="Economy & Events">
            <div className="space-y-3">
              <EconControl
                label="Cash multiplier"
                value={data?.economy.cashMultiplier ?? 1}
                onSet={(v) => call("set_economy", { cashMultiplier: v }).then(refresh)}
              />
              <EconControl
                label="SOL multiplier"
                value={data?.economy.solMultiplier ?? 1}
                onSet={(v) => call("set_economy", { solMultiplier: v }).then(refresh)}
              />
              <div className="flex gap-2">
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gts-cyan"
                />
                <button onClick={() => call("spawn_event", { event: eventName }).then(refresh)} className="btn-cyan text-sm">Spawn Event</button>
              </div>
              <button onClick={() => call("create_missions", { count: 6 }).then(refresh)} className="btn-ghost w-full text-sm">
                Generate 6 Missions
              </button>
              <div className="flex gap-2">
                <input
                  value={banId}
                  onChange={(e) => setBanId(e.target.value)}
                  placeholder="player id"
                  className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gts-pink"
                />
                <button onClick={() => call("ban_player", { playerId: banId }).then(refresh)} className="rounded-lg border border-gts-pink/50 px-3 text-sm text-gts-pink">Ban</button>
                <button onClick={() => call("unban_player", { playerId: banId }).then(refresh)} className="rounded-lg border border-gts-teal/50 px-3 text-sm text-gts-teal">Unban</button>
              </div>
            </div>
          </Panel>

          {/* Top players */}
          <Panel title="Top Players">
            {!data?.board.topReputation.length ? (
              <Empty text="No players yet." />
            ) : (
              <ol className="space-y-1 text-sm">
                {data.board.topReputation.map((r, i) => (
                  <li key={i} className="flex justify-between rounded bg-white/5 px-3 py-1.5">
                    <span>#{i + 1} {r.handle}</span>
                    <span className="text-gts-gold">{r.reputation} REP</span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          {/* Logs */}
          <Panel title="Admin Logs">
            {!data?.logs.length ? (
              <Empty text="No activity logged yet." />
            ) : (
              <div className="max-h-72 space-y-1 overflow-y-auto text-xs">
                {data.logs.map((l) => (
                  <div key={l.id} className="rounded bg-white/5 px-3 py-1.5">
                    <span className="text-gts-cyan">{l.action}</span>{" "}
                    <span className="text-white/60">{l.detail}</span>
                    <div className="text-[10px] text-white/30">{new Date(l.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-5">
      <h2 className="display-font mb-3 text-2xl tracking-wide text-white">{title}</h2>
      {children}
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return <div className="py-6 text-center text-sm text-white/40">{text}</div>;
}
function Mini({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return (
    <button onClick={onClick} className="rounded px-2 py-1 text-[11px] font-semibold" style={{ background: `${color}22`, color }}>
      {children}
    </button>
  );
}
function EconControl({ label, value, onSet }: { label: string; value: number; onSet: (v: number) => void }) {
  const [v, setV] = useState(value);
  return (
    <div className="flex items-center gap-2">
      <span className="flex-1 text-sm text-white/70">{label}</span>
      <input
        type="number"
        step="0.1"
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="w-20 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-sm outline-none focus:border-gts-cyan"
      />
      <button onClick={() => onSet(v)} className="btn-cyan px-3 py-1 text-xs">Set</button>
    </div>
  );
}
