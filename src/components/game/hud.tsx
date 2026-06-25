"use client";

import { Minimap } from "@/components/game/minimap";
import { ActiveMission, MissionReward, NpcState, Vec2, VehicleState } from "@/lib/types";
import { formatCompact } from "@/lib/utils";

type HudProps = {
  stats: {
    cash: number;
    sol: number;
    xp: number;
    reputation: number;
    wantedLevel: 0 | 1 | 2 | 3 | 4 | 5;
  };
  playerPosition: Vec2;
  mission: ActiveMission | null;
  npcs: NpcState[];
  vehicles: VehicleState[];
  notifications: string[];
  dayTime: number;
  interior: string | null;
  lastReward: MissionReward | null;
  onClearNotifications: () => void;
};

export function Hud({
  stats,
  playerPosition,
  mission,
  npcs,
  vehicles,
  notifications,
  dayTime,
  interior,
  lastReward,
  onClearNotifications,
}: HudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-4 text-white">
      <div className="flex items-start justify-between gap-4">
        <section className="pointer-events-auto max-w-[460px] rounded-2xl border border-white/15 bg-slate-900/65 p-4 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Grand Theft Solana</p>
          <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-sm">
            <p>CASH: ${formatCompact(stats.cash)}</p>
            <p>SOL: {stats.sol.toFixed(4)}</p>
            <p>XP: {formatCompact(stats.xp)}</p>
            <p>REP: {formatCompact(stats.reputation)}</p>
          </div>
          <p className="mt-1 text-xs text-slate-300">
            Time {dayTime.toFixed(1)}h • Position ({playerPosition.x.toFixed(1)}, {playerPosition.z.toFixed(1)})
          </p>
          <p className="mt-1 text-xs text-slate-300">
            Controls: WASD Move • Shift Run/Boost • E Interact • F Vehicle • P Phone • C Crime
          </p>
          {interior && (
            <p className="mt-2 rounded-lg bg-cyan-500/20 px-2 py-1 text-xs text-cyan-200">
              Inside: {interior.replace("_", " ")}
            </p>
          )}
          {mission && (
            <div className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm">
              <p className="font-semibold text-yellow-200">{mission.title}</p>
              <p className="text-xs text-yellow-100/80">{mission.description}</p>
            </div>
          )}
          {lastReward && (
            <div className="mt-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              Reward: +${lastReward.cash} | +{lastReward.xp} XP | +{lastReward.reputation} REP
              {lastReward.sol > 0 ? ` | +${lastReward.sol.toFixed(4)} SOL` : ""}
            </div>
          )}
        </section>

        <div className="flex flex-col items-end gap-3">
          <WantedStars level={stats.wantedLevel} />
          <Minimap
            player={playerPosition}
            missionTarget={mission?.dropoff}
            npcs={npcs}
            vehicles={vehicles}
          />
        </div>
      </div>

      {notifications.length > 0 && (
        <button
          onClick={onClearNotifications}
          className="pointer-events-auto absolute bottom-6 left-1/2 w-[min(92vw,620px)] -translate-x-1/2 rounded-xl border border-cyan-400/30 bg-slate-900/85 px-4 py-3 text-left text-sm backdrop-blur-xl"
          type="button"
        >
          {notifications.map((notification) => (
            <p key={notification}>{notification}</p>
          ))}
        </button>
      )}
    </div>
  );
}

function WantedStars({ level }: { level: 0 | 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="rounded-xl border border-white/20 bg-black/55 px-3 py-2 text-sm backdrop-blur-xl">
      <p className="mb-1 text-xs uppercase tracking-wider text-slate-300">Wanted</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span key={index} className={index < level ? "text-yellow-300" : "text-slate-500"}>
            ★
          </span>
        ))}
      </div>
    </div>
  );
}

