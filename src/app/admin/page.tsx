"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";

type AdminLog = {
  id: string;
  action: string;
  actor: string;
  createdAt?: string;
  created_at?: string;
  payload: Record<string, unknown>;
};

export default function AdminPage() {
  const [token, setToken] = useState<string>("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [status, setStatus] = useState<string>("");
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [missionTitle, setMissionTitle] = useState("Nightline Extraction");
  const [payoutMultiplier, setPayoutMultiplier] = useState("1.4");
  const [banWallet, setBanWallet] = useState("");
  const [rewardId, setRewardId] = useState("");
  const [eventName, setEventName] = useState("Double XP Hour");
  const [economyKey, setEconomyKey] = useState("cashMultiplier");
  const [economyValue, setEconomyValue] = useState("1.1");

  const withAuth = useCallback(async (path: string, init?: RequestInit) => {
    return fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  }, [token]);

  const loadAdminData = useCallback(async () => {
    if (!token) {
      return;
    }
    const res = await withAuth("/api/admin/actions");
    const data = (await res.json()) as { logs?: AdminLog[] };
    setLogs(data.logs ?? []);
  }, [token, withAuth]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const task = window.setTimeout(() => {
      void loadAdminData();
    }, 0);
    return () => window.clearTimeout(task);
  }, [token, loadAdminData]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = (await res.json()) as { token?: string; error?: string };
    if (!res.ok || !data.token) {
      setStatus(data.error ?? "Login failed");
      return;
    }
    setToken(data.token);
    setStatus("Admin logged in.");
  };

  const sendAction = async (action: string, payload: Record<string, unknown>) => {
    const res = await withAuth("/api/admin/actions", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });
    const data = (await res.json()) as { error?: string; ok?: boolean };
    if (!res.ok || !data.ok) {
      setStatus(data.error ?? "Action failed.");
      return;
    }
    setStatus(`Action "${action}" applied.`);
    await loadAdminData();
  };

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-4xl font-black text-transparent">
          GTS Admin Panel
        </h1>
        <p className="mt-2 text-slate-300">
          Manage missions, rewards, bans, economy tuning, and live world events.
        </p>

        {!token && (
          <form
            onSubmit={login}
            className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-3"
          >
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="rounded-lg bg-slate-900/70 px-3 py-2"
              placeholder="Username"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg bg-slate-900/70 px-3 py-2"
              type="password"
              placeholder="Password"
            />
            <button type="submit" className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-900">
              Login
            </button>
          </form>
        )}

        {token && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ActionCard title="Create Mission">
              <input
                value={missionTitle}
                onChange={(event) => setMissionTitle(event.target.value)}
                className="w-full rounded-lg bg-slate-900/70 px-3 py-2"
              />
              <input
                value={payoutMultiplier}
                onChange={(event) => setPayoutMultiplier(event.target.value)}
                className="mt-2 w-full rounded-lg bg-slate-900/70 px-3 py-2"
              />
              <button
                onClick={() =>
                  sendAction("create_mission", {
                    title: missionTitle,
                    payoutMultiplier: Number(payoutMultiplier),
                  })
                }
                className="mt-2 rounded-lg bg-emerald-500 px-3 py-2 font-semibold text-slate-900"
                type="button"
              >
                Create Mission
              </button>
            </ActionCard>

            <ActionCard title="Approve Reward">
              <input
                value={rewardId}
                onChange={(event) => setRewardId(event.target.value)}
                className="w-full rounded-lg bg-slate-900/70 px-3 py-2"
                placeholder="Reward ID"
              />
              <button
                onClick={() => sendAction("approve_reward", { rewardId })}
                className="mt-2 rounded-lg bg-cyan-500 px-3 py-2 font-semibold text-slate-900"
                type="button"
              >
                Approve Reward
              </button>
            </ActionCard>

            <ActionCard title="Ban Player">
              <input
                value={banWallet}
                onChange={(event) => setBanWallet(event.target.value)}
                className="w-full rounded-lg bg-slate-900/70 px-3 py-2"
                placeholder="Wallet Address"
              />
              <button
                onClick={() => sendAction("ban_player", { walletAddress: banWallet })}
                className="mt-2 rounded-lg bg-rose-500 px-3 py-2 font-semibold text-white"
                type="button"
              >
                Ban Player
              </button>
            </ActionCard>

            <ActionCard title="Spawn Event">
              <input
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                className="w-full rounded-lg bg-slate-900/70 px-3 py-2"
              />
              <button
                onClick={() => sendAction("spawn_event", { eventName })}
                className="mt-2 rounded-lg bg-fuchsia-500 px-3 py-2 font-semibold text-white"
                type="button"
              >
                Spawn Event
              </button>
            </ActionCard>

            <ActionCard title="Change Economy">
              <input
                value={economyKey}
                onChange={(event) => setEconomyKey(event.target.value)}
                className="w-full rounded-lg bg-slate-900/70 px-3 py-2"
              />
              <input
                value={economyValue}
                onChange={(event) => setEconomyValue(event.target.value)}
                className="mt-2 w-full rounded-lg bg-slate-900/70 px-3 py-2"
              />
              <button
                onClick={() =>
                  sendAction("change_economy", {
                    [economyKey]: Number(economyValue),
                  })
                }
                className="mt-2 rounded-lg bg-amber-500 px-3 py-2 font-semibold text-slate-900"
                type="button"
              >
                Apply Economy Change
              </button>
            </ActionCard>
          </div>
        )}

        {status && <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm">{status}</p>}

        {token && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <h2 className="mb-3 text-lg font-semibold">Admin Logs</h2>
            <div className="space-y-2 text-sm">
              {logs.length === 0 ? (
                <p className="text-slate-400">No logs yet.</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="rounded-lg bg-slate-900/70 px-3 py-2">
                    <p className="text-xs uppercase text-slate-400">{log.action}</p>
                    <p className="text-xs text-slate-400">{log.created_at ?? log.createdAt}</p>
                    <pre className="overflow-x-auto text-xs text-slate-200">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ActionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 font-semibold text-cyan-200">{title}</h3>
      {children}
    </section>
  );
}

