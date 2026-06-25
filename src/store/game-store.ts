"use client";

import { create } from "zustand";
import { CITY_RADIUS, DEFAULT_MISSIONS, VEHICLE_SPEED } from "@/lib/constants";
import {
  ActiveMission,
  InventoryItem,
  MissionDefinition,
  MissionReport,
  MissionReward,
  NpcState,
  PlayerCustomization,
  PoiType,
  Vec2,
  VehicleState,
} from "@/lib/types";
import { clamp, distance2d, randomId, randomMission } from "@/lib/utils";

const INITIAL_PLAYER_POS: Vec2 = { x: 0, z: 0 };

const initialCustomization: PlayerCustomization = {
  hair: "buzz",
  clothes: "street",
  shoes: "sneakers",
  skinTone: "tan",
};

const initialVehicles = (): VehicleState[] => [
  {
    id: "vehicle-sport-1",
    type: "sports_car",
    position: { x: -8, z: -12 },
    heading: 0,
    speed: 0,
    playerOwned: false,
    occupiedByPlayer: false,
  },
  {
    id: "vehicle-bike-1",
    type: "motorcycle",
    position: { x: -18, z: 6 },
    heading: Math.PI / 2,
    speed: 0,
    playerOwned: false,
    occupiedByPlayer: false,
  },
  {
    id: "vehicle-van-1",
    type: "van",
    position: { x: 18, z: 12 },
    heading: Math.PI,
    speed: 0,
    playerOwned: false,
    occupiedByPlayer: false,
  },
  {
    id: "vehicle-truck-1",
    type: "truck",
    position: { x: 34, z: -16 },
    heading: 0.1,
    speed: 0,
    playerOwned: false,
    occupiedByPlayer: false,
  },
  {
    id: "vehicle-electric-1",
    type: "electric_car",
    position: { x: -28, z: -24 },
    heading: 0.8,
    speed: 0,
    playerOwned: false,
    occupiedByPlayer: false,
  },
];

const initialNpcs = (): NpcState[] =>
  ([
    { x: -12, z: 22, role: "mission_giver", dialogue: "Need work? I pay in crypto." },
    { x: 8, z: 18, role: "civilian", dialogue: "Traffic is wild today." },
    { x: -30, z: -14, role: "police", dialogue: "Keep it legal, citizen." },
    { x: 44, z: -24, role: "gang", dialogue: "Watch your back in this district." },
    { x: 60, z: 10, role: "civilian", dialogue: "The casino lights never sleep." },
  ] as const).map((npc, index) => ({
    id: `npc-${index + 1}`,
    role: npc.role,
    name: ["Milo", "Vera", "Officer Rey", "Dax", "Nova"][index] ?? `Citizen ${index + 1}`,
    position: { x: npc.x, z: npc.z },
    heading: Math.random() * Math.PI * 2,
    mood: "neutral" as const,
    dialogue: npc.dialogue,
  }));

const starterInventory: InventoryItem[] = [
  "phone",
  "backpack",
  "crypto_wallet",
  "keys",
  "food",
];

type GameStore = {
  started: boolean;
  walletAddress?: string;
  playerPosition: Vec2;
  playerHeading: number;
  playerVehicleId?: string;
  activeInterior: PoiType | null;
  customization: PlayerCustomization;
  inventory: InventoryItem[];
  stats: {
    cash: number;
    sol: number;
    xp: number;
    reputation: number;
    wantedLevel: 0 | 1 | 2 | 3 | 4 | 5;
  };
  vehicles: VehicleState[];
  npcs: NpcState[];
  availableMissions: MissionDefinition[];
  activeMission: ActiveMission | null;
  completedMissions: number;
  pendingMissionReport: MissionReport | null;
  lastReward: MissionReward | null;
  phoneOpen: boolean;
  walletOpen: boolean;
  leaderboardOpen: boolean;
  dayTime: number;
  notifications: string[];
  startGame: () => void;
  setWalletAddress: (walletAddress?: string) => void;
  setCustomization: (patch: Partial<PlayerCustomization>) => void;
  togglePhone: () => void;
  toggleWalletPanel: () => void;
  toggleLeaderboard: () => void;
  enterBuilding: (poi: PoiType) => void;
  exitBuilding: () => void;
  applyMovement: (direction: Vec2, delta: number, isRunning: boolean) => void;
  tickWorld: (delta: number) => void;
  registerCrime: (amount?: number) => void;
  enterNearestVehicle: () => void;
  exitVehicle: () => void;
  interactWithNpc: () => string | null;
  acceptMission: (missionId: string) => void;
  addRandomMission: () => void;
  reportMissionCompleted: () => void;
  clearPendingReport: () => void;
  applyMissionReward: (reward: MissionReward) => void;
  claimSolReward: (sol: number) => void;
  dismissNotification: () => void;
};

const clampToCity = (position: Vec2): Vec2 => ({
  x: clamp(position.x, -CITY_RADIUS, CITY_RADIUS),
  z: clamp(position.z, -CITY_RADIUS, CITY_RADIUS),
});

