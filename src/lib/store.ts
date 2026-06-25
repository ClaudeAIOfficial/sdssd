"use client";

import { create } from "zustand";
import type {
  CharacterAppearance,
  InventoryItem,
  Mission,
  MissionCompletionResult,
  PlayerProfile,
  Vec2,
} from "./types";
import { generateMissions } from "./missions";
import { levelFromXp } from "./economy";
import { defaultAppearance } from "./appearance";
import { STORAGE_KEY } from "./constants";

export type PhoneTab = "map" | "contacts" | "leaderboard" | "wallet" | "missions" | "settings";

export interface Notification {
  id: number;
  title: string;
  body?: string;
  kind: "info" | "success" | "warn" | "reward";
}

export interface ActiveMissionState {
  mission: Mission;
  phase: "to_origin" | "to_target";
  startedAt: number;
  distanceTravelled: number;
}

interface GameState {
  // Profile / economy
  profile: PlayerProfile;
  hydrated: boolean;

  // Wallet
  walletAddress: string | null;

  // Live world telemetry (updated by the scene, read by HUD/minimap).
  playerPos: Vec2;
  playerHeading: number;
  inVehicle: string | null; // vehicle kind label or null
  wanted: number;
  speed: number;

  // Missions
  available: Mission[];
  active: ActiveMissionState | null;

  // Inventory
  inventory: InventoryItem[];

  // UI
  phoneOpen: boolean;
  phoneTab: PhoneTab;
  inventoryOpen: boolean;
  characterCreatorOpen: boolean;
  mapOpen: boolean;
  nearLandmark: string | null;
  paused: boolean;
  started: boolean;

  notifications: Notification[];

  // ---- actions ----
  hydrate: () => void;
  setProfile: (p: Partial<PlayerProfile>) => void;
  setAppearance: (a: Partial<CharacterAppearance>) => void;
  setWallet: (addr: string | null) => void;
  bindServerPlayer: (p: PlayerProfile) => void;

  setPlayerTelemetry: (t: Partial<Pick<GameState, "playerPos" | "playerHeading" | "inVehicle" | "wanted" | "speed">>) => void;
  setNearLandmark: (id: string | null) => void;

  refreshMissions: () => void;
  acceptMission: (id: string) => void;
  abandonMission: () => void;
  advanceMissionPhase: () => void;
  addDistance: (d: number) => void;
  completeActiveMission: () => Promise<MissionCompletionResult | null>;

  addCash: (n: number) => void;
  spendCash: (n: number) => boolean;
  addItem: (item: InventoryItem) => void;
  removeItem: (id: string, qty?: number) => void;

  togglePhone: (open?: boolean) => void;
  setPhoneTab: (tab: PhoneTab) => void;
  toggleInventory: (open?: boolean) => void;
  toggleCharacterCreator: (open?: boolean) => void;
  toggleMap: (open?: boolean) => void;
  setPaused: (p: boolean) => void;
  setStarted: (s: boolean) => void;

  notify: (n: Omit<Notification, "id">) => void;
  dismissNotification: (id: number) => void;

  persist: () => void;
}

let notifId = 0;

function startingInventory(): InventoryItem[] {
  return [
    { id: "phone", name: "GTS Phone", icon: "📱", qty: 1, kind: "phone", description: "Your hub. Press P to open." },
    { id: "backpack", name: "Backpack", icon: "🎒", qty: 1, kind: "backpack", description: "Carries mission items." },
    { id: "wallet", name: "Crypto Wallet", icon: "👛", qty: 1, kind: "wallet", description: "Holds your on-chain SOL." },
    { id: "keys", name: "Vehicle Keys", icon: "🔑", qty: 1, kind: "keys", description: "Start nearby vehicles with F." },
    { id: "food", name: "Energy Bar", icon: "🍫", qty: 2, kind: "food", description: "A quick snack." },
  ];
}

function defaultProfile(): PlayerProfile {
  return {
    id: "local",
    wallet: null,
    handle: "Rookie",
    cash: 500,
    sol: 0,
    xp: 0,
    level: 1,
    reputation: 0,
    missionsCompleted: 0,
    appearance: defaultAppearance(),
    createdAt: new Date().toISOString(),
  };
}

