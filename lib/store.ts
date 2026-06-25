"use client";

import { create } from "zustand";
import { customizationOptions } from "@/lib/gameData";
import type {
  ActiveMission,
  CharacterLoadout,
  LeaderboardEntry,
  Mission,
  Player,
  RewardRecord,
  Vehicle,
} from "@/lib/types";

type PhoneTab = "map" | "contacts" | "leaderboard" | "wallet" | "missions" | "settings";

type Notification = {
  id: string;
  text: string;
  tone: "info" | "success" | "warning" | "danger";
};

type GameState = {
  player: Player | null;
  walletAddress: string | null;
  missions: Mission[];
  activeMission: ActiveMission | null;
  leaderboard: LeaderboardEntry[];
  position: [number, number];
  missionStartPosition: [number, number] | null;
  acceptedAt: number | null;
  distanceTravelled: number;
  maxSpeed: number;
  collisions: number;
  currentVehicle: Vehicle | null;
  isDriving: boolean;
  phoneOpen: boolean;
  phoneTab: PhoneTab;
  dayPhase: number;
  notifications: Notification[];
  loading: boolean;
  setWalletAddress: (walletAddress: string | null) => void;
  syncPlayer: (walletAddress: string) => Promise<void>;
  loadMissions: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  startMission: (mission: Mission) => Promise<void>;
  completeMission: () => Promise<void>;
  claimRewards: () => Promise<void>;
  updateMovement: (position: [number, number], speed: number) => void;
  recordCollision: () => void;
  enterVehicle: (vehicle: Vehicle | null) => void;
  togglePhone: (tab?: PhoneTab) => void;
  setPhoneTab: (tab: PhoneTab) => void;
  tickDayPhase: (delta: number) => void;
  customizeCharacter: (patch: Partial<CharacterLoadout>) => void;
  spendCash: (amount: number, label: string) => boolean;
  dismissNotification: (id: string) => void;
  pushNotification: (text: string, tone?: Notification["tone"]) => void;
};

