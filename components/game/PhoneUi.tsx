"use client";

import { Bell, Car, Map, Settings, Smartphone, Trophy, UserRound, Wallet } from "lucide-react";
import { cityLandmarks, vehicleCatalog } from "@/lib/gameData";
import { characterOptionGroups, useGameStore } from "@/lib/store";
import type { Mission } from "@/lib/types";

const tabs = [
  { id: "map", label: "Map", icon: Map },
  { id: "contacts", label: "Contacts", icon: UserRound },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "missions", label: "Missions", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function PhoneUi() {
  const open = useGameStore((state) => state.phoneOpen);
  const tab = useGameStore((state) => state.phoneTab);
  const setPhoneTab = useGameStore((state) => state.setPhoneTab);
  const togglePhone = useGameStore((state) => state.togglePhone);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="glass flex h-[min(860px,92vh)] w-[min(1120px,96vw)] overflow-hidden rounded-[2rem]">
        <aside className="hidden w-64 border-r border-white/10 bg-white/5 p-4 sm:block">
          <div className="mb-6 flex items-center gap-3 text-xl font-black uppercase tracking-[0.16em] text-white">
            <Smartphone className="h-6 w-6 text-cyan-200" /> GTS Phone
          </div>
          <div className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPhoneTab(id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                  tab === id ? "bg-cyan-300 text-slate-950" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Connected city OS</div>
              <h2 className="text-2xl font-black capitalize text-white">{tab}</h2>
            </div>
            <button onClick={() => togglePhone()} className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20">
              Close
            </button>
          </header>
          <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 sm:hidden">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setPhoneTab(id)}
                className={`rounded-full px-4 py-2 text-xs font-bold ${tab === id ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {tab === "map" && <MapTab />}
            {tab === "contacts" && <ContactsTab />}
            {tab === "leaderboard" && <LeaderboardTab />}
            {tab === "wallet" && <WalletTab />}
            {tab === "missions" && <MissionsTab />}
            {tab === "settings" && <SettingsTab />}
          </div>
        </section>
      </div>
    </div>
  );
}

function MapTab() {
  const position = useGameStore((state) => state.position);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950">
        <div className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 bg-slate-700" />
        <div className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 bg-slate-700" />
        <div className="absolute left-1/4 top-0 h-full w-2 bg-slate-800" />
        <div className="absolute left-0 top-1/4 h-2 w-full bg-slate-800" />
        {cityLandmarks.map((landmark) => (
          <div
            key={landmark.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/40 bg-cyan-300 px-2 py-1 text-[10px] font-black text-slate-950"
            style={{ left: `${((landmark.position[0] + 48) / 96) * 100}%`, top: `${((landmark.position[1] + 48) / 96) * 100}%` }}
          >
            {landmark.kind}
          </div>
        ))}
        <div
          className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400 ring-8 ring-pink-400/20"
          style={{ left: `${((position[0] + 48) / 96) * 100}%`, top: `${((position[1] + 48) / 96) * 100}%` }}
        />
      </div>
      <div className="space-y-3">
        {cityLandmarks.map((landmark) => (
          <div key={landmark.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-black text-white">{landmark.name}</div>
            <div className="text-sm text-slate-300">{landmark.kind} - {landmark.district}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsTab() {
  const missions = useGameStore((state) => state.missions);
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {missions.slice(0, 6).map((mission) => (
        <div key={mission.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">{mission.district} contact</div>
          <h3 className="mt-2 text-xl font-black text-white">{mission.type === "taxi" ? "Mira Dispatch" : mission.type === "race" ? "Jetty Jax" : "Sol Runner"}</h3>
          <p className="mt-2 text-sm text-slate-300">{mission.briefing}</p>
        </div>
      ))}
    </div>
  );
}

function LeaderboardTab() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const loadLeaderboard = useGameStore((state) => state.loadLeaderboard);
  return (
    <div>
      <button onClick={() => void loadLeaderboard()} className="mb-4 rounded-full bg-cyan-300 px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950">
        Refresh
      </button>
      <div className="grid gap-3">
        {(leaderboard.length ? leaderboard : [{ id: "seed", handle: "No verified racers yet", walletAddress: "", reputation: 0, cash: 0, solEarned: 0, missionsCompleted: 0 }]).map((entry, index) => (
          <div key={entry.id} className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-2xl font-black text-cyan-200">#{index + 1}</div>
            <div>
              <div className="font-black text-white">{entry.handle}</div>
              <div className="text-xs text-slate-400">{entry.walletAddress}</div>
            </div>
            <div className="text-right text-sm text-slate-200">
              <div>{entry.reputation} rep</div>
              <div>${entry.cash.toLocaleString()} / {entry.solEarned.toFixed(4)} SOL</div>
              <div>{entry.missionsCompleted} missions</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WalletTab() {
  const player = useGameStore((state) => state.player);
  const walletAddress = useGameStore((state) => state.walletAddress);
  const claimRewards = useGameStore((state) => state.claimRewards);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-6">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Wallet</div>
        <div className="mt-3 break-all text-xl font-black text-white">{walletAddress ?? "Connect Phantom, Backpack, or Solflare"}</div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Balance label="Cash" value={`$${player?.currencies.cash.toLocaleString() ?? 0}`} />
          <Balance label="SOL earned" value={(player?.currencies.sol ?? 0).toFixed(4)} />
          <Balance label="XP" value={player?.currencies.xp.toLocaleString() ?? "0"} />
          <Balance label="Reputation" value={player?.currencies.reputation.toLocaleString() ?? "0"} />
        </div>
        <button onClick={() => void claimRewards()} className="mt-6 rounded-full bg-yellow-300 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950">
          Claim Rewards
        </button>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-pink-200">Transaction history</div>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <p>Mission rewards are first verified by the server.</p>
          <p>SOL payouts remain pending until an admin approves and pays from a server wallet.</p>
          <p>The browser never signs or generates reward payouts.</p>
        </div>
      </div>
    </div>
  );
}

function MissionsTab() {
  const missions = useGameStore((state) => state.missions);
  const activeMission = useGameStore((state) => state.activeMission);
  const startMission = useGameStore((state) => state.startMission);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {missions.map((mission) => (
        <MissionPhoneCard key={mission.id} mission={mission} active={activeMission?.id === mission.id} onStart={() => startMission(mission)} />
      ))}
    </div>
  );
}

function MissionPhoneCard({ mission, active, onStart }: { mission: Mission; active: boolean; onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">{mission.type} / {mission.district}</div>
          <h3 className="mt-2 text-xl font-black text-white">{mission.title}</h3>
        </div>
        {mission.solEligible && <span className="rounded-full bg-yellow-300/20 px-3 py-1 text-xs font-black text-yellow-100">SOL</span>}
      </div>
      <p className="mt-2 text-sm text-slate-300">{mission.objective}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-white/10 px-3 py-1">${mission.rewards.cash}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">{mission.rewards.xp} XP</span>
        <span className="rounded-full bg-white/10 px-3 py-1">{mission.rewards.reputation} rep</span>
      </div>
      <button
        onClick={onStart}
        disabled={active}
        className="mt-4 rounded-full bg-cyan-300 px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950 disabled:opacity-50"
      >
        {active ? "Active" : "Accept Mission"}
      </button>
    </div>
  );
}

function SettingsTab() {
  const player = useGameStore((state) => state.player);
  const customizeCharacter = useGameStore((state) => state.customizeCharacter);
  const spendCash = useGameStore((state) => state.spendCash);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Character customizer</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {(Object.keys(characterOptionGroups) as Array<keyof typeof characterOptionGroups>).map((group) => (
            <label key={group} className="block">
              <span className="text-sm font-bold capitalize text-white">{group}</span>
              <select
                value={player?.character[group] ?? characterOptionGroups[group][0]}
                onChange={(event) => customizeCharacter({ [group]: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 p-3 text-white"
              >
                {characterOptionGroups[group].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs font-bold uppercase tracking-[0.24em] text-pink-200">Garage and upgrades</div>
        <div className="mt-4 space-y-3">
          {vehicleCatalog.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => spendCash(vehicle.price, vehicle.name)}
              className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10"
            >
              <span className="flex items-center gap-3">
                <Car className="h-5 w-5" style={{ color: vehicle.color }} />
                <span>
                  <span className="block font-black text-white">{vehicle.name}</span>
                  <span className="text-xs text-slate-400">Speed {vehicle.speed} / Handling {vehicle.handling}</span>
                </span>
              </span>
              <span className="font-black text-cyan-100">${vehicle.price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Balance({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </div>
  );
}
