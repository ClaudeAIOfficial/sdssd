"use client";

import { ArrowLeft, Ban, CheckCircle2, Rocket, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { AdminLog, Mission, Player, RewardRecord } from "@/lib/types";

type AdminSnapshot = {
  players: Player[];
  rewards: RewardRecord[];
  logs: AdminLog[];
  economy: { cashMultiplier: number; solEnabled: boolean };
  missions: Mission[];
};

const emptySnapshot: AdminSnapshot = {
  players: [],
  rewards: [],
  logs: [],
  economy: { cashMultiplier: 1, solEnabled: true },
  missions: [],
};

export function AdminPanel({ onExit }: { onExit: () => void }) {
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [adminKey, setAdminKey] = useState("");
  const [cashMultiplier, setCashMultiplier] = useState(1);
  const [solEnabled, setSolEnabled] = useState(true);
  const [message, setMessage] = useState("Local admin mode is open unless ADMIN_API_KEY is configured.");

  const loadSnapshot = useCallback(async () => {
    const response = await fetch("/api/admin", { headers: adminKey ? { "x-admin-key": adminKey } : undefined });
    if (!response.ok) {
      setMessage("Admin key rejected.");
      return;
    }
    const data = (await response.json()) as AdminSnapshot;
    setSnapshot(data);
    setCashMultiplier(data.economy.cashMultiplier);
    setSolEnabled(data.economy.solEnabled);
  }, [adminKey]);

  async function runAction(payload: Record<string, unknown>) {
    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "content-type": "application/json", ...(adminKey ? { "x-admin-key": adminKey } : {}) },
      body: JSON.stringify({ actor: "cloud-admin", ...payload }),
    });
    const data = await response.json();
    setMessage(response.ok ? "Admin action applied." : data.error ?? "Admin action failed.");
    await loadSnapshot();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSnapshot();
  }, [loadSnapshot]);

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl">
        <button onClick={onExit} className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-bold hover:bg-white/20">
          <ArrowLeft className="h-4 w-4" /> Back to city
        </button>

        <header className="glass rounded-[2rem] p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Admin Control Room</div>
          <h1 className="mt-2 text-4xl font-black uppercase text-white sm:text-6xl">Grand Theft Solana Ops</h1>
          <p className="mt-3 max-w-3xl text-slate-300">
            Manage mission rewards, player bans, live events, and economy controls. SOL rewards are approved here and remain server-side.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="ADMIN_API_KEY, if configured"
              className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
            />
            <button onClick={() => void loadSnapshot()} className="rounded-2xl bg-cyan-300 px-5 py-3 font-black uppercase tracking-[0.16em] text-slate-950">
              Load
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-300">{message}</p>
        </header>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-6">
            <Panel title="Pending rewards">
              {snapshot.rewards.length === 0 ? (
                <Empty text="No rewards have been generated in this server session yet." />
              ) : (
                <div className="space-y-3">
                  {snapshot.rewards.map((reward) => (
                    <div key={reward.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-black text-white">{reward.missionId}</div>
                          <div className="text-sm text-slate-400">${reward.cash} / {reward.sol} SOL / {reward.status}</div>
                        </div>
                        <button
                          onClick={() => runAction({ type: "approveReward", rewardId: reward.id })}
                          disabled={reward.status !== "pending"}
                          className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-40"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Players">
              {snapshot.players.length === 0 ? (
                <Empty text="Players appear here after a wallet connects." />
              ) : (
                <div className="grid gap-3">
                  {snapshot.players.map((player) => (
                    <div key={player.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div>
                        <div className="font-black text-white">{player.handle}</div>
                        <div className="text-sm text-slate-400">{player.walletAddress}</div>
                        <div className="text-xs text-slate-500">{player.missionsCompleted} missions / {player.currencies.reputation} rep</div>
                      </div>
                      <button
                        onClick={() => runAction({ type: "banPlayer", playerId: player.id, banned: !player.banned })}
                        className="inline-flex items-center gap-2 rounded-full bg-red-300 px-4 py-2 text-sm font-black text-slate-950"
                      >
                        <Ban className="h-4 w-4" /> {player.banned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Economy">
              <label className="block">
                <span className="text-sm font-bold text-slate-200">Cash multiplier</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.25"
                  max="3"
                  value={cashMultiplier}
                  onChange={(event) => setCashMultiplier(Number(event.target.value))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
                />
              </label>
              <label className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-200">
                <input type="checkbox" checked={solEnabled} onChange={(event) => setSolEnabled(event.target.checked)} />
                SOL rewards enabled
              </label>
              <button
                onClick={() => runAction({ type: "changeEconomy", cashMultiplier, solEnabled })}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950"
              >
                <Save className="h-4 w-4" /> Save Economy
              </button>
            </Panel>

            <Panel title="Live events">
              <div className="grid gap-3 sm:grid-cols-2">
                {["Beach Airdrop", "Harbor Street Race", "Casino VIP Escort", "Warehouse Raid"].map((name) => (
                  <button
                    key={name}
                    onClick={() => runAction({ type: "spawnEvent", name, district: name.split(" ")[0] })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 font-black hover:bg-white/10"
                  >
                    <Rocket className="h-4 w-4 text-amber-200" /> {name}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Mission builder">
              <p className="mb-4 text-sm text-slate-300">
                Create a verified courier mission from SolTrust Bank to Ledger Harbor with server-enforced timing and distance rules.
              </p>
              <button
                onClick={() =>
                  runAction({
                    type: "createMission",
                    mission: {
                      id: "admin-draft",
                      title: "Admin Courier Surge",
                      type: "delivery",
                      district: "Downtown",
                      briefing: "An admin-spawned courier job is live for connected players.",
                      objective: "Carry the sealed package from SolTrust Bank to Ledger Harbor.",
                      start: [8, 10],
                      target: [34, -28],
                      minSeconds: 16,
                      maxSeconds: 170,
                      requiredDistance: 42,
                      rewards: { cash: 760, sol: 0.0025, xp: 120, reputation: 17 },
                      solEligible: true,
                      status: "available",
                    },
                  })
                }
                className="inline-flex items-center gap-2 rounded-full bg-pink-300 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-slate-950"
              >
                <Save className="h-4 w-4" /> Create Mission
              </button>
            </Panel>

            <Panel title="Admin logs">
              {snapshot.logs.length === 0 ? (
                <Empty text="Admin actions are recorded here." />
              ) : (
                <div className="space-y-3">
                  {snapshot.logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="font-black text-white">{log.action}</div>
                      <div className="text-sm text-slate-300">{log.details}</div>
                      <div className="text-xs text-slate-500">{log.createdAt} by {log.actor}</div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </section>
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-[2rem] p-5">
      <h2 className="mb-4 text-2xl font-black text-white">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-300">{text}</div>;
}