const notifyId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  walletAddress: null,
  missions: [],
  activeMission: null,
  leaderboard: [],
  position: [0, 0],
  missionStartPosition: null,
  acceptedAt: null,
  distanceTravelled: 0,
  maxSpeed: 0,
  collisions: 0,
  currentVehicle: null,
  isDriving: false,
  phoneOpen: false,
  phoneTab: "missions",
  dayPhase: 0.35,
  notifications: [],
  loading: false,

  setWalletAddress(walletAddress) {
    set({ walletAddress });
  },

  async syncPlayer(walletAddress) {
    set({ loading: true, walletAddress });
    const response = await fetch("/api/player", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    if (!response.ok) throw new Error("Unable to sync player profile.");
    const { player } = (await response.json()) as { player: Player };
    set({ player, loading: false });
    get().pushNotification(`Welcome ${player.handle}`, "success");
  },

  async loadMissions() {
    const response = await fetch("/api/missions");
    const { missions } = (await response.json()) as { missions: Mission[] };
    set({ missions });
  },

  async loadLeaderboard() {
    const response = await fetch("/api/leaderboard");
    const { leaderboard } = (await response.json()) as { leaderboard: LeaderboardEntry[] };
    set({ leaderboard });
  },

  async startMission(mission) {
    const walletAddress = get().walletAddress;
    if (!walletAddress) {
      get().pushNotification("Connect a wallet before accepting missions.", "warning");
      return;
    }
    const response = await fetch("/api/mission/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ walletAddress, missionId: mission.id }),
    });
    const payload = await response.json();
    if (!response.ok) {
      get().pushNotification(payload.error ?? "Mission start failed.", "danger");
      return;
    }
    set({
      player: payload.player,
      activeMission: payload.mission,
      missionStartPosition: get().position,
      acceptedAt: Date.now(),
      distanceTravelled: 0,
      maxSpeed: 0,
      collisions: 0,
      phoneOpen: false,
    });
    get().pushNotification(`Mission accepted: ${mission.title}`, "success");
  },

  async completeMission() {
    const state = get();
    if (!state.activeMission || !state.walletAddress || !state.acceptedAt || !state.missionStartPosition) return;

    const elapsedSeconds = Math.max(1, (Date.now() - state.acceptedAt) / 1000);
    const response = await fetch("/api/mission/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        missionId: state.activeMission.id,
        walletAddress: state.walletAddress,
        elapsedSeconds,
        distanceTravelled: state.distanceTravelled,
        start: state.missionStartPosition,
        finish: state.position,
        maxSpeed: state.maxSpeed,
        collisions: state.collisions,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      get().pushNotification(payload.reasons?.[0] ?? payload.error ?? "Mission verification failed.", "danger");
      return;
    }

    const reward = payload.reward as RewardRecord;
    set({
      player: payload.player,
      activeMission: null,
      missionStartPosition: null,
      acceptedAt: null,
      distanceTravelled: 0,
      maxSpeed: 0,
      collisions: 0,
    });
    get().pushNotification(
      `Verified: +$${reward.cash}, +${reward.reputation} rep${reward.sol ? `, ${reward.sol} SOL pending` : ""}`,
      "success",
    );
    void get().loadLeaderboard();
  },

  async claimRewards() {
    const walletAddress = get().walletAddress;
    if (!walletAddress) {
      get().pushNotification("Connect a wallet before claiming rewards.", "warning");
      return;
    }
    const response = await fetch("/api/rewards/claim", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ walletAddress }),
    });
    const payload = await response.json();
    get().pushNotification(payload.message ?? "Reward claim checked.", "info");
  },

  updateMovement(nextPosition, speed) {
    const [x, z] = get().position;
    const dx = nextPosition[0] - x;
    const dz = nextPosition[1] - z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    set((state) => ({
      position: nextPosition,
      distanceTravelled: state.activeMission ? state.distanceTravelled + distance : state.distanceTravelled,
      maxSpeed: Math.max(state.maxSpeed, speed),
    }));
  },

  recordCollision() {
    set((state) => ({
      collisions: state.collisions + 1,
      player: state.player ? { ...state.player, wantedStars: Math.min(5, state.player.wantedStars + 1) } : state.player,
    }));
    get().pushNotification("Collision reported. Police attention increased.", "warning");
  },

  enterVehicle(vehicle) {
    set({ currentVehicle: vehicle, isDriving: Boolean(vehicle) });
    get().pushNotification(vehicle ? `Entered ${vehicle.name}` : "Exited vehicle", "info");
  },

  togglePhone(tab) {
    set((state) => ({ phoneOpen: !state.phoneOpen, phoneTab: tab ?? state.phoneTab }));
  },

  setPhoneTab(phoneTab) {
    set({ phoneTab });
  },

  tickDayPhase(delta) {
    set((state) => ({ dayPhase: (state.dayPhase + delta * 0.01) % 1 }));
  },

  customizeCharacter(patch) {
    set((state) => {
      if (!state.player) return state;
      const nextCharacter = { ...state.player.character, ...patch };
      return { player: { ...state.player, character: nextCharacter } };
    });
  },

  spendCash(amount, label) {
    const player = get().player;
    if (!player || player.currencies.cash < amount) {
      get().pushNotification(`Not enough cash for ${label}.`, "warning");
      return false;
    }
    set({ player: { ...player, currencies: { ...player.currencies, cash: player.currencies.cash - amount } } });
    get().pushNotification(`Purchased ${label}.`, "success");
    return true;
  },

  dismissNotification(id) {
    set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) }));
  },

  pushNotification(text, tone = "info") {
    const notification = { id: notifyId(), text, tone };
    set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 4) }));
    window.setTimeout(() => get().dismissNotification(notification.id), 4200);
  },
}));

export const characterOptionGroups = customizationOptions;
