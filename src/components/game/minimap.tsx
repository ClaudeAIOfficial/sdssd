"use client";

import { MINIMAP_SIZE, POI_LOCATIONS } from "@/lib/constants";
import { NpcState, Vec2, VehicleState } from "@/lib/types";

type MinimapProps = {
  player: Vec2;
  missionTarget?: Vec2;
  npcs: NpcState[];
  vehicles: VehicleState[];
};

const project = (value: Vec2) => ({
  left: `${((value.x + 120) / 240) * 100}%`,
  top: `${((value.z + 120) / 240) * 100}%`,
});

export function Minimap({ player, missionTarget, npcs, vehicles }: MinimapProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/55 shadow-xl backdrop-blur-xl"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
      {Object.entries(POI_LOCATIONS).map(([name, loc]) => (
        <span
          key={name}
          title={name}
          className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/80"
          style={project(loc)}
        />
      ))}

      {vehicles.slice(0, 8).map((vehicle) => (
        <span
          key={vehicle.id}
          className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-300/80"
          style={project(vehicle.position)}
        />
      ))}

      {npcs.slice(0, 20).map((npc) => (
        <span
          key={npc.id}
          className="absolute h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/70"
          style={project(npc.position)}
        />
      ))}

      {missionTarget && (
        <span
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-200 bg-yellow-300/90 shadow-[0_0_16px_rgba(253,224,71,0.8)]"
          style={project(missionTarget)}
        />
      )}

      <span
        className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-900 bg-cyan-300"
        style={project(player)}
      />
    </div>
  );
}

