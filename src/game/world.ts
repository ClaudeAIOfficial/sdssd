import { WORLD, PLAYER, VEHICLE, POLICE, type VehicleKind } from "@/lib/constants";
import { buildCity, isOnRoad, type BuildingBox } from "./cityLayout";

export interface Vehicle {
  id: number;
  kind: VehicleKind;
  x: number;
  z: number;
  heading: number;
  speed: number;
  color: string;
  drivable: boolean;
  // AI traffic direction (radians), used when not player-driven.
  aiHeading: number;
  turnCooldown: number;
}

export interface Npc {
  id: number;
  x: number;
  z: number;
  heading: number;
  vx: number;
  vz: number;
  color: string;
  shirt: string;
  retargetIn: number;
  spooked: number;
}

export interface Police {
  id: number;
  x: number;
  z: number;
  heading: number;
  speed: number;
}

export interface Input {
  forward: number; // -1..1
  strafe: number; // -1..1
  run: boolean;
}

export interface WorldState {
  buildings: BuildingBox[];
  colliders: BuildingBox[];
  player: {
    x: number;
    z: number;
    vx: number;
    vz: number;
    heading: number;
    drivingId: number | null;
    speed: number;
  };
  vehicles: Vehicle[];
  npcs: Npc[];
  police: Police[];
  wanted: number;
  heat: number;
  coolTimer: number;
  input: Input;
  // edge-triggered action flags consumed by the loop
  wantEnterExit: boolean;
  // event hooks set by React
  onLandmarkChange?: (id: string | null) => void;
  onArrest?: () => void;
  currentLandmark: string | null;
}

const g = globalThis as unknown as { __gtsWorld?: WorldState };

function spawnDrivables(): Vehicle[] {
  const defs: { kind: VehicleKind; x: number; z: number; heading: number }[] = [
    { kind: "sports", x: 3, z: -14, heading: 0 },
    { kind: "motorcycle", x: -3, z: 14, heading: Math.PI },
    { kind: "van", x: 28, z: 3, heading: -Math.PI / 2 },
    { kind: "truck", x: -28, z: -3, heading: Math.PI / 2 },
    { kind: "electric", x: 0, z: -44, heading: 0 },
  ];
  return defs.map((d, i) => ({
    id: i,
    kind: d.kind,
    x: d.x,
    z: d.z,
    heading: d.heading,
    speed: 0,
    color: VEHICLE[d.kind].color,
    drivable: true,
    aiHeading: d.heading,
    turnCooldown: 0,
  }));
}

function spawnTraffic(count: number): Vehicle[] {
  const kinds: VehicleKind[] = ["sports", "van", "electric", "truck", "motorcycle"];
  const out: Vehicle[] = [];
  for (let i = 0; i < count; i++) {
    // Place on a random road line.
    const onX = Math.random() > 0.5;
    const line = (Math.floor(Math.random() * 7) - 3) * WORLD.blockSize;
    const along = (Math.random() - 0.5) * WORLD.half * 1.6;
    const x = onX ? line : along;
    const z = onX ? along : line;
    const heading = onX ? (Math.random() > 0.5 ? 0 : Math.PI) : Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2;
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    out.push({
      id: 1000 + i,
      kind,
      x,
      z,
      heading,
      speed: 6 + Math.random() * 4,
      color: VEHICLE[kind].color,
      drivable: false,
      aiHeading: heading,
      turnCooldown: 1 + Math.random() * 3,
    });
  }
  return out;
}

const NPC_SHIRTS = ["#ff2d95", "#22e3ff", "#ffd23f", "#1be7b6", "#d916ff", "#f4ecff", "#ff7a00"];
const NPC_SKINS = ["#f6d3b0", "#c68642", "#8d5524", "#e8b58a", "#5a3a22"];

function spawnNpcs(count: number): Npc[] {
  const out: Npc[] = [];
  for (let i = 0; i < count; i++) {
    let x = 0;
    let z = 0;
    let tries = 0;
    do {
      x = (Math.random() - 0.5) * WORLD.half * 1.7;
      z = (Math.random() - 0.5) * WORLD.half * 1.7;
      tries++;
    } while (!isOnRoad(x, z) && tries < 10);
    out.push({
      id: i,
      x,
      z,
      heading: Math.random() * Math.PI * 2,
      vx: 0,
      vz: 0,
      color: NPC_SKINS[i % NPC_SKINS.length],
      shirt: NPC_SHIRTS[i % NPC_SHIRTS.length],
      retargetIn: Math.random() * 3,
      spooked: 0,
    });
  }
  return out;
}

export function getWorld(): WorldState {
  if (g.__gtsWorld) return g.__gtsWorld;
  const buildings = buildCity();
  const colliders = buildings.filter((b) => b.h > 2);
  const world: WorldState = {
    buildings,
    colliders,
    player: { x: 8, z: 0, vx: 0, vz: 0, heading: 0, drivingId: null, speed: 0 },
    vehicles: [...spawnDrivables(), ...spawnTraffic(14)],
    npcs: spawnNpcs(26),
    police: [],
    wanted: 0,
    heat: 0,
    coolTimer: 0,
    input: { forward: 0, strafe: 0, run: false },
    wantEnterExit: false,
    currentLandmark: null,
  };
  g.__gtsWorld = world;
  return world;
}

/** Reset the world to its initial state (used when leaving the game). */
export function resetWorld(): void {
  g.__gtsWorld = undefined;
}