export const useGame = create<GameState>((set, get) => ({
  profile: defaultProfile(),
  hydrated: false,
  walletAddress: null,

  playerPos: { x: -20, z: -8 },
  playerHeading: 0,
  inVehicle: null,
  wanted: 0,
  speed: 0,

  available: [],
  active: null,
  inventory: startingInventory(),

  phoneOpen: false,
  phoneTab: "missions",
  inventoryOpen: false,
  characterCreatorOpen: false,
  mapOpen: false,
  nearLandmark: null,
  paused: false,
  started: false,

  notifications: [],

  hydrate: () => {
    if (get().hydrated) return;
    let profile = get().profile;
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
        profile = { ...profile, ...parsed, appearance: { ...profile.appearance, ...parsed.appearance } };
      }
    } catch {
      // ignore corrupt storage
    }
    const lvl = levelFromXp(profile.xp);
    set({ profile: { ...profile, level: lvl.level }, hydrated: true, available: generateMissions(6) });
  },

  setProfile: (p) => {
    set((s) => ({ profile: { ...s.profile, ...p } }));
    get().persist();
  },

  setAppearance: (a) => {
    set((s) => ({ profile: { ...s.profile, appearance: { ...s.profile.appearance, ...a } } }));
    get().persist();
  },

  setWallet: (addr) => {
    set((s) => ({ walletAddress: addr, profile: { ...s.profile, wallet: addr } }));
    get().persist();
  },

  bindServerPlayer: (p) => {
    // Merge server-authoritative economy values into the local profile.
    set((s) => ({
      profile: {
        ...s.profile,
        id: p.id,
        handle: p.handle,
        cash: p.cash,
        sol: p.sol,
        xp: p.xp,
        level: p.level,
        reputation: p.reputation,
        missionsCompleted: p.missionsCompleted,
        wallet: p.wallet,
      },
    }));
    get().persist();
  },

  setPlayerTelemetry: (t) => set(() => ({ ...t })),
  setNearLandmark: (id) => set({ nearLandmark: id }),

  refreshMissions: () => set({ available: generateMissions(6) }),

  acceptMission: (id) => {
    const m = get().available.find((x) => x.id === id);
    if (!m) return;
    if (get().active) {
      get().notify({ title: "Finish your current job first", kind: "warn" });
      return;
    }
    set((s) => ({
      active: { mission: m, phase: "to_origin", startedAt: Date.now(), distanceTravelled: 0 },
      available: s.available.filter((x) => x.id !== id),
      phoneOpen: false,
    }));
    get().notify({ title: "Mission accepted", body: m.title, kind: "info" });
  },

  abandonMission: () => {
    if (!get().active) return;
    set({ active: null });
    get().notify({ title: "Mission abandoned", kind: "warn" });
  },

  advanceMissionPhase: () => {
    set((s) => (s.active ? { active: { ...s.active, phase: "to_target" } } : {}));
  },

  addDistance: (d) => {
    set((s) => (s.active ? { active: { ...s.active, distanceTravelled: s.active.distanceTravelled + d } } : {}));
  },

  completeActiveMission: async () => {
    const state = get();
    const active = state.active;
    if (!active) return null;
    const m = active.mission;

    const payload = {
      playerId: state.profile.id,
      wallet: state.walletAddress,
      missionId: m.id,
      missionType: m.type,
      difficulty: m.difficulty,
      startedAt: active.startedAt,
      finishedAt: Date.now(),
      distanceTravelled: Math.round(active.distanceTravelled),
      origin: m.origin,
      target: m.target,
      declaredReward: m.reward,
    };

    try {
      const res = await fetch("/api/missions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as MissionCompletionResult;
      if (data.ok && data.granted) {
        const g = data.granted;
        set((s) => {
          const xp = s.profile.xp + g.xp;
          const lvl = levelFromXp(xp);
          return {
            active: null,
            profile: {
              ...s.profile,
              cash: s.profile.cash + g.cash,
              sol: s.profile.sol + g.sol,
              xp,
              level: lvl.level,
              reputation: s.profile.reputation + g.reputation,
              missionsCompleted: s.profile.missionsCompleted + 1,
            },
          };
        });
        get().persist();
        get().notify({
          title: "Mission complete!",
          body: `+$${g.cash}  +${g.xp} XP  +${g.reputation} REP${g.sol > 0 ? `  +${g.sol} SOL` : ""}`,
          kind: "reward",
        });
        // Top up the mission board.
        if (get().available.length < 4) get().refreshMissions();
      } else {
        set({ active: null });
        get().notify({ title: "Mission rejected", body: data.reason ?? "Verification failed", kind: "warn" });
      }
      return data;
    } catch {
      set({ active: null });
      get().notify({ title: "Network error", body: "Could not verify mission.", kind: "warn" });
      return null;
    }
  },

  addCash: (n) => {
    set((s) => ({ profile: { ...s.profile, cash: Math.max(0, s.profile.cash + n) } }));
    get().persist();
  },

  spendCash: (n) => {
    if (get().profile.cash < n) {
      get().notify({ title: "Not enough cash", kind: "warn" });
      return false;
    }
    set((s) => ({ profile: { ...s.profile, cash: s.profile.cash - n } }));
    get().persist();
    return true;
  },

  addItem: (item) =>
    set((s) => {
      const existing = s.inventory.find((i) => i.id === item.id);
      if (existing) {
        return {
          inventory: s.inventory.map((i) => (i.id === item.id ? { ...i, qty: i.qty + item.qty } : i)),
        };
      }
      return { inventory: [...s.inventory, item] };
    }),

  removeItem: (id, qty = 1) =>
    set((s) => ({
      inventory: s.inventory
        .map((i) => (i.id === id ? { ...i, qty: i.qty - qty } : i))
        .filter((i) => i.qty > 0),
    })),

  togglePhone: (open) =>
    set((s) => {
      const phoneOpen = open ?? !s.phoneOpen;
      return { phoneOpen, paused: phoneOpen, inventoryOpen: false };
    }),
  setPhoneTab: (tab) => set({ phoneTab: tab, phoneOpen: true, paused: true }),
  toggleInventory: (open) =>
    set((s) => {
      const inventoryOpen = open ?? !s.inventoryOpen;
      return { inventoryOpen, paused: inventoryOpen, phoneOpen: false };
    }),
  toggleCharacterCreator: (open) =>
    set((s) => {
      const characterCreatorOpen = open ?? !s.characterCreatorOpen;
      return { characterCreatorOpen, paused: characterCreatorOpen };
    }),
  toggleMap: (open) =>
    set((s) => {
      const mapOpen = open ?? !s.mapOpen;
      return { mapOpen, paused: mapOpen };
    }),
  setPaused: (paused) => set({ paused }),
  setStarted: (started) => set({ started }),

  notify: (n) => {
    const id = ++notifId;
    set((s) => ({ notifications: [...s.notifications, { ...n, id }] }));
    setTimeout(() => get().dismissNotification(id), 4500);
  },
  dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter((x) => x.id !== id) })),

  persist: () => {
    try {
      const p = get().profile;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
      }
    } catch {
      // ignore quota errors
    }
  },
}));