export const useGameStore = create<GameStore>((set, get) => ({
  started: false,
  walletAddress: undefined,
  playerPosition: INITIAL_PLAYER_POS,
  playerHeading: 0,
  playerVehicleId: undefined,
  activeInterior: null,
  customization: initialCustomization,
  inventory: starterInventory,
  stats: {
    cash: 500,
    sol: 0,
    xp: 0,
    reputation: 0,
    wantedLevel: 0,
  },
  vehicles: initialVehicles(),
  npcs: initialNpcs(),
  availableMissions: [...DEFAULT_MISSIONS, randomMission(), randomMission()],
  activeMission: null,
  completedMissions: 0,
  pendingMissionReport: null,
  lastReward: null,
  phoneOpen: false,
  walletOpen: false,
  leaderboardOpen: false,
  dayTime: 12,
  notifications: ["Welcome to Grand Theft Solana. Press P for your phone."],

  startGame: () => set({ started: true }),
  setWalletAddress: (walletAddress) => set({ walletAddress }),
  setCustomization: (patch) =>
    set((state) => ({ customization: { ...state.customization, ...patch } })),
  togglePhone: () => set((state) => ({ phoneOpen: !state.phoneOpen })),
  toggleWalletPanel: () => set((state) => ({ walletOpen: !state.walletOpen })),
  toggleLeaderboard: () => set((state) => ({ leaderboardOpen: !state.leaderboardOpen })),
  enterBuilding: (poi) =>
    set({
      activeInterior: poi,
      notifications: [`Entered ${poi.replace("_", " ")}.`],
    }),
  exitBuilding: () => set({ activeInterior: null }),

  applyMovement: (direction, delta, isRunning) =>
    set((state) => {
      const heading = Math.atan2(direction.x, direction.z);
      const mission = state.activeMission;
      if (state.playerVehicleId) {
        const vehicles = state.vehicles.map((vehicle) => {
          if (vehicle.id !== state.playerVehicleId) {
            return vehicle;
          }
          const speedBase = VEHICLE_SPEED[vehicle.type] * (isRunning ? 1.1 : 0.85);
          const speed = Math.hypot(direction.x, direction.z) * speedBase;
          const nextPos = clampToCity({
            x: vehicle.position.x + direction.x * speed * delta,
            z: vehicle.position.z + direction.z * speed * delta,
          });
          return {
            ...vehicle,
            heading: speed > 0.01 ? heading : vehicle.heading,
            speed,
            position: nextPos,
          };
        });
        const playerVehicle = vehicles.find((vehicle) => vehicle.id === state.playerVehicleId);
        if (!playerVehicle) {
          return state;
        }
        return {
          vehicles,
          playerPosition: playerVehicle.position,
          playerHeading: playerVehicle.heading,
          activeMission: mission
            ? {
                ...mission,
                distanceTravelled:
                  mission.distanceTravelled +
                  Math.hypot(direction.x, direction.z) * VEHICLE_SPEED[playerVehicle.type] * delta,
              }
            : mission,
        };
      }

      const baseSpeed = isRunning ? 15 : 9;
      const velocity = Math.hypot(direction.x, direction.z) * baseSpeed;
      const nextPosition = clampToCity({
        x: state.playerPosition.x + direction.x * baseSpeed * delta,
        z: state.playerPosition.z + direction.z * baseSpeed * delta,
      });
      return {
        playerPosition: nextPosition,
        playerHeading: velocity > 0.01 ? heading : state.playerHeading,
        activeMission: mission
          ? {
              ...mission,
              distanceTravelled:
                mission.distanceTravelled + Math.hypot(direction.x, direction.z) * baseSpeed * delta,
            }
          : mission,
      };
    }),

  tickWorld: (delta) =>
    set((state) => {
      const npcs = state.npcs.map((npc) => {
        if (npc.role === "mission_giver") {
          return npc;
        }
        const heading = npc.heading + (Math.random() - 0.5) * 0.35 * delta;
        const speed = npc.role === "police" ? 3.4 : 2.2;
        const next = clampToCity({
          x: npc.position.x + Math.sin(heading) * speed * delta,
          z: npc.position.z + Math.cos(heading) * speed * delta,
        });
        return {
          ...npc,
          heading,
          position: next,
        };
      });

      const vehicles = state.vehicles.map((vehicle) => {
        if (vehicle.occupiedByPlayer) {
          return vehicle;
        }
        const nextHeading = vehicle.heading + (Math.random() - 0.5) * 0.16 * delta;
        const autopilotSpeed = VEHICLE_SPEED[vehicle.type] * 0.15;
        return {
          ...vehicle,
          heading: nextHeading,
          speed: autopilotSpeed,
          position: clampToCity({
            x: vehicle.position.x + Math.sin(nextHeading) * autopilotSpeed * delta,
            z: vehicle.position.z + Math.cos(nextHeading) * autopilotSpeed * delta,
          }),
        };
      });

      const wantedDecay = clamp(
        state.stats.wantedLevel - (state.stats.wantedLevel > 0 ? delta * 0.025 : 0),
        0,
        5,
      ) as 0 | 1 | 2 | 3 | 4 | 5;

      return {
        npcs,
        vehicles,
        dayTime: (state.dayTime + delta * 0.08) % 24,
        stats: {
          ...state.stats,
          wantedLevel: wantedDecay,
        },
      };
    }),

  registerCrime: (amount = 1) =>
    set((state) => ({
      stats: {
        ...state.stats,
        wantedLevel: clamp(state.stats.wantedLevel + amount, 0, 5) as 0 | 1 | 2 | 3 | 4 | 5,
      },
      notifications: ["Police notified. Escape to lose wanted level."],
    })),

  enterNearestVehicle: () =>
    set((state) => {
      if (state.playerVehicleId) {
        return state;
      }
      let nearest: VehicleState | null = null;
      let nearestDistance = Number.POSITIVE_INFINITY;
      for (const vehicle of state.vehicles) {
        const d = distance2d(vehicle.position, state.playerPosition);
        if (d < nearestDistance) {
          nearest = vehicle;
          nearestDistance = d;
        }
      }
      if (!nearest || nearestDistance > 8) {
        return { notifications: ["No vehicle close enough."] };
      }
      return {
        playerVehicleId: nearest.id,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === nearest.id ? { ...vehicle, occupiedByPlayer: true } : vehicle,
        ),
        notifications: [`Driving ${nearest.type.replace("_", " ")}.`],
      };
    }),

  exitVehicle: () =>
    set((state) => {
      if (!state.playerVehicleId) {
        return state;
      }
      return {
        playerVehicleId: undefined,
        vehicles: state.vehicles.map((vehicle) =>
          vehicle.id === state.playerVehicleId ? { ...vehicle, occupiedByPlayer: false } : vehicle,
        ),
        notifications: ["Exited vehicle."],
      };
    }),

  interactWithNpc: () => {
    const state = get();
    const nearby = state.npcs.find((npc) => distance2d(npc.position, state.playerPosition) < 8);
    if (!nearby) {
      set({ notifications: ["No nearby NPC to talk with."] });
      return null;
    }
    if (nearby.role === "mission_giver" && !state.activeMission) {
      const mission = randomMission();
      set({
        availableMissions: [mission, ...state.availableMissions].slice(0, 8),
        notifications: [`${nearby.name}: "${nearby.dialogue}"`],
      });
    } else {
      set({ notifications: [`${nearby.name}: "${nearby.dialogue}"`] });
    }
    return nearby.id;
  },

  acceptMission: (missionId) =>
    set((state) => {
      const mission = state.availableMissions.find((item) => item.id === missionId);
      if (!mission) {
        return state;
      }
      const accepted: ActiveMission = {
        ...mission,
        acceptedAt: Date.now(),
        acceptedPosition: state.playerPosition,
        distanceTravelled: 0,
      };
      return {
        activeMission: accepted,
        notifications: [`Mission started: ${mission.title}`],
      };
    }),

  addRandomMission: () =>
    set((state) => ({
      availableMissions: [randomMission(), ...state.availableMissions].slice(0, 10),
    })),

  reportMissionCompleted: () =>
    set((state) => {
      if (!state.activeMission) {
        return state;
      }
      const mission = state.activeMission;
      const now = Date.now();
      const report: MissionReport = {
        missionId: `${mission.id}-${randomId("run")}`,
        missionType: mission.type,
        walletAddress: state.walletAddress,
        startedAt: mission.acceptedAt,
        completedAt: now,
        elapsedSeconds: (now - mission.acceptedAt) / 1000,
        distanceTravelled: mission.distanceTravelled,
        startPosition: mission.acceptedPosition,
        endPosition: state.playerPosition,
        wantedLevelDuringMission: state.stats.wantedLevel,
      };
      return {
        activeMission: null,
        pendingMissionReport: report,
        notifications: ["Mission complete. Verifying reward..."],
      };
    }),

  clearPendingReport: () => set({ pendingMissionReport: null }),

  applyMissionReward: (reward) =>
    set((state) => ({
      stats: {
        ...state.stats,
        cash: state.stats.cash + reward.cash,
        xp: state.stats.xp + reward.xp,
        reputation: state.stats.reputation + reward.reputation,
        sol: state.stats.sol + reward.sol,
      },
      completedMissions: state.completedMissions + 1,
      lastReward: reward,
      pendingMissionReport: null,
      availableMissions: [randomMission(), ...state.availableMissions].slice(0, 10),
      notifications: [
        `Mission reward: +$${reward.cash}, +${reward.xp} XP, +${reward.reputation} REP${
          reward.sol > 0 ? `, +${reward.sol.toFixed(4)} SOL` : ""
        }`,
      ],
    })),

  claimSolReward: (sol) =>
    set((state) => ({
      stats: {
        ...state.stats,
        sol: state.stats.sol + sol,
      },
      notifications: [`Claimed ${sol.toFixed(4)} SOL reward.`],
    })),

  dismissNotification: () => set({ notifications: [] }),
}));

