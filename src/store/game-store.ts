"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalPlayer, missionTemplates, nextMission, vehicles } from "@/lib/game-data";
import type { CurrencyLedger, Mission, PlayerCosmetics, PlayerProfile, VehicleKind } from "@/lib/types";

type Position = [number, number];

type ActiveMission = {
  mission: Mission;
  startedAt: number;
  distanceTravelled: number;
  lastPosition: Position;
  maxSpeed: number;
};

type GameState = {
  player: PlayerProfile;
  activeMission?: ActiveMission;
  selectedVehicle: VehicleKind;
  inVehicle: boolean;
  phoneOpen: boolean;
  adminUnlocked: boolean;
  dayTime: number;
  position: Position;
  lastMovementAt: number;
  crimes: number;
  createPlayer: (walletAddress?: string) => void;
  updateCosmetics: (cosmetics: Partial<PlayerCosmetics>) => void;
  setPosition: (position: Position) => void;
  toggleVehicle: () => void;
  selectVehicle: (vehicle: VehicleKind) => void;
  buyVehicle: (vehicle: VehicleKind) => boolean;
  startMission: (mission?: Mission) => void;
  completeMissionClient: (rewards: CurrencyLedger, missionId: string) => void;
  failMission: () => void;
  togglePhone: () => void;
  setAdminUnlocked: (unlocked: boolean) => void;
  tickWorld: (delta: number) => void;
  addWantedStar: () => void;
  coolWantedLevel: () => void;
};

const zeroLedger: CurrencyLedger = { cash: 0, sol: 0, xp: 0, reputation: 0 };

function addLedger(a: CurrencyLedger, b: CurrencyLedger): CurrencyLedger {
  return {
    cash: Math.round(a.cash + b.cash),
    sol: Number((a.sol + b.sol).toFixed(6)),
    xp: Math.round(a.xp + b.xp),
    reputation: Math.round(a.reputation + b.reputation)
  };
}

function distance(a: Position, b: Position) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      player: createLocalPlayer(),
      selectedVehicle: "electric",
      inVehicle: false,
      phoneOpen: false,
      adminUnlocked: false,
      dayTime: 0.32,
      position: [0, 0],
      lastMovementAt: Date.now(),
      crimes: 0,
      createPlayer: (walletAddress) =>
        set((state) => ({
          player: {
            ...createLocalPlayer(walletAddress),
            cosmetics: state.player.cosmetics,
            ledger: addLedger(createLocalPlayer(walletAddress).ledger, {
              ...zeroLedger,
              cash: Math.max(0, state.player.ledger.cash - 1250),
              sol: state.player.ledger.sol,
              xp: state.player.ledger.xp,
              reputation: state.player.ledger.reputation
            }),
            completedMissions: state.player.completedMissions
          }
        })),
      updateCosmetics: (cosmetics) =>
        set((state) => ({
          player: {
            ...state.player,
            cosmetics: { ...state.player.cosmetics, ...cosmetics }
          }
        })),
      setPosition: (position) =>
        set((state) => {
          const now = Date.now();
          const elapsed = Math.max(0.1, (now - state.lastMovementAt) / 1000);
          const moved = distance(state.position, position);
          const speed = moved / elapsed;
          const activeMission = state.activeMission
            ? {
                ...state.activeMission,
                distanceTravelled: state.activeMission.distanceTravelled + moved,
                lastPosition: position,
                maxSpeed: Math.max(state.activeMission.maxSpeed, speed)
              }
            : undefined;

          return { position, lastMovementAt: now, activeMission };
        }),
      toggleVehicle: () => set((state) => ({ inVehicle: !state.inVehicle })),
      selectVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      buyVehicle: (vehicle) => {
        const catalogVehicle = vehicles.find((candidate) => candidate.id === vehicle);
        const state = get();

        if (!catalogVehicle || state.player.ownedVehicles.includes(vehicle) || state.player.ledger.cash < catalogVehicle.price) {
          return false;
        }

        set({
          player: {
            ...state.player,
            ledger: { ...state.player.ledger, cash: state.player.ledger.cash - catalogVehicle.price },
            ownedVehicles: [...state.player.ownedVehicles, vehicle]
          },
          selectedVehicle: vehicle
        });

        return true;
      },
      startMission: (mission) => {
        const chosenMission = mission ?? nextMission(get().player.completedMissions);
        set((state) => ({
          activeMission: {
            mission: chosenMission,
            startedAt: Date.now(),
            distanceTravelled: 0,
            lastPosition: state.position,
            maxSpeed: 0
          },
          phoneOpen: false
        }));
      },
      completeMissionClient: (rewards, missionId) =>
        set((state) => ({
          player: {
            ...state.player,
            ledger: addLedger(state.player.ledger, rewards),
            completedMissions: Array.from(new Set([...state.player.completedMissions, missionId])),
            wantedStars: Math.max(0, state.player.wantedStars - 1)
          },
          activeMission: undefined
        })),
      failMission: () => set({ activeMission: undefined }),
      togglePhone: () => set((state) => ({ phoneOpen: !state.phoneOpen })),
      setAdminUnlocked: (unlocked) => set({ adminUnlocked: unlocked }),
      tickWorld: (delta) =>
        set((state) => ({
          dayTime: (state.dayTime + delta * 0.006) % 1
        })),
      addWantedStar: () =>
        set((state) => ({
          crimes: state.crimes + 1,
          player: { ...state.player, wantedStars: Math.min(5, state.player.wantedStars + 1) }
        })),
      coolWantedLevel: () =>
        set((state) => ({
          player: { ...state.player, wantedStars: Math.max(0, state.player.wantedStars - 1) }
        }))
    }),
    {
      name: "gts-city-state",
      partialize: (state) => ({
        player: state.player,
        selectedVehicle: state.selectedVehicle,
        adminUnlocked: state.adminUnlocked
      })
    }
  )
);

export { missionTemplates };
