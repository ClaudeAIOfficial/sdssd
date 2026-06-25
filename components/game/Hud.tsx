"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ArrowLeft, Car, MapPin, Phone, Shield, Star, Trophy, Wallet } from "lucide-react";
import { cityLandmarks, vehicleCatalog } from "@/lib/gameData";
import { useGameStore } from "@/lib/store";
import type { Mission } from "@/lib/types";

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function Hud({ onExit }: { onExit: () => void }) {
  const player = useGameStore((state) => state.player);
  const position = useGameStore((state) => state.position);
  const activeMission = useGameStore((state) => state.activeMission);
  const missions = useGameStore((state) => state.missions);
  const startMission = useGameStore((state) => state.startMission);
  const completeMission = useGameStore((state) => state.completeMission);
  const enterVehicle = useGameStore((state) => state.enterVehicle);
  const isDriving = useGameStore((state) => state.isDriving);
  const currentVehicle = useGameStore((state) => state.currentVehicle);
  const togglePhone = useGameStore((state) => state.togglePhone);
  const notifications = useGameStore((state) => state.notifications);
  const dayPhase = useGameStore((state) => state.dayPhase);

  const nearbyMission = missions.find((mission) => distance(position, mission.start) < 11);
  const nearestLandmark = cityLandmarks
    .map((landmark) => ({ ...landmark, distance: distance(position, landmark.position) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const finishReady = activeMission ? distance(position, activeMission.target) < 10 : false;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto glass rounded-2xl p-3 sm:p-4">
          <button onClick={onExit} className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-200 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> City menu
          </button>
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <Stat label="Cash" value={`$${player?.currencies.cash.toLocaleString() ?? "0"}`} />
            <Stat label="SOL" value={(player?.currencies.sol ?? 0).toFixed(4)} />
            <Stat label="XP" value={player?.currencies.xp.toLocaleString() ?? "0"} />
            <Stat label="Rep" value={player?.currencies.reputation.toLocaleString() ?? "0"} />
          </div>
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={`h-4 w-4 ${index < (player?.wantedStars ?? 0) ? "fill-amber-300 text-amber-300" : "text-white/25"}`} />
            ))}
            <span className="ml-2 text-xs uppercase tracking-[0.2em] text-slate-300">Wanted</span>
          </div>
        </div>

        <div className="pointer-events-auto flex flex-col items-end gap-3">
          <WalletMultiButton />
          <button
            onClick={() => togglePhone()}
            className="rounded-full border border-cyan-300/30 bg-cyan-300/15 p-3 text-cyan-100 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300/25"
            title="Open phone (P)"
          >
            <Phone className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="absolute bottom-4 left-3 right-3 flex flex-col gap-3 sm:left-5 sm:right-auto sm:w-[420px]">
        {activeMission ? (
          <MissionCard mission={activeMission} finishReady={finishReady} onComplete={completeMission} />
        ) : nearbyMission ? (
          <MissionOffer mission={nearbyMission} onStart={() => startMission(nearbyMission)} />
        ) : (
          <div className="pointer-events-auto glass rounded-2xl p-4 text-sm text-slate-200">
            <div className="flex items-center gap-2 font-bold text-white">
              <MapPin className="h-4 w-4 text-cyan-200" /> {nearestLandmark?.name ?? "Open City"}
            </div>
            <p className="mt-1 text-slate-300">Move with WASD or arrows. Run with Shift. Press P for phone, Q to exit vehicles.</p>
          </div>
        )}

        <div className="pointer-events-auto glass grid grid-cols-2 gap-2 rounded-2xl p-3 text-xs sm:grid-cols-4">
          <button
            onClick={() => enterVehicle(isDriving ? null : vehicleCatalog[0])}
            className="rounded-xl bg-white/10 p-3 font-bold text-white transition hover:bg-white/20"
          >
            <Car className="mx-auto mb-1 h-4 w-4" /> {isDriving ? "Exit" : "Drive"}
          </button>
          <button onClick={() => togglePhone("map")} className="rounded-xl bg-white/10 p-3 font-bold text-white transition hover:bg-white/20">
            <MapPin className="mx-auto mb-1 h-4 w-4" /> Map
          </button>
          <button onClick={() => togglePhone("wallet")} className="rounded-xl bg-white/10 p-3 font-bold text-white transition hover:bg-white/20">
            <Wallet className="mx-auto mb-1 h-4 w-4" /> Wallet
          </button>
          <button onClick={() => togglePhone("leaderboard")} className="rounded-xl bg-white/10 p-3 font-bold text-white transition hover:bg-white/20">
            <Trophy className="mx-auto mb-1 h-4 w-4" /> Board
          </button>
        </div>
      </div>

      <div className="absolute right-3 top-28 w-72 space-y-2 sm:right-5">
        <MiniMap />
        <div className="glass rounded-2xl p-3 text-xs text-slate-300">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-bold uppercase tracking-[0.18em] text-white">City Clock</span>
            <span>{Math.floor(dayPhase * 24).toString().padStart(2, "0")}:00</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-300 to-amber-300" style={{ width: `${dayPhase * 100}%` }} />
          </div>
          <p className="mt-2">Vehicle: {currentVehicle?.name ?? "On foot"}</p>
        </div>
      </div>

      <div className="absolute left-1/2 top-4 w-[min(92vw,520px)] -translate-x-1/2 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`glass pointer-events-auto rounded-2xl px-4 py-3 text-sm font-semibold ${
              notification.tone === "danger"
                ? "text-red-100"
                : notification.tone === "warning"
                  ? "text-amber-100"
                  : notification.tone === "success"
                    ? "text-emerald-100"
                    : "text-cyan-100"
            }`}
          >
            {notification.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/10 p-2">
      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="text-sm font-black text-white">{value}</div>
    </div>
  );
}

function MissionOffer({ mission, onStart }: { mission: Mission; onStart: () => void }) {
  return (
    <div className="pointer-events-auto glass rounded-2xl p-4">
      <div className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">NPC Mission Contact</div>
      <h3 className="mt-1 text-xl font-black text-white">{mission.title}</h3>
      <p className="mt-1 text-sm text-slate-300">{mission.briefing}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-200">
        <span className="rounded-full bg-white/10 px-3 py-1">${mission.rewards.cash}</span>
        <span className="rounded-full bg-white/10 px-3 py-1">+{mission.rewards.reputation} rep</span>
        {mission.solEligible && <span className="rounded-full bg-yellow-300/15 px-3 py-1 text-yellow-100">{mission.rewards.sol} SOL pending</span>}
      </div>
      <button onClick={onStart} className="mt-4 rounded-full bg-cyan-300 px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950">
        Accept Job
      </button>
    </div>
  );
}

function MissionCard({ mission, finishReady, onComplete }: { mission: Mission; finishReady: boolean; onComplete: () => void }) {
  return (
    <div className="pointer-events-auto glass rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-pink-200">Active Mission</div>
          <h3 className="mt-1 text-xl font-black text-white">{mission.title}</h3>
        </div>
        <Shield className="h-6 w-6 text-amber-200" />
      </div>
      <p className="mt-2 text-sm text-slate-300">{mission.objective}</p>
      <button
        onClick={onComplete}
        disabled={!finishReady}
        className="mt-4 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 px-5 py-2 text-sm font-black uppercase tracking-[0.18em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {finishReady ? "Verify Completion" : "Reach Marker"}
      </button>
    </div>
  );
}

function MiniMap() {
  const position = useGameStore((state) => state.position);
  const activeMission = useGameStore((state) => state.activeMission);
  return (
    <div className="pointer-events-auto glass h-72 rounded-2xl p-3">
      <div className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Mini-map</div>
      <div className="relative h-[228px] overflow-hidden rounded-xl border border-white/10 bg-slate-950/70">
        <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-slate-600/60" />
        <div className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 bg-slate-600/60" />
        {cityLandmarks.map((landmark) => (
          <span
            key={landmark.id}
            title={landmark.name}
            className="absolute h-2 w-2 rounded-full bg-cyan-200"
            style={{ left: `${((landmark.position[0] + 48) / 96) * 100}%`, top: `${((landmark.position[1] + 48) / 96) * 100}%` }}
          />
        ))}
        {activeMission && (
          <span
            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-yellow-100 bg-yellow-300 shadow-lg shadow-yellow-300/50"
            style={{ left: `${((activeMission.target[0] + 48) / 96) * 100}%`, top: `${((activeMission.target[1] + 48) / 96) * 100}%` }}
          />
        )}
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-400 ring-4 ring-pink-400/30"
          style={{ left: `${((position[0] + 48) / 96) * 100}%`, top: `${((position[1] + 48) / 96) * 100}%` }}
        />
      </div>
    </div>
  );
}
